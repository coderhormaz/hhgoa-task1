import { NextResponse } from "next/server";
import { createShareRecord } from "@/lib/share-store";
import type { GeneratorFormat } from "@/types/generator";

export const runtime = "nodejs";

const MAX_PNG_BYTES = 4 * 1024 * 1024;
const CATBOX_UPLOAD_URL = "https://catbox.moe/user/api.php";

const VALID_PNG_DIMENSIONS: Record<GeneratorFormat, ReadonlyArray<readonly [number, number]>> = {
  builder: [[720, 900], [1200, 1500]],
  pfp: [[720, 720], [1080, 1080]],
};

function pngDimensions(bytes: Uint8Array) {
  if (bytes.byteLength < 24) return null;
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  return { width: view.getUint32(16), height: view.getUint32(20) };
}

function expectedDimensions(format: GeneratorFormat, bytes: Uint8Array) {
  const dimensions = pngDimensions(bytes);
  if (!dimensions) return false;
  return VALID_PNG_DIMENSIONS[format].some(
    ([width, height]) => dimensions.width === width && dimensions.height === height,
  );
}

async function uploadAnonymousPng(file: File) {
  const upstream = new FormData();
  upstream.append("reqtype", "fileupload");
  upstream.append("fileToUpload", file, file.name);
  const response = await fetch(CATBOX_UPLOAD_URL, {
    method: "POST",
    body: upstream,
    cache: "no-store",
    signal: AbortSignal.timeout(30_000),
    headers: { "User-Agent": "FrameInGoa/1.0 (anonymous artwork sharing)" },
  });
  const imageUrl = (await response.text()).trim();
  if (!response.ok || !/^https:\/\/files\.catbox\.moe\/[a-z0-9]+\.png$/i.test(imageUrl)) {
    throw new Error("Anonymous image host rejected the upload.");
  }
  return imageUrl;
}

export async function POST(request: Request) {
  try {
    const requestOrigin = new URL(request.url).origin;
    const browserOrigin = request.headers.get("origin");
    if (browserOrigin && browserOrigin !== requestOrigin) {
      return NextResponse.json({ error: "Cross-site uploads are not allowed." }, { status: 403 });
    }

    const formData = await request.formData();
    const image = formData.get("image");
    const metadataRaw = formData.get("metadata");
    if (!(image instanceof File) || image.type !== "image/png") {
      return NextResponse.json({ error: "Final artwork must be a PNG." }, { status: 400 });
    }
    if (image.size === 0 || image.size > MAX_PNG_BYTES) {
      return NextResponse.json({ error: "Final artwork is empty or too large." }, { status: 400 });
    }
    if (typeof metadataRaw !== "string") {
      return NextResponse.json({ error: "Missing artwork metadata." }, { status: 400 });
    }
    if (metadataRaw.length > 2048) {
      return NextResponse.json({ error: "Artwork metadata is too large." }, { status: 400 });
    }

    const source = JSON.parse(metadataRaw) as Record<string, unknown>;
    const format: GeneratorFormat = source.format === "pfp" ? "pfp" : "builder";
    const imageBytes = new Uint8Array(await image.arrayBuffer());
    const pngSignature = [137, 80, 78, 71, 13, 10, 26, 10];
    if (!pngSignature.every((byte, index) => imageBytes[index] === byte) || !expectedDimensions(format, imageBytes)) {
      return NextResponse.json({ error: "Final artwork has invalid PNG dimensions." }, { status: 400 });
    }

    const imageUrl = await uploadAnonymousPng(new File([imageBytes], image.name, { type: "image/png" }));
    const record = createShareRecord({
      format,
      imageUrl,
    });
    return NextResponse.json({ id: record.id, url: new URL(`/b/${record.id}`, request.url).toString(), imageUrl });
  } catch (reason) {
    console.error("[public-share] Anonymous upload failed", reason);
    const timedOut = reason instanceof DOMException && reason.name === "TimeoutError";
    return NextResponse.json(
      { error: timedOut ? "The public image host timed out. Please try again." : "Public artwork storage failed. Please try again." },
      { status: 502 },
    );
  }
}
