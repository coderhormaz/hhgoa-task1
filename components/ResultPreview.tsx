"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ArtworkCanvas } from "./ArtworkCanvas";
import { canvasToBlob } from "@/lib/render-artwork";
import { ShareActions } from "./ShareActions";
import { VariantSelector } from "./VariantSelector";
import { XProfilePreview } from "./XProfilePreview";
import type { BuilderData, CardVariant, CropState, GeneratorFormat } from "@/types/generator";

interface ResultPreviewProps {
  format: GeneratorFormat;
  photoSrc: string;
  crop: CropState;
  builder: BuilderData;
  variant: CardVariant;
  onVariant: (variant: CardVariant) => void;
  onEdit: () => void;
  onAnother: () => void;
}

export function ResultPreview({ format, photoSrc, crop, builder, variant, onVariant, onEdit, onAnother }: ResultPreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [downloadUrl, setDownloadUrl] = useState("");

  const handleReady = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    void canvasToBlob(canvas).then((blob) => {
      setDownloadUrl((current) => {
        if (current) URL.revokeObjectURL(current);
        return URL.createObjectURL(blob);
      });
    });
  }, []);

  useEffect(() => () => {
    if (downloadUrl) URL.revokeObjectURL(downloadUrl);
  }, [downloadUrl]);
  return (
    <section className="result-screen">
      <div className="result-copy">
        <h1>YOU’RE<br /><em>GOA</em> READY.</h1>
        <p>● BUILDER DETECTED / SIGNAL LOCKED</p>
        <VariantSelector value={variant} onChange={onVariant} />
        <ShareActions canvasRef={canvasRef} downloadUrl={downloadUrl} format={format} builder={builder} />
        <div className="secondary-actions">
          <button type="button" className="outline-button" onClick={onEdit}>✎ EDIT</button>
          <button type="button" className="outline-button" onClick={onAnother}>MAKE ANOTHER ↗</button>
        </div>
      </div>
      <div className={`result-art result-art--${format}`}>
        <div className="result-card-wrap">
          {format === "pfp" ? <span className="square-export-label">SQUARE EXPORT</span> : null}
          <ArtworkCanvas
            ref={canvasRef}
            format={format}
            photoSrc={photoSrc}
            crop={crop}
            builder={builder}
            variant={variant}
            onReady={handleReady}
          />
          <span className="hh-stamp" aria-hidden="true">HH<small>GOA / 26</small></span>
        </div>
        <XProfilePreview photoSrc={photoSrc} crop={crop} builder={builder} variant={variant} />
      </div>
      <footer className="result-footer">#FrameInGoa <span>/</span> LESS NOISE. <em>MORE SIGNAL.</em></footer>
    </section>
  );
}
