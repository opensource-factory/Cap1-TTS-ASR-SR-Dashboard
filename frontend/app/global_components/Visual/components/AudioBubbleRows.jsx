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

const Row = ({ values, tone = "default" }) => {
  if (values.length === 0) {
    return null;
  }

  const toneClassName =
    tone === "danger"
      ? "bg-red-100 px-2.5 py-1 text-red-500"
      : "bg-foreground/[0.05] px-2.5 py-1";

  return (
    <div className="mb-3 flex flex-wrap gap-2 text-xs text-foreground/55">
      {values.map((value) => (
        <span key={value} className={`rounded-full ${toneClassName}`}>
          {value}
        </span>
      ))}
    </div>
  );
};

export const MetadataRow = ({ metadata, tone }) => (
  <Row values={getMetadataValues(metadata)} tone={tone} />
);

export const TokenRow = ({ metadata, tone }) => (
  <Row values={getTokenValues(metadata)} tone={tone} />
);
