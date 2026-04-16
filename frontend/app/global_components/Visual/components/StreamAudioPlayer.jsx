"use client";

import { useEffect, useRef, useState } from "react";

export const StreamAudioPlayer = ({ audioSegments = [], status }) => {
  const audioRef = useRef(null);
  const [activeSegmentIndex, setActiveSegmentIndex] = useState(0);
  const currentSegment = audioSegments[activeSegmentIndex] || null;
  const isPlaybackComplete = audioSegments.length > 0 && activeSegmentIndex >= audioSegments.length;
  const isStreamInProgress = audioSegments.length > 0 && !isPlaybackComplete;

  useEffect(() => {
    if (!currentSegment?.url || !audioRef.current) {
      return;
    }

    const playCurrentSegment = async () => {
      try {
        audioRef.current.currentTime = 0;
        await audioRef.current.play();
      } catch {
        // Ignore autoplay rejections; the controls remain available.
      }
    };

    playCurrentSegment();
  }, [currentSegment?.url]);

  return (
    <div className="rounded-2xl border border-foreground/10 bg-background/60 px-3 py-3">
      <div className="mb-3 flex items-center gap-2">
        <span className="relative flex h-2.5 w-2.5">
          <span
            className={`absolute inline-flex h-full w-full rounded-full ${
              isStreamInProgress ? "animate-ping bg-emerald-400/70" : "bg-foreground/20"
            }`}
          />
          <span
            className={`relative inline-flex h-2.5 w-2.5 rounded-full ${
              isStreamInProgress ? "bg-emerald-500" : "bg-foreground/30"
            }`}
          />
        </span>
        <p className="text-sm text-foreground/65">
          {currentSegment
            ? isPlaybackComplete
              ? "Voice response is ready."
              : "Voice response is streaming."
            : status === "ready"
              ? "Voice response finished streaming."
              : "Preparing audio stream..."}
        </p>
      </div>
      <audio
        ref={audioRef}
        key={currentSegment?.url || "waiting"}
        controls
        autoPlay
        className="w-full"
        src={currentSegment?.url}
        onEnded={() => setActiveSegmentIndex((currentIndex) => currentIndex + 1)}
      >
        Your browser does not support the audio element.
      </audio>
    </div>
  );
};
