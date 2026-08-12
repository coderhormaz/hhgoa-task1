"use client";

import { useRef } from "react";
import { ArtworkCanvas } from "./ArtworkCanvas";
import type { BuilderData, CropState, GeneratorFormat } from "@/types/generator";

interface FormatSelectorProps {
  builder: BuilderData;
  crop: CropState;
  onSelect: (format: GeneratorFormat) => void;
}

export function FormatSelector({ builder, crop, onSelect }: FormatSelectorProps) {
  const pfpRef = useRef<HTMLCanvasElement>(null);
  const builderRef = useRef<HTMLCanvasElement>(null);
  return (
    <section className="flow-section format-section" aria-labelledby="format-heading">
      <div className="section-number">STEP 01 / SIGNAL PATH</div>
      <h1 id="format-heading" className="flow-title">PICK YOUR <em>POISON.</em></h1>
      <div className="format-grid">
        <button className="format-poster format-poster--pfp" type="button" onClick={() => onSelect("pfp")}>
          <span className="format-copy"><small>PFP MODE / 1:1</small><strong>FRAME<br />MY FACE</strong><i>A punchy Goa badge, built to survive the circle crop.</i></span>
          <span className="format-art format-art--square">
            <ArtworkCanvas ref={pfpRef} format="pfp" photoSrc="/demo-builder.png" crop={crop} builder={builder} variant="classic" />
          </span>
          <span className="format-spec" aria-hidden="true">1080 × 1080<br />SOCIAL READY</span>
          <span className="format-arrow" aria-hidden="true">↗</span>
        </button>
        <button className="format-poster format-poster--builder" type="button" onClick={() => onSelect("builder")}>
          <span className="format-copy"><small>BUILDER ID</small><strong>IDENTIFY ME</strong><i>Officially unofficial proof that you build things.</i></span>
          <span className="format-art">
            <ArtworkCanvas ref={builderRef} format="builder" photoSrc="/demo-builder.png" crop={crop} builder={builder} variant="classic" />
          </span>
          <span className="format-arrow" aria-hidden="true">↗</span>
        </button>
      </div>
    </section>
  );
}
