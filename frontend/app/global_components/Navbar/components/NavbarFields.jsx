"use client";

import { Selector } from "./Selector";
import { VoiceActorField } from "./VoiceActorField";

export const NavbarFields = ({
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
  <>
    <Selector
      id="pipeline-select"
      label="Mode"
      value={mode}
      options={navOptions.map((option) => ({ label: option, value: option }))}
      onChange={(event) => setMode(event.target.value)}
    />

    {showTtsSelector ? (
      <>
        <Selector
          id="tts-select"
          label="TTS Name"
          value={selectedTts}
          options={ttsOptions}
          onChange={(event) => setSelectedTts(event.target.value)}
          disabled={isLoading || ttsOptions.length === 0}
        />

        <VoiceActorField
          selectedVoice={selectedVoice}
          voiceOptions={voiceOptions}
          onChange={(event) => setSelectedVoice(event.target.value)}
          disabled={isLoading || voiceOptions.length === 0}
          selectedVoiceDetails={selectedVoiceDetails}
        />

        <Selector
          id="language-select"
          label="Language"
          value={selectedLanguage}
          options={languageOptions}
          onChange={(event) => setSelectedLanguage(event.target.value)}
          disabled={isLoading || languageOptions.length === 0}
        />
      </>
    ) : null}

    {showLlmSelector ? (
      <Selector
        id="llm-select"
        label="LLM Name"
        value={selectedLlm}
        options={llmOptions}
        onChange={(event) => setSelectedLlm(event.target.value)}
        disabled={isLoading || llmOptions.length === 0}
      />
    ) : null}
  </>
);
