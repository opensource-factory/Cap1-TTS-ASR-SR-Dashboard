from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

from app.configs.tts.tts_management import TTSManagement
from app.configs.tts.utils import infer_tts_service_name, normalize_tts_model_name, normalize_tts_service_name


class VoiceBody(BaseModel):
    service_name:str = ""
    name: str
    language: str
    text: str
    instruct: str = ""
    model_name: str
    stream: bool = False


router = APIRouter()


@router.post("/tts")
def get_voice(body: VoiceBody):
    try:
        model_name = normalize_tts_model_name(body.model_name)
        service_name = (
            normalize_tts_service_name(body.service_name)
            if body.service_name
            else infer_tts_service_name(model_name)
        )
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

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
