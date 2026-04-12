"use client";

import { Selector } from "./Selector";

export const VoiceActorField = ({
  selectedVoice,
  voiceOptions,
  onChange,
  disabled = false,
  selectedVoiceDetails,
}) => (
  <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
    <Selector
      id="voice-select"
      label="Voice Actor"
      value={selectedVoice}
      options={voiceOptions}
      onChange={onChange}
      disabled={disabled}
    />
    {selectedVoiceDetails ? (
      <div className="w-full rounded-md border border-foreground/10 bg-foreground/5 px-3 py-2 text-xs leading-4 text-foreground/70 sm:max-w-64">
        {selectedVoiceDetails.language} | {selectedVoiceDetails.description}
      </div>
    ) : null}
  </div>
);
