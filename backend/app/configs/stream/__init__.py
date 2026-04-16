from typing import Optional

from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

from app.configs.stream.tts_llm_management import TTSLLMManagement
from app.configs.tts import (
    infer_tts_service_name,
    normalize_tts_model_name,
    normalize_tts_service_name,
)


class StreamBody(BaseModel):
    llm_service_name: str
    llm_model: str
    user_chat: str
    system_prompt: Optional[str] = None
    top_p: Optional[float] = None
    top_k: Optional[float] = None
    temperature: Optional[float] = None
    reason: bool = False
    session_id: str = "user_1"
    tts_service_name: str = ""
    name: str
    language: str
    instruct: str = ""
    tts_model_name: str


router = APIRouter()


@router.post("/stream")
def stream_tts_llm(body: StreamBody):
    tts_model_name = normalize_tts_model_name(body.tts_model_name)
    tts_service_name = (
        normalize_tts_service_name(body.tts_service_name)
        if body.tts_service_name
        else infer_tts_service_name(tts_model_name)
    )

    try:
        management = TTSLLMManagement(
            llm_service_name=body.llm_service_name,
            system_prompt=body.system_prompt,
            user_chat=body.user_chat,
            llm_model=body.llm_model,
            top_p=body.top_p,
            top_k=body.top_k,
            temperature=body.temperature,
            reason=body.reason,
            session_id=body.session_id,
            tts_service_name=tts_service_name,
            name=body.name,
            language=body.language,
            instruct=body.instruct,
            tts_model_name=tts_model_name,
        )
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    return StreamingResponse(
        management.call_streaming_tts_llm_inference(),
        media_type="application/x-ndjson",
    )
