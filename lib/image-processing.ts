import type { CropState, PhotoAsset } from "@/types/generator";

const MAX_INPUT_BYTES = 40 * 1024 * 1024;
const MAX_EDGE = 4096;
const SUPPORTED_EXTENSIONS = /\.(jpe?g|png|webp|heic|heif)$/i;

type FaceDetectorConstructor = new (options?: { fastMode?: boolean; maxDetectedFaces?: number }) => {
  detect(source: ImageBitmapSource): Promise<Array<{ boundingBox: DOMRectReadOnly }>>;
};

function isHeicFile(file: File) {
  return /heic|heif/i.test(file.type) || /\.(heic|heif)$/i.test(file.name);
}

async function convertIfNeeded(file: File): Promise<Blob> {
  if (!isHeicFile(file)) return file;
  try {
    const { heicTo } = await import("heic-to");
    return await heicTo({ blob: file, type: "image/jpeg", quality: 0.92 });
  } catch {
    throw new Error("IPHONE PHOTO DIDN’T CONVERT. TRY EXPORTING IT AS JPG, THEN DROP IT AGAIN.");
  }
}

async function findFocalPoint(bitmap: ImageBitmap) {
  const Detector = (window as typeof window & { FaceDetector?: FaceDetectorConstructor }).FaceDetector;
  if (!Detector) return { focalX: 0.5, focalY: 0.42 };
  try {
    const faces = await new Detector({ fastMode: true, maxDetectedFaces: 1 }).detect(bitmap);
    const face = faces[0]?.boundingBox;
    if (!face) return { focalX: 0.5, focalY: 0.42 };
    return {
      focalX: (face.x + face.width / 2) / bitmap.width,
      focalY: (face.y + face.height / 2) / bitmap.height,
    };
  } catch {
    return { focalX: 0.5, focalY: 0.42 };
  }
}

export async function decodePhoto(file: File): Promise<PhotoAsset> {
  if (file.size > MAX_INPUT_BYTES) throw new Error("THAT FILE IS HUGE. KEEP IT UNDER 40MB.");
  if (!file.type.startsWith("image/") && !SUPPORTED_EXTENSIONS.test(file.name)) {
    throw new Error("WRONG SIGNAL. DROP A JPG, PNG, WEBP, HEIC OR HEIF.");
  }

  const converted = await convertIfNeeded(file);
  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(converted, { imageOrientation: "from-image" });
  } catch {
    throw new Error("WE COULDN’T READ THAT PHOTO. IT MAY BE CORRUPT.");
  }

  const focal = await findFocalPoint(bitmap);
  const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d", { alpha: true });
  if (!context) throw new Error("CANVAS SIGNAL LOST. REFRESH AND TRY AGAIN.");
  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = "high";
  context.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const preserveAlpha = /png/i.test(converted.type);
  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, preserveAlpha ? "image/png" : "image/jpeg", preserveAlpha ? undefined : 0.92),
  );
  if (!blob) throw new Error("PHOTO PROCESSING FAILED. GIVE IT ONE MORE GO.");

  return {
    src: URL.createObjectURL(blob),
    width,
    height,
    fileName: file.name,
    ...focal,
  };
}

export function initialCrop(photo: PhotoAsset): CropState {
  return {
    zoom: 1,
    x: Math.max(-0.85, Math.min(0.85, (0.5 - photo.focalX) * 2)),
    y: Math.max(-0.85, Math.min(0.85, (0.46 - photo.focalY) * 2)),
  };
}
