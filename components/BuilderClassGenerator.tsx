"use client";

interface BuilderClassGeneratorProps {
  value: string;
  onReroll: () => void;
}

export function BuilderClassGenerator({ value, onReroll }: BuilderClassGeneratorProps) {
  return (
    <div className="class-generator" aria-live="polite">
      <span>YOUR BUILDER CLASS</span>
      <div>
        <strong key={value}>{value}</strong>
        <button type="button" className="outline-button" onClick={onReroll}>↻ REROLL</button>
      </div>
    </div>
  );
}
