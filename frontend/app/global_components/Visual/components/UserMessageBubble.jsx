"use client";

export const UserMessageBubble = ({ prompt, instruct, metadata }) => (
  <div className="max-w-xl rounded-3xl rounded-br-md bg-foreground px-4 py-3 text-background shadow-sm">
    {metadata ? (
      <div className="mb-3 flex flex-wrap justify-end gap-2 text-xs text-background/70">
        <span className="rounded-full bg-background/10 px-2.5 py-1">{metadata.name}</span>
        <span className="rounded-full bg-background/10 px-2.5 py-1">{metadata.language}</span>
        <span className="rounded-full bg-background/10 px-2.5 py-1">{metadata.ttsName}</span>
      </div>
    ) : null}
    {instruct ? (
      <p className="mb-2 text-xs font-semibold tracking-[0.14em] text-background/70 uppercase">
        {instruct}
      </p>
    ) : null}
    <p className="text-sm leading-6">{prompt}</p>
  </div>
);
