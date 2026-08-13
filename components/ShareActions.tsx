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
  const [publicShare, setPublicShare] = useState({ artworkUrl: "", publicUrl: "" });
  const [copied, setCopied] = useState(false);
  const publicUrl = publicShare.artworkUrl === downloadUrl ? publicShare.publicUrl : "";

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
      setPublicShare({ artworkUrl: downloadUrl, publicUrl: payload.url });
      setCopied(false);
      setConsentOpen(false);
      await copyPublicUrl(payload.url);
    } catch (reason) {
      const message = reason instanceof Error ? reason.message.toUpperCase() : "PUBLIC LINK FAILED.";
      setError(`${message} YOUR LOCAL PNG IS STILL READY.`);
    } finally {
      setUploading(false);
    }
  }

  async function copyPublicUrl(url = publicUrl) {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      setCopied(false);
      setError("COPY FAILED. OPEN THE PUBLIC PAGE AND COPY ITS ADDRESS.");
    }
  }

  async function sharePublicUrl() {
    if (!publicUrl) return;
    try {
      if (navigator.share) {
        await navigator.share({ title: "Frame In Goa — HH Goa 2026", text: caption, url: publicUrl });
        return;
      }
      await copyPublicUrl();
    } catch (reason) {
      if (reason instanceof DOMException && reason.name === "AbortError") return;
      setError("LINK SHARE FAILED. YOU CAN STILL OPEN OR COPY IT.");
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
        <div className="public-link-ready" role="status">
          <span>● PUBLIC SIGNAL LIVE / NO LOGIN</span>
          <a className="public-link" href={publicUrl} target="_blank" rel="noreferrer">OPEN PUBLIC PAGE ↗</a>
          <div>
            <button type="button" className="mini-button" onClick={() => void copyPublicUrl()}>{copied ? "COPIED ✓" : "COPY LINK"}</button>
            <button type="button" className="mini-button" onClick={() => void sharePublicUrl()}>SHARE LINK ↗</button>
          </div>
        </div>
      ) : consentOpen ? (
        <div className="upload-consent">
          <p>NO ACCOUNT NEEDED. THIS UPLOADS ONLY YOUR FINAL PNG TO AN ANONYMOUS PUBLIC IMAGE HOST—NEVER THE ORIGINAL PHOTO. ANYONE WITH THE LINK CAN VIEW IT, AND ANONYMOUS UPLOADS CANNOT BE MANAGED OR DELETED LATER.</p>
          <div>
            <button type="button" className="mini-button" onClick={() => void uploadPublic()} disabled={uploading}>
              {uploading ? "CREATING PUBLIC LINK..." : "I UNDERSTAND — CREATE LINK"}
            </button>
            <button type="button" className="text-button" onClick={() => setConsentOpen(false)}>CANCEL</button>
          </div>
        </div>
      ) : (
        <button type="button" className="text-button create-link" onClick={() => setConsentOpen(true)}>CREATE FREE PUBLIC LINK ↗</button>
      )}
      {error ? <p className="error-note" role="alert">{error}</p> : null}
    </div>
  );
}
