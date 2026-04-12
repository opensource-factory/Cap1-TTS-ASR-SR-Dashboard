export const navOptions = ["TTS", "LLM", "TTS+LLM", "TTS+Model+ASR", "ASR", "SR"];

export const infoEndpoint = process.env.NEXT_PUBLIC_INFO_API_ENDPOINT || "";

export const flattenLlmOptions = (llmProviders = []) =>
  llmProviders.flatMap((providerGroup) =>
    (providerGroup.models || []).map((model) => ({
      label: `${providerGroup.provider} / ${model}`,
      value: `${providerGroup.provider}:${model}`,
      provider: providerGroup.provider,
      model,
    }))
  );

export const flattenTtsOptions = (ttsProviders = []) =>
  ttsProviders.flatMap((providerGroup) =>
    (providerGroup.models || []).map((model) => ({
      label: `${providerGroup.provider} / ${model}`,
      value: model,
      provider: providerGroup.provider,
      model,
    }))
  );

export const getVoiceOptionsForTts = (ttsProviders = [], selectedTts) => {
  const matchingProvider = ttsProviders.find((providerGroup) =>
    (providerGroup.models || []).some((model) => model === selectedTts)
  );

  if (!matchingProvider) {
    return [];
  }

  return (matchingProvider.voices || []).map((voiceName) => {
    const voiceDetails = matchingProvider.description?.[voiceName] || {};

    return {
      label: voiceName,
      value: voiceName,
      language: voiceDetails.language || "",
      description: voiceDetails.description || "",
    };
  });
};

export const getLanguageOptions = (voiceOptions = []) => {
  const uniqueLanguages = [...new Set(voiceOptions.map((voice) => voice.language).filter(Boolean))];

  return uniqueLanguages.map((language) => ({
    label: language,
    value: language,
  }));
};
