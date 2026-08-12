import "server-only";

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type { GeneratorFormat } from "@/types/generator";
import type { ShareRecord } from "@/types/generator";

const LEGACY_ID_PATTERN = /^hhg-26-[a-f0-9]{8}$/;
const CATBOX_IMAGE_PATTERN = /^https:\/\/files\.catbox\.moe\/[a-z0-9]+\.png$/i;
const TOKEN_PATTERN = /^[A-Za-z0-9_-]{20,700}$/;
const storageRoot = path.join(process.cwd(), "data", "results");

export function validShareId(id: string) {
  return LEGACY_ID_PATTERN.test(id) || TOKEN_PATTERN.test(id);
}

function cleanText(value: unknown, max: number) {
  return typeof value === "string" ? value.replace(/[\u0000-\u001f]/g, "").trim().slice(0, max) : "";
}

interface ShareTokenPayload {
  v: 1;
  f: "b" | "p";
  n: string;
  c: string;
  b: string;
  u: string;
  t: string;
}

export function createShareRecord(input: {
  format: GeneratorFormat;
  name: string;
  builderClass: string;
  builderId: string;
  imageUrl: string;
}) {
  if (!CATBOX_IMAGE_PATTERN.test(input.imageUrl)) throw new Error("Unsupported public image URL.");
  const payload: ShareTokenPayload = {
    v: 1,
    f: input.format === "pfp" ? "p" : "b",
    n: cleanText(input.name, 60) || "Goa Builder",
    c: cleanText(input.builderClass, 60) || "Ship Machine",
    b: cleanText(input.builderId, 24) || "HHG-26-247",
    u: input.imageUrl,
    t: new Date().toISOString(),
  };
  const id = Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
  return tokenToRecord(id, payload);
}

function tokenToRecord(id: string, payload: ShareTokenPayload): ShareRecord {
  return {
    id,
    format: payload.f === "p" ? "pfp" : "builder",
    name: payload.n,
    builderClass: payload.c,
    builderId: payload.b,
    createdAt: payload.t,
    imageUrl: payload.u,
  };
}

function readShareToken(id: string) {
  if (!TOKEN_PATTERN.test(id)) return null;
  try {
    const source = JSON.parse(Buffer.from(id, "base64url").toString("utf8")) as Partial<ShareTokenPayload>;
    if (source.v !== 1 || (source.f !== "b" && source.f !== "p") || !CATBOX_IMAGE_PATTERN.test(source.u ?? "")) return null;
    const payload: ShareTokenPayload = {
      v: 1,
      f: source.f,
      n: cleanText(source.n, 60) || "Goa Builder",
      c: cleanText(source.c, 60) || "Ship Machine",
      b: cleanText(source.b, 24) || "HHG-26-247",
      u: source.u!,
      t: typeof source.t === "string" && !Number.isNaN(Date.parse(source.t)) ? source.t : new Date(0).toISOString(),
    };
    return tokenToRecord(id, payload);
  } catch {
    return null;
  }
}

export async function writeShareRecord(record: ShareRecord, image: Uint8Array) {
  await mkdir(storageRoot, { recursive: true });
  await Promise.all([
    writeFile(path.join(storageRoot, `${record.id}.json`), JSON.stringify(record, null, 2), "utf8"),
    writeFile(path.join(storageRoot, `${record.id}.png`), image),
  ]);
}

export async function readShareRecord(id: string): Promise<ShareRecord | null> {
  const tokenRecord = readShareToken(id);
  if (tokenRecord) return tokenRecord;
  if (!LEGACY_ID_PATTERN.test(id)) return null;
  try {
    return JSON.parse(await readFile(path.join(storageRoot, `${id}.json`), "utf8")) as ShareRecord;
  } catch {
    return null;
  }
}

export async function readShareImage(id: string) {
  if (!validShareId(id)) return null;
  try {
    return await readFile(path.join(storageRoot, `${id}.png`));
  } catch {
    return null;
  }
}
