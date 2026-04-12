"use client";

import { PromptSubmitButton } from "./components/PromptSubmitButton";
import { PromptTextarea } from "./components/PromptTextarea";

export const Promptbar = ({
  prompt,
  setPrompt,
  instruct,
  setInstruct,
  showInstruct,
  onSubmit,
  isSubmitting,
  disabled,
  disabledReason,
  submitError,
}) => {
  const handleKeyDown = (event) => {
    if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
      event.preventDefault();
      onSubmit(event);
    }
  };

  return (
    <section className="mx-auto w-full max-w-3xl">
      <form
        className="rounded-full border border-foreground/10 bg-foreground/[0.05] p-2 shadow-[0_14px_36px_rgba(0,0,0,0.08)]"
        onSubmit={onSubmit}
      >
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <PromptTextarea
            value={prompt}
            onChange={(event) => setPrompt(event.target.value)}
            onKeyDown={handleKeyDown}
            disabled={disabled || isSubmitting}
            placeholder="Ask anything"
            className={showInstruct ? "lg:basis-[70%]" : "lg:basis-full"}
          />

          {showInstruct ? (
            <PromptTextarea
              value={instruct}
              onChange={(event) => setInstruct(event.target.value)}
              onKeyDown={handleKeyDown}
              disabled={disabled || isSubmitting}
              placeholder="Instruct"
              className="lg:basis-[30%]"
            />
          ) : null}

          <PromptSubmitButton
            isSubmitting={isSubmitting}
            disabled={disabled || isSubmitting || !prompt.trim()}
          />
        </div>
      </form>

      {submitError ? <p className="mt-3 text-sm text-red-600">{submitError}</p> : null}
      {!submitError && disabledReason ? (
        <p className="mt-3 text-sm text-foreground/50">{disabledReason}</p>
      ) : null}
    </section>
  );
};
