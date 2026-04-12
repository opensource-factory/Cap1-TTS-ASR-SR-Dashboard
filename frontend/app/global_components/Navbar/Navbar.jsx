"use client";

import { useState } from "react";
import { MobileNavbar } from "./components/MobileNavbar";
import { NavbarFields } from "./components/NavbarFields";
import { NavbarMessage } from "./components/NavbarMessage";
import { navOptions } from "./navbarUtils";

export const Navbar = ({
  mode,
  setMode,
  showTtsSelector,
  showLlmSelector,
  selectedTts,
  ttsOptions,
  setSelectedTts,
  isLoading,
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
  errorMessage,
  accentWarning,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
      {accentWarning ? <NavbarMessage tone="warning">{accentWarning}</NavbarMessage> : null}
    </header>
  );
};
