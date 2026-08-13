# Frame In Goa

HH Goa 2026 PFP Frame + Builder ID generator. The complete artwork pipeline runs in the browser: photo decode, HEIC/HEIF conversion, crop controls, contextual builder-class generation, live Canvas preview, and high-resolution PNG export.

## Run

```bash
npm install
npm run dev
```

Production check:

```bash
npm run lint
npm run build
npm start
```

Set `NEXT_PUBLIC_SITE_URL` to the public origin in production so canonical links are stable. Without it, public result metadata derives the origin from the incoming request.

## Public result storage

Public links are opt-in and need no visitor account. The server uploads only the final generated PNG—never the original photo—to Catbox's anonymous public upload API. New branded links use a compact `/b/[format]-[image-id]` route derived from Catbox's opaque file ID, so they stay short and work on free/serverless deployments without a database or persistent disk. Personal display details remain in the rendered artwork rather than the URL.

Legacy filesystem-backed IDs and earlier stateless-token links remain readable. Anonymous third-party uploads are public, cannot be managed or deleted through this app, and remain subject to the storage provider's availability and acceptable-use rules.

## Output sizes

- Builder ID: 1200 × 1500 PNG
- PFP frame: 1080 × 1080 PNG

The preview and export use the same Canvas renderer in `lib/render-artwork.ts`.
