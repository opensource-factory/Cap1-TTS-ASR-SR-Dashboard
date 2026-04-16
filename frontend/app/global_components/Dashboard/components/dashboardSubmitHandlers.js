import { createAudioSegmentFromBase64, waitForPaint } from "./dashboardAudioUtils";
import { getTokenMetadata } from "./dashboardUtils";
import { updateConversationTurn } from "./dashboardTurnUtils";

const syncStreamingTurn = (setConversation, nextTurnId, streamState, status) =>
  updateConversationTurn(setConversation, nextTurnId, {
    thinkingText: streamState.streamedThinkingText,
    responseText: streamState.streamedText,
    audioSegments: streamState.audioSegments,
    metadata: streamState.finalTokenMetadata,
    ...(status ? { status } : {}),
  });

const applyStreamEvent = ({ eventData, isCombinedMode, nextTurnId, streamState }) => {
  if (isCombinedMode && eventData.type === "audio" && eventData.audio) {
    streamState.audioSegments = [
      ...streamState.audioSegments,
      {
        id: eventData.index ?? `${nextTurnId}-${streamState.audioSegments.length}`,
        url: createAudioSegmentFromBase64(eventData.audio, eventData.mime_type || "audio/wav"),
      },
    ];
  }

  if (isCombinedMode && eventData.type === "final") {
    streamState.streamedText = eventData.text || "";
    streamState.streamedThinkingText = eventData.reasoning_content || "";
    streamState.finalTokenMetadata = getTokenMetadata(eventData);
    if (eventData.language) {
      streamState.finalTokenMetadata.language = eventData.language;
    }
  } else if (!isCombinedMode && eventData.type === "thinking") {
    streamState.streamedThinkingText += eventData.delta || "";
  } else if (!isCombinedMode && eventData.type === "content") {
    streamState.streamedText += eventData.delta || "";
  } else if (!isCombinedMode && eventData.type === "metadata") {
    streamState.finalTokenMetadata = getTokenMetadata(eventData);
  }
};

export const handleStreamingResponse = async ({ response, isCombinedMode, nextTurnId, setConversation }) => {
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  const streamState = { streamedText: "", streamedThinkingText: "", finalTokenMetadata: {}, audioSegments: [] };
  let buffer = "";

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

      applyStreamEvent({ eventData: JSON.parse(line), isCombinedMode, nextTurnId, streamState });
      syncStreamingTurn(setConversation, nextTurnId, streamState);
    }

    await waitForPaint();
    if (done) {
      break;
    }
  }

  if (buffer.trim()) {
    applyStreamEvent({ eventData: JSON.parse(buffer), isCombinedMode, nextTurnId, streamState });
  }

  syncStreamingTurn(setConversation, nextTurnId, streamState, "ready");
};

export const handleJsonResponse = async ({ response, nextTurnId, setConversation }) => {
  const responseBody = await response.json();
  updateConversationTurn(setConversation, nextTurnId, {
    thinkingText: responseBody.reasoning_content || "",
    responseText: responseBody.content || "",
    metadata: getTokenMetadata(responseBody),
    status: "ready",
  });
};

export const handleAudioResponse = async ({ response, nextTurnId, setConversation }) => {
  const audioBlob = await response.blob();
  updateConversationTurn(setConversation, nextTurnId, {
    audioUrl: URL.createObjectURL(audioBlob),
    status: "ready",
  });
};
