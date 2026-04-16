export const createPendingTurn = ({
  isLlmMode,
  nextTurnId,
  prompt,
  instruct,
  selectedVoice,
  selectedLanguage,
  selectedTtsLabel,
  selectedLlmLabel,
  isThinkingEnabled,
  isStreamingEnabled,
  showLlmSelector,
}) => ({
  id: nextTurnId,
  prompt,
  instruct: isLlmMode ? "" : instruct,
  metadata: isLlmMode
    ? {
        llmName: selectedLlmLabel,
        think: isThinkingEnabled ? "Think On" : "Think Off",
        stream: isStreamingEnabled ? "Stream On" : "Stream Off",
      }
    : {
        name: selectedVoice,
        language: selectedLanguage,
        ttsName: selectedTtsLabel,
        ...(showLlmSelector
          ? {
              llmName: selectedLlmLabel,
              think: isThinkingEnabled ? "Think On" : "Think Off",
              stream: "Sentence Audio",
            }
          : {}),
      },
  audioUrl: "",
  audioSegments: [],
  thinkingText: "",
  responseText: "",
  outputType: isLlmMode ? "text" : "audio",
  status: "pending",
});

export const updateConversationTurn = (setConversation, turnId, updates) => {
  setConversation((currentConversation) =>
    currentConversation.map((turn) =>
      turn.id === turnId
        ? {
            ...turn,
            ...updates,
            metadata: updates.metadata
              ? {
                  ...turn.metadata,
                  ...updates.metadata,
                }
              : turn.metadata,
          }
        : turn
    )
  );
};

export const markConversationTurnError = (setConversation, turnId, error) =>
  updateConversationTurn(setConversation, turnId, {
    status: "error",
    error,
  });
