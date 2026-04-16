"use client";

import { useState } from "react";

export const useDashboardPromptState = () => {
  const [prompt, setPrompt] = useState("");
  const [instruct, setInstruct] = useState("");
  const [isThinkingEnabled, setIsThinkingEnabled] = useState(false);
  const [isStreamingEnabled, setIsStreamingEnabled] = useState(false);

  return {
    prompt,
    setPrompt,
    instruct,
    setInstruct,
    isThinkingEnabled,
    setIsThinkingEnabled,
    isStreamingEnabled,
    setIsStreamingEnabled,
  };
};
