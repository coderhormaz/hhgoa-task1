"use client";

import { useRef } from "react";
import { ArtworkCanvas } from "./ArtworkCanvas";
import type { BuilderData, CardVariant, CropState } from "@/types/generator";

export function XProfilePreview({ photoSrc, crop, builder, variant }: { photoSrc: string; crop: CropState; builder: BuilderData; variant: CardVariant }) {
  const ref = useRef<HTMLCanvasElement>(null);
  return (
    <aside className="x-preview" aria-label="X circular profile preview">
      <span>X PREVIEW</span>
      <div className="x-preview-circle">
        <ArtworkCanvas ref={ref} format="pfp" photoSrc={photoSrc} crop={crop} builder={builder} variant={variant} />
      </div>
      <small>SAFE INSIDE THE CIRCLE.</small>
    </aside>
  );
}
