"use client";

import { useState } from "react";
import type { RefObject } from "react";
import { canvasToBlob } from "@/lib/render-artwork";
import { safeFileSlug } from "@/lib/builder-class";
import type { BuilderData, GeneratorFormat } from "@/types/generator";

interface ShareActionsProps {
  canvasRef: RefObject<HTMLCanvasElement | null>;
  downloadUrl: string;
  format: GeneratorFormat;
  builder: BuilderData;
}

export function ShareActions({ canvasRef, downloadUrl, format, builder }: ShareActionsProps) {
  const [error, setError] = useState("");
  const [consentOpen, setConsentOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [publicUrl, setPublicUrl] = useState("");

  const caption = format === "builder"
    ? `${builder.builderClass} reporting from Goa 🌴\n\nBuilding. Shipping. Probably debugging by the beach.\n\n#FrameInGoa`
    : `Proof I’m shipping from paradise 🌴\n\nLess noise. More signal.\n\n#FrameInGoa`;

  async function getFile() {
    const canvas = canvasRef.current;
    if (!canvas) throw new Error("ARTWORK IS STILL LOCKING IN. TRY AGAIN.");
    const blob = await canvasToBlob(canvas);
    const base = format === "builder" ? `hh-goa-${safeFileSlug(builder.name)}` : "frame-in-goa";
    return new File([blob], `${base}.png`, { type: "image/png" });
  }

  async function share() {
    try {
      setError("");
      const file = await getFile();
      const shareData = { title: "Frame In Goa — HH Goa 2026", text: caption, files: [file], ...(publicUrl ? { url: publicUrl } : {}) };
      if (navigator.share && navigator.canShare?.(shareData)) {
        await navigator.share(shareData);
        return;
      }
      const text = `${caption}${publicUrl ? `\n\n${publicUrl}` : ""}`;
      const intent = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
      window.open(intent, "_blank", "noopener,noreferrer");
    } catch (reason) {
      if (reason instanceof DOMException && reason.name === "AbortError") return;
      setError("SHARE FAILED. YOUR PNG IS STILL READY TO DOWNLOAD.");
    }
  }

  async function uploadPublic() {
    try {
      setUploading(true);
      setError("");
      const file = await getFile();
      const formData = new FormData();
      formData.append("image", file);
      formData.append("metadata", JSON.stringify({
        format,
        name: builder.name,
        builderClass: builder.builderClass,
        builderId: builder.builderId,
      }));
      const response = await fetch("/api/share", { method: "POST", body: formData });
      const payload = await response.json() as { url?: string; error?: string };
      if (!response.ok || !payload.url) throw new Error(payload.error || "Storage failed");
      setPublicUrl(payload.url);
      setConsentOpen(false);
      await navigator.clipboard?.writeText(payload.url);
    } catch {
      setError("PUBLIC LINK FAILED. NOTHING WAS UPLOADED—YOUR LOCAL PNG IS SAFE.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="share-actions">
      {downloadUrl ? (
        <a
          className="primary-button"
          href={downloadUrl}
          download={`${format === "builder" ? `hh-goa-${safeFileSlug(builder.name)}` : "frame-in-goa"}.png`}
        >
          ↓ DOWNLOAD PNG
        </a>
      ) : (
        <button type="button" className="primary-button" disabled>LOCKING PNG...</button>
      )}
      <button type="button" className="outline-button share-x" onClick={() => void share()}>𝕏 SHARE TO X</button>
      {publicUrl ? (
        <a className="public-link" href={publicUrl}>PUBLIC LINK COPIED ↗</a>
      ) : consentOpen ? (
        <div className="upload-consent">
          <p>CREATING A PUBLIC LINK UPLOADS THIS FINAL PNG TO THIS SERVER. YOUR ORIGINAL PHOTO IS NOT UPLOADED.</p>
          <div>
            <button type="button" className="mini-button" onClick={() => void uploadPublic()} disabled={uploading}>
              {uploading ? "UPLOADING FINAL ARTWORK..." : "UPLOAD FINAL ARTWORK"}
            </button>
            <button type="button" className="text-button" onClick={() => setConsentOpen(false)}>CANCEL</button>
          </div>
        </div>
      ) : (
        <button type="button" className="text-button create-link" onClick={() => setConsentOpen(true)}>CREATE PUBLIC LINK ↗</button>
      )}
      {error ? <p className="error-note" role="alert">{error}</p> : null}
    </div>
  );
}
