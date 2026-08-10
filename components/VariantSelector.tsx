"use client";

import type { CardVariant } from "@/types/generator";

const variants: Array<{ id: CardVariant; label: string }> = [
  { id: "classic", label: "CLASSIC" },
  { id: "after-dark", label: "AFTER DARK" },
  { id: "loud", label: "LOUD" },
];

export function VariantSelector({ value, onChange }: { value: CardVariant; onChange: (value: CardVariant) => void }) {
  return (
    <div className="variant-selector" role="group" aria-label="Artwork variation">
      {variants.map((variant) => (
        <button
          type="button"
          key={variant.id}
          className={value === variant.id ? "is-active" : ""}
          onClick={() => onChange(variant.id)}
          aria-pressed={value === variant.id}
        >
          {value === variant.id ? "✦ " : ""}{variant.label}
        </button>
      ))}
    </div>
  );
}
