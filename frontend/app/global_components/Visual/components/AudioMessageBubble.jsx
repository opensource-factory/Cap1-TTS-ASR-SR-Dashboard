"use client";

const MetadataRow = ({ metadata }) => (
  <div className="mb-3 flex flex-wrap gap-2 text-xs text-foreground/55">
    <span className="rounded-full bg-foreground/[0.05] px-2.5 py-1">{metadata.name}</span>
    <span className="rounded-full bg-foreground/[0.05] px-2.5 py-1">{metadata.language}</span>
    <span className="rounded-full bg-foreground/[0.05] px-2.5 py-1">{metadata.ttsName}</span>
  </div>
);

export const AudioMessageBubble = ({ audioUrl, status, error, metadata }) => {
  if (status === "pending") {
    return (
      <div className="max-w-md rounded-3xl rounded-bl-md border border-foreground/10 bg-foreground/[0.04] px-4 py-3 text-sm text-foreground/60">
        {metadata ? <MetadataRow metadata={metadata} /> : null}
        Generating audio...
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="max-w-md rounded-3xl rounded-bl-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
        {metadata ? (
          <div className="mb-3 flex flex-wrap gap-2 text-xs text-red-500">
            <span className="rounded-full bg-red-100 px-2.5 py-1">{metadata.name}</span>
            <span className="rounded-full bg-red-100 px-2.5 py-1">{metadata.language}</span>
            <span className="rounded-full bg-red-100 px-2.5 py-1">{metadata.ttsName}</span>
          </div>
        ) : null}
        {error}
      </div>
    );
  }

  return (
    <div className="max-w-md rounded-3xl rounded-bl-md border border-foreground/10 bg-foreground/[0.04] px-4 py-3 shadow-sm">
      <div className="mb-2 text-xs font-semibold tracking-[0.18em] text-foreground/45 uppercase">
        Generated Audio
      </div>
      {metadata ? <MetadataRow metadata={metadata} /> : null}
      <audio controls className="w-full" src={audioUrl}>
        Your browser does not support the audio element.
      </audio>
    </div>
  );
};
