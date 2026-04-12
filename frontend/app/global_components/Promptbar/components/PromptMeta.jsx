"use client";

export const PromptMeta = ({ selectionSummary }) => (
  <div className="flex flex-col gap-2">
    <div className="text-xs font-semibold tracking-[0.22em] text-foreground/45 uppercase">
      Promptbar
    </div>
    <p className="text-sm leading-6 text-foreground/72">{selectionSummary}</p>
  </div>
);
