from app.configs.config import get_tts_providers


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

    raise ValueError(f"Unsupported TTS model: {raw_model_name}")


def normalize_tts_service_name(raw_service_name: str) -> str:
    available_services = {
        provider.get("provider", "").strip().lower()
        for provider in get_tts_providers()
    }

    candidate = (raw_service_name or "").strip().lower()
    if candidate in available_services:
        return candidate

    raise ValueError(f"Unsupported TTS service: {raw_service_name}")


def infer_tts_service_name(model_name: str) -> str:
    for provider in get_tts_providers():
        if model_name in provider.get("models", []):
            return provider.get("provider", "").strip().lower()

    raise ValueError(f"Unable to infer TTS service for model: {model_name}")
