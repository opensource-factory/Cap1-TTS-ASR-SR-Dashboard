export const createAudioSegmentFromBase64 = (audioBase64, mimeType = "audio/wav") => {
  const binary = atob(audioBase64 || "");
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return URL.createObjectURL(new Blob([bytes], { type: mimeType }));
};

export const waitForPaint = () =>
  new Promise((resolve) => {
    if (typeof requestAnimationFrame === "function") {
      requestAnimationFrame(() => resolve());
      return;
    }

    setTimeout(resolve, 0);
  });

export const revokeConversationAudioUrls = (conversation = []) => {
  for (const turn of conversation) {
    if (turn.audioUrl) {
      URL.revokeObjectURL(turn.audioUrl);
    }

    for (const audioSegment of turn.audioSegments || []) {
      if (audioSegment.url) {
        URL.revokeObjectURL(audioSegment.url);
      }
    }
  }
};
