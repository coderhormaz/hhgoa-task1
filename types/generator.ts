export type GeneratorFormat = "pfp" | "builder";
export type CardVariant = "classic" | "after-dark" | "loud";
export type AppStage = "landing" | "format" | "photo" | "personalize" | "reveal" | "result";

export interface CropState {
  zoom: number;
  x: number;
  y: number;
}

export interface PhotoAsset {
  src: string;
  width: number;
  height: number;
  fileName: string;
  focalX: number;
  focalY: number;
}

export interface BuilderData {
  name: string;
  stack: string;
  handle: string;
  builderClass: string;
  builderId: string;
}

export interface ShareRecord {
  id: string;
  format: GeneratorFormat;
  name: string;
  builderClass: string;
  builderId: string;
  createdAt: string;
  imageUrl: string;
}
