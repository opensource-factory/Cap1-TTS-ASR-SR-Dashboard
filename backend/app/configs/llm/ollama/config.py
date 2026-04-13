from langchain_ollama import ChatOllama

from app.configs.config import return_config_data


def configure_llm(
    model: str,
    temperature: float = None,
    top_p: float = None,
    top_k: float = None,
    reason: bool = False,
    stream: bool = True,
):
    data = return_config_data()
    url = data["llm"]["models"][0]['endpoint']
    llm = ChatOllama(
        model = model,
        temperature = temperature,
        top_p = top_p,
        top_k = top_k,
        reason = reason,
        stream = stream,
        base_url = url
    )

    return llm
