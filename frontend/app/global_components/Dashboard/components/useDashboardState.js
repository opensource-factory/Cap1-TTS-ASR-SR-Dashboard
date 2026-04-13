"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  flattenLlmOptions,
  flattenTtsOptions,
  getLanguageOptions,
  getVoiceOptionsForTts,
  infoEndpoint,
} from "../../Navbar/navbarUtils";
import { getPromptDisabledReason, getTtsEndpoint } from "./dashboardUtils";

export const useDashboardState = () => {
  const [mode, setMode] = useState("TTS");
  const [llmOptions, setLlmOptions] = useState([]);
  const [ttsOptions, setTtsOptions] = useState([]);
  const [ttsProviders, setTtsProviders] = useState([]);
  const [selectedLlm, setSelectedLlm] = useState("");
  const [selectedTts, setSelectedTts] = useState("");
  const [selectedVoice, setSelectedVoice] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("");
  const [isLoadingConfig, setIsLoadingConfig] = useState(true);
  const [configError, setConfigError] = useState("");
  const [prompt, setPrompt] = useState("");
  const [instruct, setInstruct] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [conversation, setConversation] = useState([]);
  const conversationRef = useRef([]);

  const ttsEndpoint = useMemo(() => getTtsEndpoint(), []);
  const showTtsSelector = mode === "TTS" || mode === "TTS+LLM";
  const showLlmSelector = mode === "LLM" || mode === "TTS+LLM";
  const voiceOptions = getVoiceOptionsForTts(ttsProviders, selectedTts);
  const languageOptions = getLanguageOptions(voiceOptions);
  const selectedVoiceDetails =
    voiceOptions.find((voiceOption) => voiceOption.value === selectedVoice) || null;
  const accentWarning =
    selectedVoiceDetails &&
    selectedLanguage &&
    selectedVoiceDetails.language &&
    selectedLanguage !== selectedVoiceDetails.language
      ? `Warning: this voice actor prefers ${selectedVoiceDetails.language}, so the accent might be funny in ${selectedLanguage}.`
      : "";
  const selectedTtsLabel =
    ttsOptions.find((option) => option.value === selectedTts)?.label || selectedTts;
  const promptDisabledReason = getPromptDisabledReason({
    isLoadingConfig,
    configError,
    showTtsSelector,
    ttsEndpoint,
    selectedVoice,
    selectedLanguage,
  });
  const isPromptDisabled = Boolean(promptDisabledReason);

  useEffect(() => {
    conversationRef.current = conversation;
  }, [conversation]);

  useEffect(() => {
    let isMounted = true;

    const loadInfo = async () => {
      if (!infoEndpoint) {
        setConfigError("Missing NEXT_PUBLIC_INFO_API_ENDPOINT.");
        setIsLoadingConfig(false);
        return;
      }

      try {
        setIsLoadingConfig(true);
        setConfigError("");

        const response = await fetch(infoEndpoint, {
          headers: { accept: "application/json" },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch config (${response.status})`);
        }

        const data = await response.json();
        const nextLlmOptions = flattenLlmOptions(data.llm);
        const nextTtsOptions = flattenTtsOptions(data.tts);

        if (!isMounted) {
          return;
        }

        setLlmOptions(nextLlmOptions);
        setTtsOptions(nextTtsOptions);
        setTtsProviders(data.tts || []);
        setSelectedLlm(nextLlmOptions[0]?.value || "");
        setSelectedTts(nextTtsOptions[0]?.value || "");
        setSelectedVoice((data.tts?.[0]?.voices || [])[0] || "");
      } catch (error) {
        if (!isMounted) {
          return;
        }

        setConfigError(error.message || "Unable to load model info.");
      } finally {
        if (isMounted) {
          setIsLoadingConfig(false);
        }
      }
    };

    loadInfo();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (voiceOptions.length === 0) {
      setSelectedVoice("");
      return;
    }

    const hasSelectedVoice = voiceOptions.some(
      (voiceOption) => voiceOption.value === selectedVoice
    );

    if (!hasSelectedVoice) {
      setSelectedVoice(voiceOptions[0].value);
    }
  }, [selectedTts, selectedVoice, voiceOptions]);

  useEffect(() => {
    if (!selectedVoiceDetails?.language) {
      setSelectedLanguage("");
      return;
    }

    const hasSelectedLanguage = languageOptions.some(
      (languageOption) => languageOption.value === selectedLanguage
    );

    if (!hasSelectedLanguage) {
      setSelectedLanguage(selectedVoiceDetails.language);
    }
  }, [languageOptions, selectedLanguage, selectedVoiceDetails]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (isPromptDisabled || !prompt.trim() || isSubmitting) {
      return;
    }

    const trimmedPrompt = prompt.trim();
    const trimmedInstruct = instruct.trim();
    const nextTurnId =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `${Date.now()}`;

    setConversation((currentConversation) => [
      ...currentConversation,
      {
        id: nextTurnId,
        prompt: trimmedPrompt,
        instruct: trimmedInstruct,
        metadata: {
          name: selectedVoice,
          language: selectedLanguage,
          ttsName: selectedTtsLabel,
        },
        audioUrl: "",
        status: "pending",
      },
    ]);
    setPrompt("");
    setInstruct("");

    try {
      setIsSubmitting(true);
      setSubmitError("");

      const response = await fetch(ttsEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          accept: "audio/wav",
        },
        body: JSON.stringify({
          name: selectedVoice,
          language: selectedLanguage,
          text: trimmedPrompt,
          instruct: trimmedInstruct,
          model_name: selectedTts,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to generate audio (${response.status})`);
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);

      setConversation((currentConversation) =>
        currentConversation.map((turn) =>
          turn.id === nextTurnId
            ? {
                ...turn,
                audioUrl,
                status: "ready",
              }
            : turn
        )
      );
    } catch (error) {
      const nextErrorMessage = error.message || "Unable to send the prompt.";
      setSubmitError(nextErrorMessage);
      setConversation((currentConversation) =>
        currentConversation.map((turn) =>
          turn.id === nextTurnId
            ? {
                ...turn,
                status: "error",
                error: nextErrorMessage,
              }
            : turn
        )
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    return () => {
      for (const turn of conversationRef.current) {
        if (turn.audioUrl) {
          URL.revokeObjectURL(turn.audioUrl);
        }
      }
    };
  }, []);

  return {
    navbarProps: {
      mode,
      setMode,
      showTtsSelector,
      showLlmSelector,
      selectedTts,
      ttsOptions,
      setSelectedTts,
      isLoading: isLoadingConfig,
      voiceOptions,
      selectedVoice,
      setSelectedVoice,
      selectedVoiceDetails,
      selectedLanguage,
      languageOptions,
      setSelectedLanguage,
      selectedLlm,
      llmOptions,
      setSelectedLlm,
      errorMessage: configError,
      accentWarning,
    },
    promptbarProps: {
      prompt,
      setPrompt,
      instruct,
      setInstruct,
      showInstruct: showTtsSelector,
      onSubmit: handleSubmit,
      isSubmitting,
      disabled: isPromptDisabled,
      disabledReason: promptDisabledReason,
      submitError,
    },
    conversation,
  };
};
