"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Navbar } from "../Navbar/Navbar";
import { Promptbar } from "../Promptbar/promptbar";
import { Visual } from "../Visual/visual";
import {
  flattenLlmOptions,
  flattenTtsOptions,
  getLanguageOptions,
  getVoiceOptionsForTts,
  infoEndpoint,
} from "../Navbar/navbarUtils";

const getTtsEndpoint = () => {
  if (!infoEndpoint) {
    return "";
  }

  try {
    const endpoint = new URL(infoEndpoint);
    endpoint.pathname = endpoint.pathname.replace(/\/info\/?$/, "/tts");
    return endpoint.toString();
  } catch {
    return infoEndpoint.replace(/\/info\/?$/, "/tts");
  }
};

export const Dashboard = () => {
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

  const showTtsSelector = mode === "TTS" || mode === "TTS+LLM";
  const showLlmSelector = mode === "LLM" || mode === "TTS+LLM";
  const voiceOptions = getVoiceOptionsForTts(ttsProviders, selectedTts);
  const languageOptions = getLanguageOptions(voiceOptions);
  const selectedVoiceDetails =
    voiceOptions.find((voiceOption) => voiceOption.value === selectedVoice) || null;

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

  const accentWarning =
    selectedVoiceDetails &&
    selectedLanguage &&
    selectedVoiceDetails.language &&
    selectedLanguage !== selectedVoiceDetails.language
      ? `Warning: this voice actor prefers ${selectedVoiceDetails.language}, so the accent might be funny in ${selectedLanguage}.`
      : "";

  const selectedTtsLabel =
    ttsOptions.find((option) => option.value === selectedTts)?.label || selectedTts;

  const promptDisabledReason = (() => {
    if (isLoadingConfig) {
      return "Model info is still loading.";
    }

    if (configError) {
      return "Prompt sending is unavailable until the config API loads.";
    }

    if (!showTtsSelector) {
      return "The current backend endpoint only supports TTS requests.";
    }

    if (!ttsEndpoint) {
      return "Unable to resolve the /tts endpoint from NEXT_PUBLIC_INFO_API_ENDPOINT.";
    }

    if (!selectedVoice || !selectedLanguage) {
      return "Choose a voice actor and language before sending.";
    }

    return "";
  })();

  const isPromptDisabled = Boolean(promptDisabledReason);

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

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar
        mode={mode}
        setMode={setMode}
        showTtsSelector={showTtsSelector}
        showLlmSelector={showLlmSelector}
        selectedTts={selectedTts}
        ttsOptions={ttsOptions}
        setSelectedTts={setSelectedTts}
        isLoading={isLoadingConfig}
        voiceOptions={voiceOptions}
        selectedVoice={selectedVoice}
        setSelectedVoice={setSelectedVoice}
        selectedVoiceDetails={selectedVoiceDetails}
        selectedLanguage={selectedLanguage}
        languageOptions={languageOptions}
        setSelectedLanguage={setSelectedLanguage}
        selectedLlm={selectedLlm}
        llmOptions={llmOptions}
        setSelectedLlm={setSelectedLlm}
        errorMessage={configError}
        accentWarning={accentWarning}
      />

      <main className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-7xl flex-1 flex-col px-4 pb-12 pt-8 sm:px-6 sm:pb-14 lg:px-8 lg:pb-16">
        <Visual conversation={conversation} />

        <div className="mt-auto">
        <Promptbar
          prompt={prompt}
          setPrompt={setPrompt}
          instruct={instruct}
          setInstruct={setInstruct}
          showInstruct={showTtsSelector}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          disabled={isPromptDisabled}
          disabledReason={promptDisabledReason}
          submitError={submitError}
        />
        </div>
      </main>
    </div>
  );
};
