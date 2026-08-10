import { readShareImage } from "@/lib/share-store";

export const runtime = "nodejs";

export async function GET(_: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const image = await readShareImage(id);
  if (!image) return new Response("Artwork not found", { status: 404 });
  return new Response(new Uint8Array(image), {
    headers: {
      "Content-Type": "image/png",
      "Content-Length": String(image.byteLength),
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
