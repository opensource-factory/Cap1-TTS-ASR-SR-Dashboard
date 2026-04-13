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

export const getPromptDisabledReason = ({
  isLoadingConfig,
  configError,
  showTtsSelector,
  ttsEndpoint,
  selectedVoice,
  selectedLanguage,
}) => {
  if (isLoadingConfig) {
    return "Model info is still loading.";
  }

  if (configError) {
    return "Prompt sending is unavailable until the config API loads.";
  }

  if (!showTtsSelector) {
    return "The current backend endpoint only supports TTS requests.";
  }

  if (!ttsEndpoint) {
    return "Unable to resolve the /tts endpoint from NEXT_PUBLIC_INFO_API_ENDPOINT.";
  }

  if (!selectedVoice || !selectedLanguage) {
    return "Choose a voice actor and language before sending.";
  }

  return "";
};
