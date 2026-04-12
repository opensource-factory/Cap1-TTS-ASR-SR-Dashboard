"use client";

export const NavbarMessage = ({ children, tone = "muted" }) => {
  const toneClassName = {
    muted: "text-foreground/65",
    danger: "text-red-600",
    warning: "text-amber-600",
  }[tone];

  return <div className={`px-4 pb-3 text-sm sm:px-6 ${toneClassName}`}>{children}</div>;
};
