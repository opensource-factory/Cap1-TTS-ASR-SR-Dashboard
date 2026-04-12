"use client";

import { AudioMessageBubble } from "./components/AudioMessageBubble";
import { UserMessageBubble } from "./components/UserMessageBubble";
import { VisualEmptyState } from "./components/VisualEmptyState";

export const Visual = ({ conversation }) => {
  if (conversation.length === 0) {
    return <VisualEmptyState />;
  }

  return (
    <section className="mb-8 flex-1 overflow-y-auto">
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
                status={turn.status}
                error={turn.error}
                metadata={turn.metadata}
              />
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};
