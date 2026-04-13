import json
from typing import Dict, Generator, Optional

from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from langchain_core.messages import AIMessage, HumanMessage
from langchain_core.chat_history import InMemoryChatMessageHistory
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from app.configs.llm.ollama.config import configure_llm


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

store: Dict[str, InMemoryChatMessageHistory] = {}


def get_session_history(session_id: str) -> InMemoryChatMessageHistory:
    if session_id not in store:
        store[session_id] = InMemoryChatMessageHistory()
    return store[session_id]


@router.post("/chat")
def chat_llm(body: ChatBody):
    system_prompt = body.system_prompt
    if system_prompt is None:
        system_prompt = "You are a friendly AI who answers respectfully"

    llm = configure_llm(
        service_name=body.service_name,
        model=body.model,
        top_p=body.top_p,
        top_k=body.top_k,
        temperature=body.temperature,
        reason=body.reason,
        stream=body.stream,
    )
    prompt = ChatPromptTemplate.from_messages([
        ("system", system_prompt),
        MessagesPlaceholder(variable_name="history"),
        ("human", "{input}"),
    ])

    history = get_session_history(body.session_id)
    prompt_input = {
        "history": history.messages,
        "input": body.user_chat,
    }
    messages = prompt.invoke(prompt_input)

    if not body.stream:
        response = llm.invoke(messages)
        history.add_messages(
            [
                HumanMessage(content=body.user_chat),
                AIMessage(content=response.content),
            ]
        )
        return {
            "content": response.content,
            "reasoning_content": response.additional_kwargs.get("reasoning_content", ""),
            "response_metadata": getattr(response, "response_metadata", {}),
            "usage_metadata": getattr(response, "usage_metadata", {}),
        }

    def token_generator() -> Generator[str, None, None]:
        chunks: list[str] = []
        reasoning_chunks: list[str] = []
        final_response_metadata = {}
        final_usage_metadata = {}

        for chunk in llm.stream(messages):
            text = getattr(chunk, "content", "")
            chunk_message = getattr(chunk, "message", chunk)
            chunk_additional_kwargs = getattr(chunk_message, "additional_kwargs", {}) or {}
            chunk_usage_metadata = getattr(chunk_message, "usage_metadata", {}) or {}
            chunk_generation_info = getattr(chunk, "generation_info", {}) or {}
            reasoning_text = chunk_additional_kwargs.get("reasoning_content", "")

            if reasoning_text:
                reasoning_chunks.append(reasoning_text)
                yield json.dumps({"type": "thinking", "delta": reasoning_text}) + "\n"

            if text:
                chunks.append(text)
                yield json.dumps({"type": "content", "delta": text}) + "\n"

            if chunk_generation_info:
                final_response_metadata = chunk_generation_info

            if chunk_usage_metadata:
                final_usage_metadata = dict(chunk_usage_metadata)

        history.add_messages(
            [
                HumanMessage(content=body.user_chat),
                AIMessage(
                    content="".join(chunks),
                    additional_kwargs={
                        "reasoning_content": "".join(reasoning_chunks),
                    }
                    if reasoning_chunks
                    else {},
                ),
            ]
        )
        yield (
            json.dumps(
                {
                    "type": "metadata",
                    "response_metadata": final_response_metadata,
                    "usage_metadata": final_usage_metadata,
                }
            )
            + "\n"
        )

    return StreamingResponse(token_generator(), media_type="application/x-ndjson")
