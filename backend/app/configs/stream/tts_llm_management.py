import base64
import io
import json
import re
from typing import Iterator

from langchain_core.messages import AIMessage, HumanMessage, SystemMessage
from kokoro import KPipeline
import soundfile as sf
import torch

from app.configs.llm.chat_management import ChatManagement
from app.configs.tts.kokoro.config import LANGUAGE_MAP
from app.configs.tts.tts_management import TTSManagement


PAUSE_MARKER_RE = re.compile(r"[,.;:!?،、，；：।。！？\n]")
STRONG_PAUSE_MARKERS = {".", "!", "?", "।", "。", "！", "？", "\n"}
TRAILING_PAUSE_RE = re.compile(r"[,.;:!?،、，；：।。！？\s]+$")
MIN_CHUNK_TEXT_LENGTH = 8


class TTSLLMManagement:
    def __init__(
        self,
        llm_service_name,
        system_prompt,
        user_chat,
        llm_model,
        top_p,
        top_k,
        temperature,
        reason,
        session_id,
        tts_service_name,
        name,
        language,
        instruct,
        tts_model_name,
    ):
        self.llm_service_name = llm_service_name
        self.system_prompt = system_prompt
        self.user_chat = user_chat
        self.llm_model = llm_model
        self.top_p = top_p
        self.top_k = top_k
        self.temperature = temperature
        self.reason = reason
        self.session_id = session_id
        self.tts_service_name = tts_service_name
        self.name = name
        self.language = language
        self.instruct = instruct
        self.tts_model_name = tts_model_name
        self._kokoro_pipeline = None
        self._resolved_language = language

    def _build_chat_management(self, stream: bool = True, system_prompt: str | None = None) -> ChatManagement:
        return ChatManagement(
            service_name=self.llm_service_name,
            system_prompt=system_prompt if system_prompt is not None else self.system_prompt,
            user_chat=self.user_chat,
            model=self.llm_model,
            top_p=self.top_p,
            top_k=self.top_k,
            temp=self.temperature,
            stream=stream,
            reason=self.reason,
            session_id=self.session_id,
        )

    def _detect_kokoro_language(self) -> str:
        detector_llm = self._build_chat_management(stream=False).service_provider_selector()
        fallback_language = (
            (self.language or "").strip().lower()
            if (self.language or "").strip().lower() in LANGUAGE_MAP
            else "english"
        )

        detector_messages = [
            SystemMessage(
                content=(
                    "Classify the best response language for this assistant reply. "
                    "Return exactly one word: english or japanese."
                )
            ),
            HumanMessage(
                content=(
                    f"User message: {self.user_chat}\n"
                    f"Preferred language hint: {self.language or 'none'}\n"
                    "Reply with only english or japanese."
                )
            ),
        ]

        try:
            response = detector_llm.invoke(detector_messages)
            normalized = (getattr(response, "content", "") or "").strip().lower()
        except Exception:
            normalized = ""

        if "japanese" in normalized:
            return "japanese"
        if "english" in normalized:
            return "english"
        return fallback_language

    def _get_effective_language(self) -> str:
        if not self._is_kokoro_service():
            return self.language

        if (self._resolved_language or "").strip().lower() in LANGUAGE_MAP:
            return self._resolved_language

        self._resolved_language = self._detect_kokoro_language()
        return self._resolved_language

    def _build_stream_system_prompt(self) -> str | None:
        effective_language = self._get_effective_language()
        base_prompt = self.system_prompt or "You are a friendly assistant that helps users"

        if not self._is_kokoro_service():
            return base_prompt

        return (
            f"{base_prompt}\n"
            f"Respond only in {effective_language}. "
            f"Keep the wording natural for spoken audio output."
        )

    def _normalized_text_length(self, text: str) -> int:
        return len(re.sub(r"\W+", "", text or ""))

    def _extract_ready_text(self, buffer: str, force_flush: bool = False) -> tuple[str | None, str]:
        search_from = 0

        while search_from < len(buffer):
            match = PAUSE_MARKER_RE.search(buffer, search_from)
            if not match:
                break

            candidate_end = match.end()
            while candidate_end < len(buffer) and buffer[candidate_end] in "\"')]} \t\r\n":
                candidate_end += 1

            candidate = buffer[:candidate_end].strip()
            marker = match.group(0)
            normalized_length = self._normalized_text_length(candidate)
            is_strong_pause = marker in STRONG_PAUSE_MARKERS

            if candidate and (is_strong_pause or normalized_length >= MIN_CHUNK_TEXT_LENGTH):
                return candidate, buffer[candidate_end:]

            search_from = candidate_end

        if not force_flush:
            return None, buffer

        trailing_text = buffer.strip()
        if not trailing_text:
            return None, ""

        return trailing_text, ""

    def _prepare_text_for_tts(self, text: str) -> str:
        normalized_text = " ".join((text or "").split()).strip()
        normalized_text = TRAILING_PAUSE_RE.sub("", normalized_text).strip()
        return normalized_text

    def _is_kokoro_service(self) -> bool:
        return (self.tts_service_name or "").strip().lower() == "kokoro"

    def _get_kokoro_pipeline(self) -> KPipeline:
        if self._kokoro_pipeline is not None:
            return self._kokoro_pipeline

        language_code = LANGUAGE_MAP.get((self._get_effective_language() or "").strip().lower())
        if language_code is None:
            raise ValueError(f"Unsupported Kokoro language: {self._get_effective_language()}")

        device = "cuda" if torch.cuda.is_available() else "cpu"
        self._kokoro_pipeline = KPipeline(
            lang_code=language_code,
            repo_id="hexgrad/Kokoro-82M",
            device=device,
        )
        return self._kokoro_pipeline

    def _encode_audio_chunk(self, audio_data) -> str:
        if audio_data is None:
            raise ValueError("No audio data was produced")

        if hasattr(audio_data, "detach"):
            audio_data = audio_data.detach().cpu().numpy()

        buffer = io.BytesIO()
        sf.write(buffer, audio_data, 24000, format="WAV")
        buffer.seek(0)
        audio_bytes = buffer.read()
        if not audio_bytes:
            raise ValueError("Audio chunk was empty")
        return base64.b64encode(audio_bytes).decode("ascii")

    def _stream_native_kokoro_audio(self, text: str) -> list[str]:
        prepared_text = self._prepare_text_for_tts(text)
        if not prepared_text:
            return []

        pipeline = self._get_kokoro_pipeline()
        audio_chunks: list[str] = []

        for result in pipeline(prepared_text, voice=self.name, split_pattern=None):
            if result.audio is None:
                continue
            audio_chunks.append(self._encode_audio_chunk(result.audio))

        return audio_chunks

    def _synthesize_sentence_audio(self, sentence: str) -> str:
        prepared_text = self._prepare_text_for_tts(sentence)
        if not prepared_text:
            raise ValueError("No speakable text was available for audio generation")

        audio_buffer = TTSManagement(
            service_name=self.tts_service_name,
            name=self.name,
            language=self._get_effective_language(),
            text=prepared_text,
            instruct=self.instruct,
            model_name=self.tts_model_name,
            stream=False,
        ).service_selector()

        audio_buffer.seek(0)
        audio_bytes = audio_buffer.read()
        if not audio_bytes:
            raise ValueError("TTS provider returned empty audio")
        return base64.b64encode(audio_bytes).decode("ascii")

    def _yield_audio_chunks(self, buffer: str, sentence_index: int) -> tuple[list[str], str, int]:
        audio_events: list[str] = []
        remaining_buffer = buffer
        next_index = sentence_index

        while True:
            candidate_text, next_buffer = self._extract_ready_text(remaining_buffer)
            if candidate_text is None:
                break

            try:
                if self._is_kokoro_service():
                    native_chunks = self._stream_native_kokoro_audio(candidate_text)
                    if not native_chunks:
                        break

                    for native_chunk in native_chunks:
                        audio_events.append(
                            json.dumps(
                                {
                                    "type": "audio",
                                    "index": next_index,
                                    "audio": native_chunk,
                                    "mime_type": "audio/wav",
                                }
                            )
                            + "\n"
                        )
                        next_index += 1
                else:
                    audio_events.append(
                        json.dumps(
                            {
                                "type": "audio",
                                "index": next_index,
                                "audio": self._synthesize_sentence_audio(candidate_text),
                                "mime_type": "audio/wav",
                            }
                        )
                        + "\n"
                    )
                    next_index += 1

                remaining_buffer = next_buffer
            except ValueError:
                break

        return audio_events, remaining_buffer, next_index

    def call_streaming_tts_llm_inference(self) -> Iterator[str]:
        chat_management = self._build_chat_management(
            system_prompt=self._build_stream_system_prompt(),
        )
        messages = chat_management.build_messages()
        llm = chat_management.service_provider_selector()
        history = chat_management.session_management()

        content_chunks: list[str] = []
        reasoning_chunks: list[str] = []
        pending_sentence_buffer = ""
        final_response_metadata = {}
        final_usage_metadata = {}
        sentence_index = 0

        for chunk in llm.stream(messages):
            text = getattr(chunk, "content", "")
            chunk_message = getattr(chunk, "message", chunk)
            chunk_additional_kwargs = getattr(chunk_message, "additional_kwargs", {}) or {}
            chunk_usage_metadata = getattr(chunk_message, "usage_metadata", {}) or {}
            chunk_generation_info = getattr(chunk, "generation_info", {}) or {}
            reasoning_text = chunk_additional_kwargs.get("reasoning_content", "")

            if reasoning_text:
                reasoning_chunks.append(reasoning_text)

            if text:
                content_chunks.append(text)
                pending_sentence_buffer += text

                audio_events, pending_sentence_buffer, sentence_index = self._yield_audio_chunks(
                    pending_sentence_buffer,
                    sentence_index,
                )
                for audio_event in audio_events:
                    yield audio_event

            if chunk_generation_info:
                final_response_metadata = chunk_generation_info

            if chunk_usage_metadata:
                final_usage_metadata = dict(chunk_usage_metadata)

        trailing_sentence, pending_sentence_buffer = self._extract_ready_text(
            pending_sentence_buffer,
            force_flush=True,
        )
        if trailing_sentence and self._normalized_text_length(trailing_sentence) > 0:
            if self._is_kokoro_service():
                native_chunks = self._stream_native_kokoro_audio(trailing_sentence)
                if native_chunks:
                    for native_chunk in native_chunks:
                        yield json.dumps(
                            {
                                "type": "audio",
                                "index": sentence_index,
                                "audio": native_chunk,
                                "mime_type": "audio/wav",
                            }
                        ) + "\n"
                        sentence_index += 1
                else:
                    yield json.dumps(
                        {
                            "type": "audio",
                            "index": sentence_index,
                            "audio": self._synthesize_sentence_audio(trailing_sentence),
                            "mime_type": "audio/wav",
                        }
                    ) + "\n"
            else:
                yield json.dumps(
                    {
                        "type": "audio",
                        "index": sentence_index,
                        "audio": self._synthesize_sentence_audio(trailing_sentence),
                        "mime_type": "audio/wav",
                    }
                ) + "\n"

        full_content = "".join(content_chunks)
        full_reasoning = "".join(reasoning_chunks)
        history.add_messages(
            [
                HumanMessage(content=self.user_chat),
                AIMessage(
                    content=full_content,
                    additional_kwargs={"reasoning_content": full_reasoning}
                    if full_reasoning
                    else {},
                ),
            ]
        )

        yield json.dumps(
            {
                "type": "final",
                "text": full_content,
                "reasoning_content": full_reasoning,
                "language": self._get_effective_language(),
                "response_metadata": final_response_metadata,
                "usage_metadata": final_usage_metadata,
            }
        ) + "\n"
