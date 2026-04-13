"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  flattenLlmOptions,
  flattenTtsOptions,
  getLanguageOptions,
  getVoiceOptionsForTts,
  infoEndpoint,
} from "../../Navbar/navbarUtils";
import {
  getChatEndpoint,
  getLlmServiceName,
  getNormalizedLlmModelName,
  getPromptDisabledReason,
  getTokenMetadata,
  getTtsEndpoint,
} from "./dashboardUtils";

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
  const [isThinkingEnabled, setIsThinkingEnabled] = useState(false);
  const [isStreamingEnabled, setIsStreamingEnabled] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [conversation, setConversation] = useState([]);
  const conversationRef = useRef([]);

  const ttsEndpoint = useMemo(() => getTtsEndpoint(), []);
  const chatEndpoint = useMemo(() => getChatEndpoint(), []);
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
  const selectedLlmLabel =
    llmOptions.find((option) => option.value === selectedLlm)?.label || selectedLlm;
  const promptDisabledReason = getPromptDisabledReason({
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
    const llmServiceName = getLlmServiceName(selectedLlm);
    const normalizedLlmModelName = getNormalizedLlmModelName(selectedLlm);
    const isLlmMode = mode === "LLM";
    const nextTurnId =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `${Date.now()}`;

    setConversation((currentConversation) => [
      ...currentConversation,
      isLlmMode
        ? {
            id: nextTurnId,
            prompt: trimmedPrompt,
            instruct: "",
            metadata: {
              llmName: selectedLlmLabel,
              think: isThinkingEnabled ? "Think On" : "Think Off",
              stream: isStreamingEnabled ? "Stream On" : "Stream Off",
            },
            audioUrl: "",
            thinkingText: "",
            responseText: "",
            outputType: "text",
            status: "pending",
          }
        : {
            id: nextTurnId,
            prompt: trimmedPrompt,
            instruct: trimmedInstruct,
            metadata: {
              name: selectedVoice,
              language: selectedLanguage,
              ttsName: selectedTtsLabel,
              ...(showLlmSelector
                ? {
                    llmName: selectedLlmLabel,
                    think: isThinkingEnabled ? "Think On" : "Think Off",
                  }
                : {}),
            },
            audioUrl: "",
            thinkingText: "",
            responseText: "",
            outputType: "audio",
            status: "pending",
          },
    ]);
    setPrompt("");
    setInstruct("");

    try {
      setIsSubmitting(true);
      setSubmitError("");

      const response = await fetch(isLlmMode ? chatEndpoint : ttsEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          accept: isLlmMode
            ? isStreamingEnabled
              ? "application/x-ndjson"
              : "application/json"
            : "audio/wav",
        },
        body: JSON.stringify(
          isLlmMode
            ? {
                service_name: llmServiceName,
                user_chat: trimmedPrompt,
                model: normalizedLlmModelName,
                reason: isThinkingEnabled,
                stream: isStreamingEnabled,
              }
            : {
                name: selectedVoice,
                language: selectedLanguage,
                text: trimmedPrompt,
                instruct: trimmedInstruct,
                model_name: selectedTts,
              }
        ),
      });

      if (!response.ok) {
        throw new Error(
          isLlmMode
            ? `Failed to generate response (${response.status})`
            : `Failed to generate audio (${response.status})`
        );
      }

      if (isLlmMode) {
        if (isStreamingEnabled) {
          if (!response.body) {
            throw new Error("Streaming response body is unavailable.");
          }

          const reader = response.body.getReader();
          const decoder = new TextDecoder();
          let streamedText = "";
          let streamedThinkingText = "";
          let buffer = "";
          let finalTokenMetadata = {};

          while (true) {
            const { value, done } = await reader.read();

            if (value) {
              buffer += decoder.decode(value, { stream: true });
            }

            const lines = buffer.split("\n");
            buffer = lines.pop() || "";

            for (const line of lines) {
              if (!line.trim()) {
                continue;
              }

              const eventData = JSON.parse(line);

              if (eventData.type === "thinking") {
                streamedThinkingText += eventData.delta || "";
              }

              if (eventData.type === "content") {
                streamedText += eventData.delta || "";
              }

              if (eventData.type === "metadata") {
                finalTokenMetadata = getTokenMetadata(eventData);
              }

              setConversation((currentConversation) =>
                currentConversation.map((turn) =>
                  turn.id === nextTurnId
                    ? {
                        ...turn,
                        thinkingText: streamedThinkingText,
                        responseText: streamedText,
                        metadata: {
                          ...turn.metadata,
                          ...finalTokenMetadata,
                        },
                      }
                    : turn
                )
              );
            }

            await new Promise((resolve) => {
              if (typeof requestAnimationFrame === "function") {
                requestAnimationFrame(() => resolve());
                return;
              }

              setTimeout(resolve, 0);
            });

            if (done) {
              break;
            }
          }

          buffer += decoder.decode();

          if (buffer.trim()) {
            const eventData = JSON.parse(buffer);

            if (eventData.type === "thinking") {
              streamedThinkingText += eventData.delta || "";
            }

            if (eventData.type === "content") {
              streamedText += eventData.delta || "";
            }

            if (eventData.type === "metadata") {
              finalTokenMetadata = getTokenMetadata(eventData);
            }
          }

          setConversation((currentConversation) =>
            currentConversation.map((turn) =>
              turn.id === nextTurnId
                ? {
                    ...turn,
                    thinkingText: streamedThinkingText,
                    responseText: streamedText,
                    metadata: {
                      ...turn.metadata,
                      ...finalTokenMetadata,
                    },
                    status: "ready",
                  }
                : turn
            )
          );

          return;
        }

        const responseBody = await response.json();
        const responseText = responseBody.content || "";
        const thinkingText = responseBody.reasoning_content || "";
        const tokenMetadata = getTokenMetadata(responseBody);

        setConversation((currentConversation) =>
          currentConversation.map((turn) =>
            turn.id === nextTurnId
              ? {
                  ...turn,
                  thinkingText,
                  metadata: {
                    ...turn.metadata,
                    ...tokenMetadata,
                  },
                  responseText,
                  status: "ready",
                }
              : turn
          )
        );

        return;
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
      showThinkToggle: showLlmSelector,
      isThinkingEnabled,
      setIsThinkingEnabled,
      showStreamingToggle: mode === "LLM",
      isStreamingEnabled,
      setIsStreamingEnabled,
      onSubmit: handleSubmit,
      isSubmitting,
      disabled: isPromptDisabled,
      disabledReason: promptDisabledReason,
      submitError,
    },
    conversation,
  };
};
