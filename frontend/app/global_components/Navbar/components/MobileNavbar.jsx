"use client";

import Image from "next/image";
import { NavbarFields } from "./NavbarFields";

export const MobileNavbar = ({
  isOpen,
  setIsOpen,
  mode,
  navOptions,
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
}) => (
  <div className="sm:hidden">
    <div className="flex min-h-16 items-center justify-between px-4 py-3">
      <div className="text-sm font-semibold tracking-[0.2em] text-foreground/65 uppercase">
        Demo Dashboard
      </div>

      <button
        type="button"
        aria-label="Toggle navigation menu"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((current) => !current)}
        className="rounded-md border border-foreground/15 bg-background p-2 shadow-sm transition hover:bg-foreground/5"
      >
        <Image src="/hamburger.svg" alt="" width={20} height={20} className="dark:invert" />
      </button>
    </div>

    {isOpen ? (
      <div className="border-t border-foreground/10 px-4 pb-4 pt-3">
        <div className="flex flex-col gap-3">
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
      </div>
    ) : null}
  </div>
);
