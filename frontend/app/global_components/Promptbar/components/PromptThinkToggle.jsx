"use client";

import Image from "next/image";

export const PromptThinkToggle = ({ enabled, onToggle, disabled }) => (
  <button
    type="button"
    onClick={onToggle}
    disabled={disabled}
    aria-pressed={enabled}
    aria-label={enabled ? "Turn thinking off" : "Turn thinking on"}
    className="inline-flex h-11 min-w-11 shrink-0 items-center justify-center self-end rounded-full border border-foreground/10 bg-background/80 px-3 transition hover:scale-[1.02] hover:bg-background disabled:cursor-not-allowed disabled:opacity-50 lg:self-center"
  >
    <Image
      src={enabled ? "/think_on.svg" : "/think_off.svg"}
      alt=""
      width={20}
      height={20}
    />
  </button>
);
