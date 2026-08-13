import type { GeneratorFormat } from "@/types/generator";

export const X_MAX_WEIGHTED_LENGTH = 280;
export const X_URL_WEIGHT = 23;

export function xShareCaption(format: GeneratorFormat) {
  return format === "builder"
    ? "Builder mode: ON. Shipping from Goa with the people shaping what’s next. 🌴\n\n#FrameInGoa"
    : "New profile signal, straight from Goa. 🌴\n\nLess noise. More signal.\n\n#FrameInGoa";
}

export function xShareText(format: GeneratorFormat, publicUrl: string) {
  return `${xShareCaption(format)}\n\n${publicUrl}`;
}

export function xShareIntent(format: GeneratorFormat, publicUrl: string) {
  if (xWeightedLength(format) > X_MAX_WEIGHTED_LENGTH) {
    throw new Error("X share copy exceeds the post limit.");
  }
  return `https://x.com/intent/post?text=${encodeURIComponent(xShareText(format, publicUrl))}`;
}

export function xWeightedLength(format: GeneratorFormat) {
  const captionWeight = [...xShareCaption(format).normalize("NFC")]
    .reduce((total, character) => total + (character.codePointAt(0)! > 0x7f ? 2 : 1), 0);
  return captionWeight + 2 + X_URL_WEIGHT;
}
