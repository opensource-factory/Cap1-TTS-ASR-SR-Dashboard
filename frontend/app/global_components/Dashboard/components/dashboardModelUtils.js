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
  const firstColonIndex = selectedLlm.indexOf(":");
  return firstColonIndex === -1 ? "" : selectedLlm.slice(0, firstColonIndex);
};

export const getTtsServiceName = (ttsOptions = [], selectedTts = "") =>
  ttsOptions.find((option) => option.value === selectedTts)?.provider || "";

export const getTokenMetadata = (responseBody = {}) => {
  const usageMetadata = responseBody.usage_metadata || {};
  const responseMetadata = responseBody.response_metadata || {};
  const inputTokens =
    usageMetadata.input_tokens ?? responseMetadata.prompt_eval_count ?? null;
  const outputTokens =
    usageMetadata.output_tokens ?? responseMetadata.eval_count ?? null;

  return {
    inputTokens,
    outputTokens,
    totalTokens:
      usageMetadata.total_tokens ??
      (inputTokens !== null && outputTokens !== null ? inputTokens + outputTokens : null),
  };
};
