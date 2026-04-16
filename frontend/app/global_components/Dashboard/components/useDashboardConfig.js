"use client";

import { useEffect, useState } from "react";

import {
  flattenLlmOptions,
  flattenTtsOptions,
  getLanguageOptions,
  getVoiceOptionsForTts,
  infoEndpoint,
} from "../../Navbar/navbarUtils";

export const useDashboardConfig = () => {
  const [llmOptions, setLlmOptions] = useState([]), [ttsOptions, setTtsOptions] = useState([]);
  const [ttsProviders, setTtsProviders] = useState([]);
  const [selectedLlm, setSelectedLlm] = useState(""), [selectedTts, setSelectedTts] = useState("");
  const [selectedVoice, setSelectedVoice] = useState(""), [selectedLanguage, setSelectedLanguage] = useState("");
  const [isLoadingConfig, setIsLoadingConfig] = useState(true);
  const [configError, setConfigError] = useState("");
  const voiceOptions = getVoiceOptionsForTts(ttsProviders, selectedTts), languageOptions = getLanguageOptions(voiceOptions);
  const selectedVoiceDetails = voiceOptions.find((voiceOption) => voiceOption.value === selectedVoice) || null;
  const accentWarning = selectedVoiceDetails?.language && selectedLanguage && selectedLanguage !== selectedVoiceDetails.language
    ? `Warning: this voice actor prefers ${selectedVoiceDetails.language}, so the accent might be funny in ${selectedLanguage}.`
    : "";

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
        const response = await fetch(infoEndpoint, { headers: { accept: "application/json" } });
        if (!response.ok) {
          throw new Error(`Failed to fetch config (${response.status})`);
        }

        const data = await response.json();
        if (!isMounted) {
          return;
        }

        const nextLlmOptions = flattenLlmOptions(data.llm);
        const nextTtsOptions = flattenTtsOptions(data.tts);
        setLlmOptions(nextLlmOptions);
        setTtsOptions(nextTtsOptions);
        setTtsProviders(data.tts || []);
        setSelectedLlm(nextLlmOptions[0]?.value || "");
        setSelectedTts(nextTtsOptions[0]?.value || "");
        setSelectedVoice((data.tts?.[0]?.voices || [])[0] || "");
      } catch (error) {
        if (isMounted) {
          setConfigError(error.message || "Unable to load model info.");
        }
      } finally {
        if (isMounted) {
          setIsLoadingConfig(false);
        }
      }
    };

    loadInfo();
    return () => { isMounted = false; };
  }, []);

  useEffect(() => {
    if (!voiceOptions.some((voiceOption) => voiceOption.value === selectedVoice)) {
      setSelectedVoice(voiceOptions[0]?.value || "");
    }
  }, [selectedTts, selectedVoice, voiceOptions]);

  useEffect(() => {
    if (!languageOptions.some((languageOption) => languageOption.value === selectedLanguage)) {
      setSelectedLanguage(selectedVoiceDetails?.language || "");
    }
  }, [languageOptions, selectedLanguage, selectedVoiceDetails]);

  return { llmOptions, ttsOptions, selectedLlm, setSelectedLlm, selectedTts, setSelectedTts, selectedVoice, setSelectedVoice, selectedLanguage, setSelectedLanguage, isLoadingConfig, configError, voiceOptions, languageOptions, selectedVoiceDetails, accentWarning };
};
