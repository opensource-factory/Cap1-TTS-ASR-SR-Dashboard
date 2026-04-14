"use client";

import { MarkdownText } from "./MarkdownText";

const getMetadataValues = (metadata = {}) =>
  [
    metadata.name,
    metadata.language,
    metadata.ttsName,
    metadata.llmName,
    metadata.think,
    metadata.stream,
  ].filter(Boolean);

const getTokenValues = (metadata = {}) =>
  [
    metadata.inputTokens !== null && metadata.inputTokens !== undefined
      ? `In ${metadata.inputTokens} tok`
      : null,
    metadata.outputTokens !== null && metadata.outputTokens !== undefined
      ? `Out ${metadata.outputTokens} tok`
      : null,
    metadata.totalTokens !== null && metadata.totalTokens !== undefined
      ? `Total ${metadata.totalTokens} tok`
      : null,
  ].filter(Boolean);

const MetadataRow = ({ metadata, tone = "default" }) => {
  const metadataValues = getMetadataValues(metadata);

  if (metadataValues.length === 0) {
    return null;
  }

  const toneClassName =
    tone === "danger"
      ? "bg-red-100 px-2.5 py-1 text-red-500"
      : "bg-foreground/[0.05] px-2.5 py-1";

  return (
    <div className="mb-3 flex flex-wrap gap-2 text-xs text-foreground/55">
      {metadataValues.map((value) => (
        <span key={value} className={`rounded-full ${toneClassName}`}>
          {value}
        </span>
      ))}
    </div>
  );
};

const TokenRow = ({ metadata, tone = "default" }) => {
  const tokenValues = getTokenValues(metadata);

  if (tokenValues.length === 0) {
    return null;
  }

  const toneClassName =
    tone === "danger"
      ? "bg-red-100 px-2.5 py-1 text-red-500"
      : "bg-foreground/[0.05] px-2.5 py-1";

  return (
    <div className="mb-3 flex flex-wrap gap-2 text-xs text-foreground/55">
      {tokenValues.map((value) => (
        <span key={value} className={`rounded-full ${toneClassName}`}>
          {value}
        </span>
      ))}
    </div>
  );
};

export const AudioMessageBubble = ({
  audioUrl,
  thinkingText,
  responseText,
  outputType,
  status,
  error,
  metadata,
}) => {
  const isTextResponse = outputType === "text";
  const hasThinkingText = Boolean(thinkingText);

  if (status === "pending") {
    if (isTextResponse && (responseText || hasThinkingText)) {
      return (
        <div className="max-w-2xl rounded-3xl rounded-bl-md border border-foreground/10 bg-foreground/[0.04] px-4 py-3 shadow-sm">
          <div className="mb-2 text-xs font-semibold tracking-[0.18em] text-foreground/45 uppercase">
            Streaming Response
          </div>
          {metadata ? <MetadataRow metadata={metadata} /> : null}
          {hasThinkingText ? (
            <div className="mb-3 rounded-2xl border border-foreground/10 bg-background/60 px-3 py-2">
              <div className="mb-1 text-[11px] font-semibold tracking-[0.16em] text-foreground/45 uppercase">
                Thinking
              </div>
              <p className="whitespace-pre-wrap text-sm leading-6 text-foreground/70">
                {thinkingText}
              </p>
            </div>
          ) : null}
          {responseText ? (
            <MarkdownText
              content={responseText}
              className="text-sm leading-6 text-foreground/88"
            />
          ) : (
            <p className="text-sm text-foreground/60">Generating...</p>
          )}
        </div>
      );
    }

    return (
      <div className="max-w-md rounded-3xl rounded-bl-md border border-foreground/10 bg-foreground/[0.04] px-4 py-3 text-sm text-foreground/60">
        {metadata ? <MetadataRow metadata={metadata} /> : null}
        {isTextResponse ? "Generating..." : "Generating audio..."}
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="max-w-md rounded-3xl rounded-bl-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
        {metadata ? <MetadataRow metadata={metadata} tone="danger" /> : null}
        {error}
      </div>
    );
  }

  if (isTextResponse) {
    return (
      <div className="max-w-2xl rounded-3xl rounded-bl-md border border-foreground/10 bg-foreground/[0.04] px-4 py-3 shadow-sm">
        <div className="mb-2 text-xs font-semibold tracking-[0.18em] text-foreground/45 uppercase">
          Model Response
        </div>
        {metadata ? <MetadataRow metadata={metadata} /> : null}
        {metadata ? <TokenRow metadata={metadata} /> : null}
        {hasThinkingText ? (
          <div className="mb-3 rounded-2xl border border-foreground/10 bg-background/60 px-3 py-2">
            <div className="mb-1 text-[11px] font-semibold tracking-[0.16em] text-foreground/45 uppercase">
              Thinking
            </div>
            <p className="whitespace-pre-wrap text-sm leading-6 text-foreground/70">
              {thinkingText}
            </p>
          </div>
        ) : null}
        <MarkdownText
          content={responseText}
          className="text-sm leading-6 text-foreground/88"
        />
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
