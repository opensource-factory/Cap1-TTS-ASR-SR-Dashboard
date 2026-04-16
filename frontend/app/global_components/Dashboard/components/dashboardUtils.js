import { infoEndpoint } from "../../Navbar/navbarUtils";

export const getTtsEndpoint = () => {
  if (!infoEndpoint) {
    return "";
  }

  try {
    const endpoint = new URL(infoEndpoint);
    endpoint.pathname = endpoint.pathname.replace(/\/info\/?$/, "/tts");
    return endpoint.toString();
  } catch {
    return infoEndpoint.replace(/\/info\/?$/, "/tts");
  }
};

export const getChatEndpoint = () => {
  if (!infoEndpoint) {
    return "";
  }

  try {
    const endpoint = new URL(infoEndpoint);
    endpoint.pathname = endpoint.pathname.replace(/\/info\/?$/, "/chat");
    return endpoint.toString();
  } catch {
    return infoEndpoint.replace(/\/info\/?$/, "/chat");
  }
};

export const getNormalizedLlmModelName = (selectedLlm = "") => {
  if (!selectedLlm) {
    return "";
  }

  const firstColonIndex = selectedLlm.indexOf(":");
  if (firstColonIndex === -1) {
    return selectedLlm;
  }

  const providerPrefix = selectedLlm.slice(0, firstColonIndex);
  const modelName = selectedLlm.slice(firstColonIndex + 1);

  return providerPrefix && modelName ? modelName : selectedLlm;
};

export const getLlmServiceName = (selectedLlm = "") => {
  if (!selectedLlm) {
    return "";
  }

  const firstColonIndex = selectedLlm.indexOf(":");
  return firstColonIndex === -1 ? "" : selectedLlm.slice(0, firstColonIndex);
};

export const getTtsServiceName = (ttsOptions = [], selectedTts = "") =>
  ttsOptions.find((option) => option.value === selectedTts)?.provider || "";

export const getPromptDisabledReason = ({
  mode,
  isLoadingConfig,
  configError,
  showTtsSelector,
  showLlmSelector,
  ttsEndpoint,
  chatEndpoint,
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

    if (!chatEndpoint) {
      return "Unable to resolve the /chat endpoint from NEXT_PUBLIC_INFO_API_ENDPOINT.";
    }

    if (!selectedLlm) {
      return "Choose an LLM model before sending.";
    }

    return "";
  }

  if (!showTtsSelector) {
    return "The current mode is not wired to a send endpoint yet.";
  }

  if (!ttsEndpoint) {
    return "Unable to resolve the /tts endpoint from NEXT_PUBLIC_INFO_API_ENDPOINT.";
  }

  if (!selectedVoice || !selectedLanguage) {
    return "Choose a voice actor and language before sending.";
  }

  return "";
};

export const getTokenMetadata = (responseBody = {}) => {
  const usageMetadata = responseBody.usage_metadata || {};
  const responseMetadata = responseBody.response_metadata || {};

  const inputTokens =
    usageMetadata.input_tokens ?? responseMetadata.prompt_eval_count ?? null;
  const outputTokens =
    usageMetadata.output_tokens ?? responseMetadata.eval_count ?? null;
  const totalTokens =
    usageMetadata.total_tokens ??
    (inputTokens !== null && outputTokens !== null ? inputTokens + outputTokens : null);

  return {
    inputTokens,
    outputTokens,
    totalTokens,
  };
};
