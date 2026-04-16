from app.configs.tts.kokoro.config import call_tts as kokoro_tts
from app.configs.tts.qwen.config import call_tts as qwen_tts


class TTSManagement:
    def __init__(
        self,
        service_name,
        name,
        language,
        text,
        instruct,
        model_name,
        stream,
    ):
        self.service_name = service_name
        self.name = name
        self.language = language
        self.text = text
        self.instruct = instruct
        self.model_name = model_name
        self.stream = stream

    def service_selector(self):
        service_map = {
            "qwen": qwen_tts,
            "kokoro": kokoro_tts,
        }

        provider = service_map.get((self.service_name or "").lower())
        if provider is None:
            raise ValueError(f"Unsupported TTS service: {self.service_name}")

        return provider(
            text=self.text,
            language=self.language,
            speaker=self.name,
            instruct=self.instruct,
            model_name=self.model_name,
        )


tts_management = TTSManagement
