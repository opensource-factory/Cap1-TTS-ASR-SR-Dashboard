"use client";

import Image from "next/image";

export const PromptSubmitButton = ({ isSubmitting, disabled }) => (
  <button
    type="submit"
    disabled={disabled}
    className="inline-flex h-11 w-11 shrink-0 items-center justify-center self-end rounded-full bg-foreground text-background transition hover:scale-[1.02] hover:opacity-92 disabled:cursor-not-allowed disabled:opacity-50 lg:self-center"
  >
    <Image
      src={isSubmitting ? "/load.svg" : "/send.svg"}
      alt=""
      width={16}
      height={16}
      className={isSubmitting ? "animate-spin" : ""}
    />
  </button>
);
