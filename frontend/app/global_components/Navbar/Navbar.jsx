"use client";

import { useEffect, useState } from "react";
import { MobileNavbar } from "./components/MobileNavbar";
import { NavbarFields } from "./components/NavbarFields";
import { NavbarMessage } from "./components/NavbarMessage";
import {
  flattenLlmOptions,
  flattenTtsOptions,
  getLanguageOptions,
  getVoiceOptionsForTts,
  infoEndpoint,
  navOptions,
} from "./navbarUtils";

export const Navbar = () => {
  const [mode, setMode] = useState("TTS");
  const [llmOptions, setLlmOptions] = useState([]);
  const [ttsOptions, setTtsOptions] = useState([]);
  const [ttsProviders, setTtsProviders] = useState([]);
  const [selectedLlm, setSelectedLlm] = useState("");
  const [selectedTts, setSelectedTts] = useState("");
  const [selectedVoice, setSelectedVoice] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadInfo = async () => {
      try {
        setIsLoading(true);
        setErrorMessage("");

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

        setErrorMessage(error.message || "Unable to load model info.");
      } finally {
        if (isMounted) {
          setIsLoading(false);
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
  const showAccentWarning =
    selectedVoiceDetails &&
    selectedLanguage &&
    selectedVoiceDetails.language &&
    selectedLanguage !== selectedVoiceDetails.language;

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

    if (!selectedLanguage) {
      setSelectedLanguage(selectedVoiceDetails.language);
    }
  }, [selectedLanguage, selectedVoiceDetails]);

  return (
    <header className="w-full border-b border-foreground/10 bg-background/95 backdrop-blur">
      <MobileNavbar
        isOpen={isMobileMenuOpen}
        setIsOpen={setIsMobileMenuOpen}
        mode={mode}
        navOptions={navOptions}
        setMode={setMode}
        showTtsSelector={showTtsSelector}
        showLlmSelector={showLlmSelector}
        selectedTts={selectedTts}
        ttsOptions={ttsOptions}
        setSelectedTts={setSelectedTts}
        isLoading={isLoading}
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
      />

      <div className="hidden min-h-16 px-4 py-3 sm:flex sm:items-center sm:justify-between sm:px-6">
        <div className="flex flex-1 flex-wrap items-center gap-3">
          <NavbarFields
            mode={mode}
            navOptions={navOptions}
            setMode={setMode}
            showTtsSelector={showTtsSelector}
            showLlmSelector={showLlmSelector}
            selectedTts={selectedTts}
            ttsOptions={ttsOptions}
            setSelectedTts={setSelectedTts}
            isLoading={isLoading}
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
          />
        </div>

        <div className="text-sm font-semibold tracking-[0.2em] text-foreground/65 uppercase">
          Demo Dashboard
        </div>
      </div>

      {isLoading ? <NavbarMessage>Loading model info...</NavbarMessage> : null}
      {errorMessage ? <NavbarMessage tone="danger">{errorMessage}</NavbarMessage> : null}

      {showAccentWarning ? (
        <NavbarMessage tone="warning">
          Warning: this voice actor prefers {selectedVoiceDetails.language}, so the accent might
          be funny in {selectedLanguage}.
        </NavbarMessage>
      ) : null}
    </header>
  );
};
