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

Public links are opt-in and upload only the final generated PNG—never the original photo. The Node runtime stores records and images under `data/results/`; `/b/[id]` and its Open Graph/Twitter metadata reference that exact uploaded artwork through `/api/share/[id]/image`.

For self-hosting, mount `data/results/` on persistent storage. The route contract is intentionally isolated in `lib/share-store.ts`, so the storage adapter can be replaced without changing the generator or public-page API.

## Output sizes

- Builder ID: 1200 × 1500 PNG
- PFP frame: 1080 × 1080 PNG

The preview and export use the same Canvas renderer in `lib/render-artwork.ts`.
