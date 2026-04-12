"use client";

export const PromptTextarea = ({
  value,
  onChange,
  onKeyDown,
  disabled,
  placeholder,
  className = "",
}) => (
  <label className={`flex min-w-0 ${className}`}>
    <input
      type="text"
      value={value}
      onChange={onChange}
      onKeyDown={onKeyDown}
      disabled={disabled}
      placeholder={placeholder}
      className="h-11 w-full rounded-full border border-transparent bg-transparent px-4 text-base text-foreground outline-none transition placeholder:text-foreground/45 focus:border-foreground/10 disabled:cursor-not-allowed disabled:opacity-60"
    />
  </label>
);
