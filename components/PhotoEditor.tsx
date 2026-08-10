"use client";

import { useEffect, useRef, useState } from "react";
import { drawPhotoCover } from "@/lib/render-artwork";
import type { CropState, PhotoAsset } from "@/types/generator";

interface PhotoEditorProps {
  photo: PhotoAsset;
  crop: CropState;
  onChange: (updater: CropState | ((current: CropState) => CropState)) => void;
  onReset: () => void;
}

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

export function PhotoEditor({ photo, crop, onChange, onReset }: PhotoEditorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const lastPinch = useRef<number | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const image = new Image();
    image.onload = () => {
      imageRef.current = image;
      setLoaded(true);
    };
    image.src = photo.src;
  }, [photo.src]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const image = imageRef.current;
    if (!canvas || !image || !loaded) return;
    const context = canvas.getContext("2d");
    if (!context) return;
    context.fillStyle = "#0b6839";
    context.fillRect(0, 0, 720, 720);
    drawPhotoCover(context, image, { x: 0, y: 0, width: 720, height: 720 }, crop);
    context.strokeStyle = "#fee101";
    context.lineWidth = 14;
    context.strokeRect(16, 16, 688, 688);
    context.save();
    context.setLineDash([5, 10]);
    context.strokeStyle = "#ff0080";
    context.lineWidth = 4;
    context.strokeRect(30, 30, 660, 660);
    context.restore();
  }, [crop, loaded]);

  function distance() {
    const points = [...pointers.current.values()];
    if (points.length < 2) return null;
    return Math.hypot(points[0].x - points[1].x, points[0].y - points[1].y);
  }

  return (
    <div className="photo-editor">
      <div
        className="crop-surface"
        onPointerDown={(event) => {
          event.currentTarget.setPointerCapture(event.pointerId);
          pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
          lastPinch.current = distance();
        }}
        onPointerMove={(event) => {
          const previous = pointers.current.get(event.pointerId);
          if (!previous) return;
          pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
          if (pointers.current.size > 1) {
            const nextDistance = distance();
            if (nextDistance && lastPinch.current) {
              const ratio = nextDistance / lastPinch.current;
              onChange((current) => ({ ...current, zoom: clamp(current.zoom * ratio, 1, 3) }));
            }
            lastPinch.current = nextDistance;
            return;
          }
          const rect = event.currentTarget.getBoundingClientRect();
          const deltaX = ((event.clientX - previous.x) / rect.width) * 2;
          const deltaY = ((event.clientY - previous.y) / rect.height) * 2;
          onChange((current) => ({
            ...current,
            x: clamp(current.x + deltaX, -1, 1),
            y: clamp(current.y + deltaY, -1, 1),
          }));
        }}
        onPointerUp={(event) => {
          pointers.current.delete(event.pointerId);
          lastPinch.current = distance();
        }}
        onPointerCancel={(event) => pointers.current.delete(event.pointerId)}
        onWheel={(event) => {
          event.preventDefault();
          onChange((current) => ({ ...current, zoom: clamp(current.zoom - event.deltaY * 0.0015, 1, 3) }));
        }}
      >
        <canvas ref={canvasRef} width={720} height={720} aria-label="Photo crop preview. Drag to reposition and pinch or scroll to zoom." />
        <span className="crop-cross crop-cross--x" aria-hidden="true" />
        <span className="crop-cross crop-cross--y" aria-hidden="true" />
      </div>
      <div className="zoom-control">
        <label htmlFor="crop-zoom">ZOOM / {crop.zoom.toFixed(2)}×</label>
        <input
          id="crop-zoom"
          type="range"
          min="1"
          max="3"
          step="0.01"
          value={crop.zoom}
          onChange={(event) => onChange({ ...crop, zoom: Number(event.target.value) })}
        />
        <button type="button" className="text-button" onClick={onReset}>RESET ↺</button>
      </div>
      <p className="editor-hint">DRAG TO MOVE · PINCH OR SCROLL TO ZOOM</p>
    </div>
  );
}
