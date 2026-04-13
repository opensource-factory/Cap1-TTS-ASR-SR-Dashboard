"use client";

export const PromptStreamToggle = ({ enabled, onToggle, disabled }) => (
  <button
    type="button"
    onClick={onToggle}
    disabled={disabled}
    role="switch"
    aria-checked={enabled}
    aria-label={enabled ? "Turn streaming off" : "Turn streaming on"}
    className="inline-flex h-11 shrink-0 items-center gap-2 self-end rounded-full border border-foreground/10 bg-background/80 px-3 text-xs font-semibold tracking-[0.14em] text-foreground/70 uppercase transition hover:scale-[1.02] hover:bg-background disabled:cursor-not-allowed disabled:opacity-50 lg:self-center"
  >
    <span>Stream</span>
    <span
      className={`relative h-6 w-11 rounded-full transition ${
        enabled ? "bg-foreground" : "bg-foreground/15"
      }`}
    >
      <span
        className={`absolute top-1 h-4 w-4 rounded-full bg-background transition ${
          enabled ? "left-6" : "left-1"
        }`}
      />
    </span>
  </button>
);
