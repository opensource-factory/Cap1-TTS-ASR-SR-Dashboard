from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

from app.configs.config import get_tts_providers
from app.configs.tts.tts_management import TTSManagement


class VoiceBody(BaseModel):
    service_name:str = ""
    name: str
    language: str
    text: str
    instruct: str = ""
    model_name: str
    stream: bool = False


router = APIRouter()


def normalize_tts_model_name(raw_model_name: str) -> str:
    available_models = {
        model
        for provider in get_tts_providers()
        for model in provider.get("models", [])
    }

    candidate = (raw_model_name or "").strip().replace("CustonVoice", "CustomVoice")
    if candidate in available_models:
        return candidate

    if ":" in candidate:
        _, _, suffix = candidate.partition(":")
        suffix = suffix.strip().replace("CustonVoice", "CustomVoice")
        if suffix in available_models:
            return suffix

    raise HTTPException(status_code=400, detail=f"Unsupported TTS model: {raw_model_name}")


def normalize_tts_service_name(raw_service_name: str) -> str:
    available_services = {
        provider.get("provider", "").strip().lower()
        for provider in get_tts_providers()
    }

    candidate = (raw_service_name or "").strip().lower()
    if candidate in available_services:
        return candidate

    raise HTTPException(status_code=400, detail=f"Unsupported TTS service: {raw_service_name}")


def infer_tts_service_name(model_name: str) -> str:
    for provider in get_tts_providers():
        if model_name in provider.get("models", []):
            return provider.get("provider", "").strip().lower()

    raise HTTPException(status_code=400, detail=f"Unable to infer TTS service for model: {model_name}")


@router.post("/tts")
def get_voice(body: VoiceBody):
    model_name = normalize_tts_model_name(body.model_name)
    service_name = (
        normalize_tts_service_name(body.service_name)
        if body.service_name
        else infer_tts_service_name(model_name)
    )

    try:
        audio_buffer = TTSManagement(
            service_name=service_name,
            name=body.name,
            language=body.language,
            text=body.text,
            instruct=body.instruct,
            model_name=model_name,
            stream=body.stream,
        ).service_selector()
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    return StreamingResponse(audio_buffer, media_type="audio/wav")
