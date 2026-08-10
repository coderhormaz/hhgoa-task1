"use client";

import { useRef, useState } from "react";
import { decodePhoto } from "@/lib/image-processing";
import type { PhotoAsset } from "@/types/generator";

interface PhotoUploaderProps {
  onPhoto: (photo: PhotoAsset) => void;
}

export function PhotoUploader({ onPhoto }: PhotoUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function process(file?: File) {
    if (!file) return;
    setBusy(true);
    setError("");
    try {
      onPhoto(await decodePhoto(file));
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "PHOTO SIGNAL LOST. TRY AGAIN.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="uploader-wrap">
      <button
        type="button"
        className={`photo-drop ${dragging ? "is-dragging" : ""}`}
        onClick={() => inputRef.current?.click()}
        onDragEnter={(event) => { event.preventDefault(); setDragging(true); }}
        onDragOver={(event) => event.preventDefault()}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          void process(event.dataTransfer.files[0]);
        }}
        disabled={busy}
      >
        <span className="drop-sun" aria-hidden="true">☀</span>
        <strong>{busy ? "REMOVING NOISE..." : "DROP PHOTO HERE"}</strong>
        <small>{busy ? "SIGNAL ALMOST FOUND." : "or tap to choose"}</small>
        <i>JPG · PNG · WEBP · HEIC · HEIF</i>
      </button>
      <input
        ref={inputRef}
        className="sr-only"
        type="file"
        accept="image/jpeg,image/png,image/webp,image/heic,image/heif,.heic,.heif"
        onChange={(event) => void process(event.target.files?.[0])}
        aria-label="Choose a portrait photo"
      />
      <p className="privacy-note">▣ STAYS ON YOUR DEVICE UNTIL YOU CHOOSE TO CREATE A PUBLIC SHARE LINK.</p>
      {error ? <p className="error-note" role="alert">{error}</p> : null}
    </div>
  );
}
