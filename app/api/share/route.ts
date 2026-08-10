import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { writeShareRecord } from "@/lib/share-store";
import type { GeneratorFormat, ShareRecord } from "@/types/generator";

export const runtime = "nodejs";

const MAX_PNG_BYTES = 12 * 1024 * 1024;

function cleanText(value: unknown, max: number) {
  return typeof value === "string" ? value.replace(/[\u0000-\u001f]/g, "").trim().slice(0, max) : "";
}

export async function POST(request: Request) {
  try {
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
    const id = `hhg-26-${randomBytes(4).toString("hex")}`;
    const record: ShareRecord = {
      id,
      format,
      name: cleanText(source.name, 60) || "Goa Builder",
      builderClass: cleanText(source.builderClass, 60) || "Ship Machine",
      builderId: cleanText(source.builderId, 24) || "HHG-26-247",
      createdAt: new Date().toISOString(),
      imageUrl: `/api/share/${id}/image`,
    };

    const imageBytes = new Uint8Array(await image.arrayBuffer());
    const pngSignature = [137, 80, 78, 71, 13, 10, 26, 10];
    if (!pngSignature.every((byte, index) => imageBytes[index] === byte)) {
      return NextResponse.json({ error: "Final artwork is not a valid PNG." }, { status: 400 });
    }
    await writeShareRecord(record, imageBytes);
    return NextResponse.json({ id, url: new URL(`/b/${id}`, request.url).toString() });
  } catch {
    return NextResponse.json({ error: "Public artwork storage failed." }, { status: 500 });
  }
}
