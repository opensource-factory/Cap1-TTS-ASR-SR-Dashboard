from typing import Optional

from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from app.configs.llm.chat_management import ChatManagement


class ChatBody(BaseModel):
    service_name: str
    system_prompt: Optional[str] = None
    user_chat: str
    model: str
    top_p: Optional[float] = None
    top_k: Optional[float] = None
    temperature: Optional[float] = None
    stream: bool = False
    reason: bool = False
    session_id: str = "user_1"


router = APIRouter()


@router.post("/chat")
def chat_llm(body: ChatBody):
    chat_management = ChatManagement(
        service_name=body.service_name,
        system_prompt=body.system_prompt,
        user_chat=body.user_chat,
        model=body.model,
        top_p=body.top_p,
        top_k=body.top_k,
        temp=body.temperature,
        stream=body.stream,
        reason=body.reason,
        session_id=body.session_id,
    )

    if not body.stream:
        return chat_management.call_llm_inference()

    return StreamingResponse(
        chat_management.call_streaming_llm_inference(),
        media_type="application/x-ndjson",
    )
