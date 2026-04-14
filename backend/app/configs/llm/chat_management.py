from typing import Dict

from app.configs.llm.ollama.config import configure_llm as configure_ollama_llm
from langchain_core.chat_history import InMemoryChatMessageHistory
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.messages import AIMessage, HumanMessage
import json

store: Dict[str, InMemoryChatMessageHistory] = {}



class ChatManagement:
    def __init__(
        self,
        service_name,
        system_prompt,
        user_chat,
        model,
        top_p,
        top_k,
        temp,
        stream,
        reason,
        session_id,
    ):
        self.service_name = service_name
        self.system_prompt = system_prompt
        self.user_chat = user_chat
        self.model = model
        self.top_p = top_p
        self.top_k = top_k
        self.temp = temp
        self.stream = stream
        self.reason = reason
        self.session_id = session_id

    def service_provider_selector(self):
        if self.service_name == "ollama":
            llm = configure_ollama_llm(
                model=self.model,
                top_p=self.top_p,
                top_k=self.top_k,
                temperature=self.temp,
                stream=self.stream,
                reason=self.reason,
            )
            return llm
        else:
            raise ValueError("Service not yet supported")

    def session_management(self) -> InMemoryChatMessageHistory:
        session_id = self.session_id or "user_1"
        if session_id not in store:
            store[session_id] = InMemoryChatMessageHistory()
        return store[session_id]

    def build_messages(self):
        system_prompt = self.system_prompt
        if system_prompt is None:
            system_prompt = "You are a friendly assistant that helps users"

        prompt = ChatPromptTemplate.from_messages([
            ("system", system_prompt),
            MessagesPlaceholder(variable_name="history"),
            ("human", "{input}"),
        ])

        history = self.session_management()

        prompt_input = {
            "history": history.messages,
            "input": self.user_chat,
        }

        messages = prompt.invoke(prompt_input)
        return messages

    def call_llm_inference(self):
        messages = self.build_messages()
        llm = self.service_provider_selector()
        response = llm.invoke(messages)
        history = self.session_management()
        history.add_messages(
            [
                HumanMessage(content=self.user_chat),
                AIMessage(content=response.content),
            ]
        )
        return{
            "content":response.content,
            "reasoning_content":response.additional_kwargs.get("reasoning_content", ""),
            "response_metadata":getattr(response, "response_metadata", {}),
            "usage_metadata":getattr(response, "usage_metadata", {}),
        }

    def call_streaming_llm_inference(self):
        chunks: list[str] = []
        reasoning_chunks: list[str] = []
        final_response_metadata = {}
        final_usage_metadata = {}
        history = self.session_management()

        messages = self.build_messages()
        llm = self.service_provider_selector()

        for chunk in llm.stream(messages):
            text = getattr(chunk, "content", "")
            chunk_message= getattr(chunk, "message", chunk)
            chunk_additional_kwargs = getattr(chunk_message,"additional_kwargs", {})
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
            HumanMessage(content=self.user_chat),
            AIMessage(content="".join(chunks)),
        ])
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
    