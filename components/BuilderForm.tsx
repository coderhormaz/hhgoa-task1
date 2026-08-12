"use client";

import { BuilderClassGenerator } from "./BuilderClassGenerator";
import type { BuilderData } from "@/types/generator";

interface BuilderFormProps {
  value: BuilderData;
  onChange: (value: BuilderData) => void;
  onReroll: () => void;
}

export function BuilderForm({ value, onChange, onReroll }: BuilderFormProps) {
  function update(field: "name" | "stack" | "handle", next: string) {
    onChange({ ...value, [field]: next });
  }

  return (
    <form className="builder-form" onSubmit={(event) => event.preventDefault()}>
      <label>
        <span>NAME</span>
        <input
          value={value.name}
          onChange={(event) => update("name", event.target.value.slice(0, 60))}
          placeholder="e.g. Hormaz Daruwala"
          autoComplete="name"
        />
      </label>
      <label>
        <span>I BUILD WITH</span>
        <input
          value={value.stack}
          onChange={(event) => update("stack", event.target.value.slice(0, 90))}
          placeholder="e.g. AI + Web3 + Next.js"
        />
      </label>
      <label>
        <span>X HANDLE · OPTIONAL</span>
        <input
          value={value.handle}
          onChange={(event) => update("handle", event.target.value.replace(/\s/g, "").slice(0, 32))}
          placeholder="e.g. @hormaz"
          autoCapitalize="off"
          autoCorrect="off"
        />
      </label>
      <BuilderClassGenerator value={value.builderClass} onReroll={onReroll} />
    </form>
  );
}
