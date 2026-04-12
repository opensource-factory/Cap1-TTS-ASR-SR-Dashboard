"use client";

export const Selector = ({ id, label, value, options, onChange, disabled = false }) => (
  <div className="flex w-full flex-col gap-2 sm:h-10 sm:w-auto sm:flex-row sm:items-center sm:gap-3">
    <label
      htmlFor={id}
      className="shrink-0 text-sm font-semibold text-foreground/80 sm:w-24"
    >
      {label}
    </label>
    <select
      id={id}
      value={value}
      onChange={onChange}
      disabled={disabled}
      className="w-full min-w-0 rounded-md border border-foreground/15 bg-background px-3 py-2 text-sm font-medium text-foreground shadow-sm outline-none transition focus:border-foreground/40 disabled:cursor-not-allowed disabled:opacity-50 sm:min-w-52"
    >
      {options.length === 0 ? (
        <option value="">No options available</option>
      ) : (
        options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))
      )}
    </select>
  </div>
);
