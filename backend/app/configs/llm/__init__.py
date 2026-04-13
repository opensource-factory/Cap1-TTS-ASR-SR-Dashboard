from typing import Dict, Generator, Optional

from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from langchain_core.runnables.history import RunnableWithMessageHistory
from langchain_core.chat_history import InMemoryChatMessageHistory
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from app.configs.llm.ollama.config import configure_llm


class ChatBody(BaseModel):
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

    chain = prompt | llm

    chat_with_history = RunnableWithMessageHistory(
        chain,
        get_session_history,
        input_message_key="input",
        history_message_key="history",
    )

    config = {"configurable": {"session_id": body.session_id}}

    if not body.stream:
        response = chat_with_history.invoke({"input": body.user_chat}, config=config)
        return {
            "content": response.content,
            "response_metadata": getattr(response, "response_metadata", {}),
        }

    def token_generator() -> Generator[str, None, None]:
        for chunk in chat_with_history.stream({"input": body.user_chat}, config=config):
            text = getattr(chunk, "content", "")
            if text:
                yield text

    return StreamingResponse(token_generator(), media_type="text/plain; charset=utf-8")
