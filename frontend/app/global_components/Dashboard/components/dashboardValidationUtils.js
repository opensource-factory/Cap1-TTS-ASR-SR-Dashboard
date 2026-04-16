export const getPromptDisabledReason = ({
  mode,
  isLoadingConfig,
  configError,
  showTtsSelector,
  showLlmSelector,
  ttsEndpoint,
  chatEndpoint,
  streamEndpoint,
  selectedVoice,
  selectedLanguage,
  selectedLlm,
}) => {
  if (isLoadingConfig) {
    return "Model info is still loading.";
  }

  if (configError) {
    return "Prompt sending is unavailable until the config API loads.";
  }

  if (mode === "LLM") {
    if (!showLlmSelector) {
      return "Choose an LLM mode before sending.";
    }

    return !chatEndpoint
      ? "Unable to resolve the /chat endpoint from NEXT_PUBLIC_INFO_API_ENDPOINT."
      : !selectedLlm
        ? "Choose an LLM model before sending."
        : "";
  }

  if (mode === "TTS+LLM") {
    if (!showTtsSelector || !showLlmSelector) {
      return "Choose a TTS+LLM mode before sending.";
    }

    if (!streamEndpoint) {
      return "Unable to resolve the /stream endpoint from NEXT_PUBLIC_INFO_API_ENDPOINT.";
    }

    return !selectedLlm
      ? "Choose an LLM model before sending."
      : !selectedVoice || !selectedLanguage
        ? "Choose a voice actor and language before sending."
        : "";
  }

  if (!showTtsSelector) {
    return "The current mode is not wired to a send endpoint yet.";
  }

  return !ttsEndpoint
    ? "Unable to resolve the /tts endpoint from NEXT_PUBLIC_INFO_API_ENDPOINT."
    : !selectedVoice || !selectedLanguage
      ? "Choose a voice actor and language before sending."
      : "";
};
