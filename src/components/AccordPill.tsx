"use client";

import { getAccordColor } from "@/lib/accords";

export function AccordPill({
  accord,
  large = false,
  onClick,
  selected,
}: {
  accord: string;
  large?: boolean;
  onClick?: () => void;
  selected?: boolean;
}) {
  const { bg, fg } = getAccordColor(accord);
  return (
    <span
      onClick={onClick}
      className={`inline-block rounded-full ${large ? "px-3 py-1 text-sm font-semibold" : "px-2.5 py-0.5 text-xs"} ${onClick ? "cursor-pointer hover:opacity-80 transition-opacity" : ""} ${selected ? "ring-2 ring-offset-1" : ""}`}
      style={{ backgroundColor: bg, color: fg, ...(selected ? { ringColor: fg } : {}) }}
    >
      {accord}
    </span>
  );
}
