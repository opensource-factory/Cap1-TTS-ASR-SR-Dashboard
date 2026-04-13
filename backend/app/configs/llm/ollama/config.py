from langchain_ollama import ChatOllama

from app.configs.config import return_config_data


def configure_llm(
    service_name: str,
    model: str,
    temperature: float = None,
    top_p: float = None,
    top_k: float = None,
    reason: bool = False,
    stream: bool = True,
):
    data = return_config_data()
    service = next(
        (
            item
            for item in data["llm"]["models"]
            if item.get("provider", "").lower() == (service_name or "").lower()
        ),
        None,
    )

    if service is None:
        raise ValueError(f"Unsupported LLM service: {service_name}")

    url = service.get("endpoint", "")
    llm = ChatOllama(
        model = model,
        temperature = temperature,
        top_p = top_p,
        top_k = top_k,
        reasoning = reason,
        stream = stream,
        base_url = url
    )

    return llm
