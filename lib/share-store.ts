import "server-only";

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type { ShareRecord } from "@/types/generator";

const ID_PATTERN = /^hhg-26-[a-f0-9]{8}$/;
const storageRoot = path.join(process.cwd(), "data", "results");

export function validShareId(id: string) {
  return ID_PATTERN.test(id);
}

export async function writeShareRecord(record: ShareRecord, image: Uint8Array) {
  await mkdir(storageRoot, { recursive: true });
  await Promise.all([
    writeFile(path.join(storageRoot, `${record.id}.json`), JSON.stringify(record, null, 2), "utf8"),
    writeFile(path.join(storageRoot, `${record.id}.png`), image),
  ]);
}

export async function readShareRecord(id: string): Promise<ShareRecord | null> {
  if (!validShareId(id)) return null;
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
