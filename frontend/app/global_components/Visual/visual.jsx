"use client";

import { useEffect, useRef } from "react";
import { AudioMessageBubble } from "./components/AudioMessageBubble";
import { UserMessageBubble } from "./components/UserMessageBubble";
import { VisualEmptyState } from "./components/VisualEmptyState";

export const Visual = ({ conversation }) => {
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [conversation]);

  if (conversation.length === 0) {
    return (
      <section className="min-h-0 flex-1 overflow-y-auto pb-4">
        <VisualEmptyState />
      </section>
    );
  }

  return (
    <section className="min-h-0 flex-1 overflow-y-auto pb-4">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
        {conversation.map((turn) => (
          <article key={turn.id} className="flex flex-col gap-3">
            <div className="flex justify-end">
              <UserMessageBubble
                prompt={turn.prompt}
                instruct={turn.instruct}
                metadata={turn.metadata}
              />
            </div>

            <div className="flex justify-start">
              <AudioMessageBubble
                audioUrl={turn.audioUrl}
                audioSegments={turn.audioSegments}
                thinkingText={turn.thinkingText}
                responseText={turn.responseText}
                outputType={turn.outputType}
                status={turn.status}
                error={turn.error}
                metadata={turn.metadata}
              />
            </div>
          </article>
        ))}
        <div ref={endRef} />
      </div>
    </section>
  );
};
