"use client";

import { useEffect, useRef } from "react";

import { MarkdownText } from "./MarkdownText";
import { MetadataRow, TokenRow } from "./AudioBubbleRows";
import { StreamAudioPlayer } from "./StreamAudioPlayer";

const Transcript = ({ responseText }) =>
  responseText ? (
    <div className="mb-3">
      <div className="mb-1 text-[11px] font-semibold tracking-[0.16em] text-foreground/45 uppercase">
        Transcript
      </div>
      <MarkdownText content={responseText} className="text-sm leading-6 text-foreground/88" />
    </div>
  ) : null;

const Thinking = ({ thinkingText }) =>
  thinkingText ? (
    <div className="mb-3 rounded-2xl border border-foreground/10 bg-background/60 px-3 py-2">
      <div className="mb-1 text-[11px] font-semibold tracking-[0.16em] text-foreground/45 uppercase">
        Thinking
      </div>
      <p className="whitespace-pre-wrap text-sm leading-6 text-foreground/70">{thinkingText}</p>
    </div>
  ) : null;

export const AudioMessageBubble = (props) => {
  const { audioUrl, audioSegments = [], thinkingText, responseText, outputType, status, error, metadata } = props;
  const generatedAudioRef = useRef(null);
  const hasAudioSegments = audioSegments.length > 0;
  const isPlaybackComplete = hasAudioSegments && status === "ready";

  useEffect(() => {
    if (outputType === "text" || hasAudioSegments || !audioUrl || !generatedAudioRef.current) {
      return;
    }

    generatedAudioRef.current.play().catch(() => {});
  }, [audioUrl, hasAudioSegments, outputType]);

  if (status === "error") {
    return (
      <div className="max-w-md rounded-3xl rounded-bl-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
        <MetadataRow metadata={metadata} tone="danger" />
        {error}
      </div>
    );
  }

  if (outputType === "text") {
    return (
      <div className="max-w-2xl rounded-3xl rounded-bl-md border border-foreground/10 bg-foreground/[0.04] px-4 py-3 shadow-sm">
        <div className="mb-2 text-xs font-semibold tracking-[0.18em] text-foreground/45 uppercase">
          {status === "pending" ? "Streaming Response" : "Model Response"}
        </div>
        <MetadataRow metadata={metadata} />
        {status === "ready" ? <TokenRow metadata={metadata} /> : null}
        <Thinking thinkingText={thinkingText} />
        {responseText ? (
          <MarkdownText content={responseText} className="text-sm leading-6 text-foreground/88" />
        ) : (
          <p className="text-sm text-foreground/60">Generating...</p>
        )}
      </div>
    );
  }

  if (hasAudioSegments) {
    return (
      <div className="max-w-2xl rounded-3xl rounded-bl-md border border-foreground/10 bg-foreground/[0.04] px-4 py-3 shadow-sm">
        <div className="mb-2 text-xs font-semibold tracking-[0.18em] text-foreground/45 uppercase">
          {status === "pending" ? "Streaming Audio" : "Streamed Audio"}
        </div>
        <MetadataRow metadata={metadata} />
        {status === "ready" ? <TokenRow metadata={metadata} /> : null}
        <StreamAudioPlayer audioSegments={audioSegments} status={status} />
        {isPlaybackComplete ? (
          <Transcript responseText={responseText} />
        ) : responseText ? (
          <p className="mt-3 text-sm text-foreground/60">
            Finishing audio playback before showing the full text.
          </p>
        ) : null}
      </div>
    );
  }

  return (
    <div className="max-w-md rounded-3xl rounded-bl-md border border-foreground/10 bg-foreground/[0.04] px-4 py-3 shadow-sm">
      <div className="mb-2 text-xs font-semibold tracking-[0.18em] text-foreground/45 uppercase">
        {status === "pending" ? "Generating Audio" : "Generated Audio"}
      </div>
      <MetadataRow metadata={metadata} />
      <audio ref={generatedAudioRef} controls autoPlay className="w-full" src={audioUrl}>Your browser does not support the audio element.</audio>
    </div>
  );
};
