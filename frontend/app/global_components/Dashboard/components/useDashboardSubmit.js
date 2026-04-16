"use client";

import { useEffect, useRef, useState } from "react";

import { revokeConversationAudioUrls } from "./dashboardAudioUtils";
import { getLlmServiceName, getNormalizedLlmModelName, getTtsServiceName } from "./dashboardUtils";
import { handleAudioResponse, handleJsonResponse, handleStreamingResponse } from "./dashboardSubmitHandlers";
import { createPendingTurn, markConversationTurnError } from "./dashboardTurnUtils";

export const useDashboardSubmit = ({
  mode, showLlmSelector, endpoints, labels, selections, promptState, isPromptDisabled,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [conversation, setConversation] = useState([]);
  const conversationRef = useRef([]);

  useEffect(() => {
    conversationRef.current = conversation;
  }, [conversation]);

  useEffect(() => () => revokeConversationAudioUrls(conversationRef.current), []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (isPromptDisabled || !promptState.prompt.trim() || isSubmitting) {
      return;
    }

    const trimmedPrompt = promptState.prompt.trim();
    const trimmedInstruct = promptState.instruct.trim();
    const isLlmMode = mode === "LLM";
    const isCombinedMode = mode === "TTS+LLM";
    const nextTurnId = crypto?.randomUUID?.() || `${Date.now()}`;
    const llmServiceName = getLlmServiceName(selections.selectedLlm);
    const normalizedLlmModelName = getNormalizedLlmModelName(selections.selectedLlm);
    const ttsServiceName = getTtsServiceName(selections.ttsOptions, selections.selectedTts);

    setConversation((currentConversation) => [
      ...currentConversation,
      createPendingTurn({
        isLlmMode,
        nextTurnId,
        prompt: trimmedPrompt,
        instruct: trimmedInstruct,
        selectedVoice: selections.selectedVoice,
        selectedLanguage: selections.selectedLanguage,
        selectedTtsLabel: labels.selectedTtsLabel,
        selectedLlmLabel: labels.selectedLlmLabel,
        isThinkingEnabled: promptState.isThinkingEnabled,
        isStreamingEnabled: promptState.isStreamingEnabled,
        showLlmSelector,
      }),
    ]);
    promptState.setPrompt("");
    promptState.setInstruct("");

    try {
      setIsSubmitting(true);
      setSubmitError("");
      const response = await fetch(isLlmMode ? endpoints.chatEndpoint : isCombinedMode ? endpoints.streamEndpoint : endpoints.ttsEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json", accept: isLlmMode && !promptState.isStreamingEnabled ? "application/json" : isLlmMode || isCombinedMode ? "application/x-ndjson" : "audio/wav" },
        body: JSON.stringify(
          isLlmMode
            ? { service_name: llmServiceName, user_chat: trimmedPrompt, model: normalizedLlmModelName, reason: promptState.isThinkingEnabled, stream: promptState.isStreamingEnabled }
            : isCombinedMode
              ? { llm_service_name: llmServiceName, llm_model: normalizedLlmModelName, user_chat: trimmedPrompt, reason: promptState.isThinkingEnabled, tts_service_name: ttsServiceName, name: selections.selectedVoice, language: selections.selectedLanguage, instruct: trimmedInstruct, tts_model_name: selections.selectedTts }
              : { service_name: ttsServiceName, name: selections.selectedVoice, language: selections.selectedLanguage, text: trimmedPrompt, instruct: trimmedInstruct, model_name: selections.selectedTts, stream: false }
        ),
      });

      if (!response.ok) {
        throw new Error(isLlmMode ? `Failed to generate response (${response.status})` : `Failed to generate audio (${response.status})`);
      }

      return isLlmMode || isCombinedMode
        ? isLlmMode && !promptState.isStreamingEnabled
          ? handleJsonResponse({ response, nextTurnId, setConversation })
          : handleStreamingResponse({ response, isCombinedMode, nextTurnId, setConversation })
        : handleAudioResponse({ response, nextTurnId, setConversation });
    } catch (error) {
      const nextErrorMessage = error.message || "Unable to send the prompt.";
      setSubmitError(nextErrorMessage);
      markConversationTurnError(setConversation, nextTurnId, nextErrorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return { conversation, isSubmitting, submitError, handleSubmit };
};
