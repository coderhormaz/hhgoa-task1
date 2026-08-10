"use client";

import { forwardRef, useEffect, useState } from "react";
import { renderArtwork } from "@/lib/render-artwork";
import type { BuilderData, CardVariant, CropState, GeneratorFormat } from "@/types/generator";

interface ArtworkCanvasProps {
  format: GeneratorFormat;
  photoSrc: string;
  crop: CropState;
  builder: BuilderData;
  variant: CardVariant;
  className?: string;
  ariaLabel?: string;
  onReady?: () => void;
}

export const ArtworkCanvas = forwardRef<HTMLCanvasElement, ArtworkCanvasProps>(function ArtworkCanvas(
  { format, photoSrc, crop, builder, variant, className, ariaLabel, onReady },
  ref,
) {
  const [image, setImage] = useState<HTMLImageElement | null>(null);

  useEffect(() => {
    let active = true;
    const nextImage = new Image();
    nextImage.decoding = "async";
    nextImage.onload = () => {
      if (active) setImage(nextImage);
    };
    nextImage.src = photoSrc;
    return () => {
      active = false;
    };
  }, [photoSrc]);

  useEffect(() => {
    const canvas = typeof ref === "object" ? ref?.current : null;
    if (!canvas || !image) return;
    let active = true;
    document.fonts.ready.then(() => {
      if (!active) return;
      renderArtwork(canvas, { format, image, crop, builder, variant });
      onReady?.();
    });
    return () => {
      active = false;
    };
  }, [builder, crop, format, image, onReady, ref, variant]);

  return <canvas ref={ref} className={className} role="img" aria-label={ariaLabel ?? "Generated HH Goa artwork preview"} />;
});

export const BuilderIDCanvas = ArtworkCanvas;
export const PFPCanvas = ArtworkCanvas;
