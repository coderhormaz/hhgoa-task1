"use client";

import { useState } from "react";
import type { RefObject } from "react";
import { canvasToBlob } from "@/lib/render-artwork";
import { safeFileSlug } from "@/lib/builder-class";
import { xShareCaption, xShareIntent } from "@/lib/share-copy";
import type { BuilderData, GeneratorFormat } from "@/types/generator";

interface ShareActionsProps {
  canvasRef: RefObject<HTMLCanvasElement | null>;
  downloadUrl: string;
  format: GeneratorFormat;
  builder: BuilderData;
}

type PublicLinkAction = "copy" | "x";

const PUBLIC_SHARE_DIMENSIONS: Record<GeneratorFormat, { width: number; height: number }> = {
  builder: { width: 720, height: 900 },
  pfp: { width: 720, height: 720 },
};
const MAX_PUBLIC_SHARE_BYTES = 4 * 1024 * 1024;

export function ShareActions({ canvasRef, downloadUrl, format, builder }: ShareActionsProps) {
  const [error, setError] = useState("");
  const [consentOpen, setConsentOpen] = useState(false);
  const [publicLinkAction, setPublicLinkAction] = useState<PublicLinkAction>("copy");
  const [uploading, setUploading] = useState(false);
  const [publicShare, setPublicShare] = useState({ artworkUrl: "", publicUrl: "" });
  const [copied, setCopied] = useState(false);
  const publicUrl = publicShare.artworkUrl === downloadUrl ? publicShare.publicUrl : "";

  const caption = xShareCaption(format);

  async function getPublicShareFile() {
    const sourceCanvas = canvasRef.current;
    if (!sourceCanvas) throw new Error("ARTWORK IS STILL LOCKING IN. TRY AGAIN.");

    const { width, height } = PUBLIC_SHARE_DIMENSIONS[format];
    const shareCanvas = document.createElement("canvas");
    shareCanvas.width = width;
    shareCanvas.height = height;
    const context = shareCanvas.getContext("2d");
    if (!context) throw new Error("PUBLIC SHARE COPY COULD NOT BE CREATED.");

    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = "high";
    context.drawImage(sourceCanvas, 0, 0, width, height);

    const blob = await canvasToBlob(shareCanvas);
    if (blob.size > MAX_PUBLIC_SHARE_BYTES) {
      throw new Error("PUBLIC SHARE COPY IS TOO LARGE. TRY A DIFFERENT PHOTO.");
    }
    const base = format === "builder" ? `hh-goa-${safeFileSlug(builder.name)}` : "frame-in-goa";
    return new File([blob], `${base}.png`, { type: "image/png" });
  }

  function shareToX() {
    setError("");
    if (publicUrl) {
      window.open(xShareIntent(format, publicUrl), "_blank", "noopener,noreferrer");
      return;
    }
    setPublicLinkAction("x");
    setConsentOpen(true);
  }

  async function uploadPublic() {
    const action = publicLinkAction;

    try {
      setUploading(true);
      setError("");
      const file = await getPublicShareFile();
      const formData = new FormData();
      formData.append("image", file);
      formData.append("metadata", JSON.stringify({ format }));
      const response = await fetch("/api/share", { method: "POST", body: formData });
      const payload = await response.json().catch(() => null) as { url?: string; error?: string } | null;
      if (!response.ok || !payload?.url) {
        const fallback = response.status === 413
          ? "PUBLIC SHARE COPY WAS TOO LARGE FOR THE HOST."
          : `PUBLIC STORAGE REQUEST FAILED (${response.status}).`;
        throw new Error(payload?.error || fallback);
      }
      setPublicShare({ artworkUrl: downloadUrl, publicUrl: payload.url });
      setCopied(false);
      setConsentOpen(false);
      if (action === "x") {
        window.location.assign(xShareIntent(format, payload.url));
      } else {
        await copyPublicUrl(payload.url);
      }
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
      <button type="button" className="outline-button share-x" onClick={shareToX} disabled={!downloadUrl}>𝕏 SHARE LINK TO X</button>
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
          <p>NO ACCOUNT NEEDED. THIS UPLOADS ONLY YOUR FINAL PNG TO AN ANONYMOUS PUBLIC IMAGE HOST—NEVER THE ORIGINAL PHOTO. ANYONE WITH THE LINK CAN VIEW IT, AND ANONYMOUS UPLOADS CANNOT BE MANAGED OR DELETED LATER.{publicLinkAction === "x" ? " THE X COMPOSER WILL INCLUDE A SHORT PUBLIC LINK AND #FrameInGoa." : ""}</p>
          <div>
            <button type="button" className="mini-button" onClick={() => void uploadPublic()} disabled={uploading}>
              {uploading ? "CREATING PUBLIC LINK..." : publicLinkAction === "x" ? "I UNDERSTAND — OPEN X" : "I UNDERSTAND — CREATE LINK"}
            </button>
            <button type="button" className="text-button" onClick={() => setConsentOpen(false)} disabled={uploading}>CANCEL</button>
          </div>
        </div>
      ) : (
        <button type="button" className="text-button create-link" onClick={() => { setPublicLinkAction("copy"); setConsentOpen(true); }}>CREATE FREE PUBLIC LINK ↗</button>
      )}
      {error ? <p className="error-note" role="alert">{error}</p> : null}
    </div>
  );
}
