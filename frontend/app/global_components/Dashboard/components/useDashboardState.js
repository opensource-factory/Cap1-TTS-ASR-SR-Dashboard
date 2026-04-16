"use client";

import { useMemo, useState } from "react";

import {
  getChatEndpoint,
  getPromptDisabledReason,
  getStreamEndpoint,
  getTtsEndpoint,
} from "./dashboardUtils";
import { useDashboardConfig } from "./useDashboardConfig";
import { useDashboardPromptState } from "./useDashboardPromptState";
import { useDashboardSubmit } from "./useDashboardSubmit";

export const useDashboardState = () => {
  const [mode, setMode] = useState("TTS");
  const config = useDashboardConfig();
  const promptState = useDashboardPromptState();
  const showTtsSelector = mode === "TTS" || mode === "TTS+LLM";
  const showLlmSelector = mode === "LLM" || mode === "TTS+LLM";
  const endpoints = useMemo(
    () => ({
      ttsEndpoint: getTtsEndpoint(),
      chatEndpoint: getChatEndpoint(),
      streamEndpoint: getStreamEndpoint(),
    }),
    []
  );
  const labels = {
    selectedTtsLabel:
      config.ttsOptions.find((option) => option.value === config.selectedTts)?.label ||
      config.selectedTts,
    selectedLlmLabel:
      config.llmOptions.find((option) => option.value === config.selectedLlm)?.label ||
      config.selectedLlm,
  };
  const promptDisabledReason = getPromptDisabledReason({
    mode,
    isLoadingConfig: config.isLoadingConfig,
    configError: config.configError,
    showTtsSelector,
    showLlmSelector,
    ...endpoints,
    selectedVoice: config.selectedVoice,
    selectedLanguage: config.selectedLanguage,
    selectedLlm: config.selectedLlm,
  });
  const submission = useDashboardSubmit({
    mode,
    showLlmSelector,
    endpoints,
    labels,
    selections: config,
    promptState,
    isPromptDisabled: Boolean(promptDisabledReason),
  });

  return {
    navbarProps: {
      mode,
      setMode,
      showTtsSelector,
      showLlmSelector,
      selectedTts: config.selectedTts,
      ttsOptions: config.ttsOptions,
      setSelectedTts: config.setSelectedTts,
      isLoading: config.isLoadingConfig,
      voiceOptions: config.voiceOptions,
      selectedVoice: config.selectedVoice,
      setSelectedVoice: config.setSelectedVoice,
      selectedVoiceDetails: config.selectedVoiceDetails,
      selectedLanguage: config.selectedLanguage,
      languageOptions: config.languageOptions,
      setSelectedLanguage: config.setSelectedLanguage,
      selectedLlm: config.selectedLlm,
      llmOptions: config.llmOptions,
      setSelectedLlm: config.setSelectedLlm,
      errorMessage: config.configError,
      accentWarning: config.accentWarning,
    },
    promptbarProps: {
      ...promptState,
      showInstruct: showTtsSelector,
      showThinkToggle: showLlmSelector,
      showStreamingToggle: mode === "LLM",
      onSubmit: submission.handleSubmit,
      isSubmitting: submission.isSubmitting,
      disabled: Boolean(promptDisabledReason),
      disabledReason: promptDisabledReason,
      submitError: submission.submitError,
    },
    conversation: submission.conversation,
  };
};
