from io import BytesIO

import soundfile as sf
import torch
from kokoro import KPipeline


SUPPORTED_MODELS = {"kokoro"}
LANGUAGE_MAP = {
    "english": "a",
    "japanese": "j",
}


def call_tts(
    text: str,
    language: str,
    speaker: str,
    instruct: str,
    model_name: str = None,
) -> BytesIO:
    del instruct

    if model_name and model_name.lower() not in SUPPORTED_MODELS:
        raise ValueError(f"Unsupported Kokoro model: {model_name}")

    language_code = LANGUAGE_MAP.get((language or "").strip().lower())
    if language_code is None:
        raise ValueError(f"Unsupported Kokoro language: {language}")

    device = "cuda" if torch.cuda.is_available() else "cpu"

    pipeline = KPipeline(
        lang_code=language_code,
        repo_id="hexgrad/Kokoro-82M",
        device=device,
    )

    buffer = BytesIO()

    for _, (_, _, audio_data) in enumerate(pipeline(text, voice=speaker)):
        sf.write(buffer, audio_data, 24000, format="WAV")
        break
    else:
        raise ValueError("Kokoro did not generate any audio")

    buffer.seek(0)
    print(language_code, speaker)
    return buffer
