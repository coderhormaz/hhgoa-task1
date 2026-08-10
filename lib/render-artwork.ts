import type { BuilderData, CardVariant, CropState, GeneratorFormat } from "@/types/generator";

export const BUILDER_SIZE = { width: 1200, height: 1500 };
export const PFP_SIZE = { width: 1080, height: 1080 };

const GREEN = "#0b6839";
const DARK_GREEN = "#064628";
const YELLOW = "#fee101";
const PINK = "#ff0080";
const PAPER = "#fffbe8";
const WHITE = "#ffffff";

export interface ArtworkInput {
  format: GeneratorFormat;
  image: HTMLImageElement;
  crop: CropState;
  builder: BuilderData;
  variant: CardVariant;
}

function fonts() {
  if (typeof document === "undefined") return { display: "serif", mono: "monospace" };
  const style = getComputedStyle(document.documentElement);
  return {
    display: style.getPropertyValue("--font-imbue").trim() || "serif",
    mono: style.getPropertyValue("--font-victor").trim() || "monospace",
  };
}

function line(ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number, color: string, width = 2) {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.stroke();
}

function star(ctx: CanvasRenderingContext2D, x: number, y: number, radius: number, color: string, points = 8) {
  ctx.save();
  ctx.translate(x, y);
  ctx.beginPath();
  for (let index = 0; index < points * 2; index += 1) {
    const angle = (Math.PI * index) / points - Math.PI / 2;
    const r = index % 2 === 0 ? radius : radius * 0.35;
    const px = Math.cos(angle) * r;
    const py = Math.sin(angle) * r;
    if (index === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
  ctx.restore();
}

function drawWave(ctx: CanvasRenderingContext2D, startX: number, y: number, width: number, color: string, amplitude = 7) {
  ctx.beginPath();
  ctx.moveTo(startX, y);
  const count = Math.max(1, Math.floor(width / 36));
  for (let index = 0; index < count; index += 1) {
    const x = startX + (index * width) / count;
    const next = startX + ((index + 1) * width) / count;
    ctx.quadraticCurveTo((x + next) / 2, y + (index % 2 === 0 ? amplitude : -amplitude), next, y);
  }
  ctx.strokeStyle = color;
  ctx.lineWidth = 3;
  ctx.stroke();
}

function drawSun(ctx: CanvasRenderingContext2D, x: number, y: number, radius: number, color = YELLOW) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 3;
  for (let index = 0; index < 12; index += 1) {
    const angle = (Math.PI * 2 * index) / 12;
    line(
      ctx,
      x + Math.cos(angle) * (radius + 15),
      y + Math.sin(angle) * (radius + 15),
      x + Math.cos(angle) * (radius + 42),
      y + Math.sin(angle) * (radius + 42),
      color,
      3,
    );
  }
  ctx.beginPath();
  ctx.arc(x, y, radius, Math.PI, 0);
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
  ctx.restore();
}

function drawPalm(ctx: CanvasRenderingContext2D, x: number, y: number, scale: number, color: string) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = 4 * scale;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.quadraticCurveTo(x + 8 * scale, y - 42 * scale, x - 2 * scale, y - 88 * scale);
  ctx.stroke();
  const crownY = y - 88 * scale;
  for (let index = 0; index < 7; index += 1) {
    const angle = -Math.PI + (Math.PI * index) / 6;
    ctx.beginPath();
    ctx.moveTo(x - 2 * scale, crownY);
    ctx.quadraticCurveTo(
      x + Math.cos(angle) * 28 * scale,
      crownY + Math.sin(angle) * 14 * scale,
      x + Math.cos(angle) * 52 * scale,
      crownY + Math.sin(angle) * 34 * scale,
    );
    ctx.lineWidth = 7 * scale;
    ctx.stroke();
  }
  ctx.restore();
}

function coverGeometry(
  image: HTMLImageElement,
  box: { x: number; y: number; width: number; height: number },
  crop: CropState,
) {
  const baseScale = Math.max(box.width / image.naturalWidth, box.height / image.naturalHeight);
  const scale = baseScale * crop.zoom;
  const width = image.naturalWidth * scale;
  const height = image.naturalHeight * scale;
  const extraX = Math.max(0, width - box.width);
  const extraY = Math.max(0, height - box.height);
  const x = box.x - extraX / 2 + (crop.x * extraX) / 2;
  const y = box.y - extraY / 2 + (crop.y * extraY) / 2;
  return { x, y, width, height };
}

export function drawPhotoCover(
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement,
  box: { x: number; y: number; width: number; height: number },
  crop: CropState,
  radius = 0,
) {
  const geometry = coverGeometry(image, box, crop);
  ctx.save();
  ctx.beginPath();
  if (radius > 0) ctx.roundRect(box.x, box.y, box.width, box.height, radius);
  else ctx.rect(box.x, box.y, box.width, box.height);
  ctx.clip();
  ctx.drawImage(image, geometry.x, geometry.y, geometry.width, geometry.height);
  ctx.restore();
}

function fitText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  startSize: number,
  minSize: number,
  family: string,
  weight = 700,
) {
  let size = startSize;
  do {
    ctx.font = `${weight} ${size}px ${family}`;
    if (ctx.measureText(text).width <= maxWidth) break;
    size -= 2;
  } while (size > minSize);
  return size;
}

function drawTextFit(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  startSize: number,
  minSize: number,
  family: string,
  color: string,
  weight = 700,
) {
  const size = fitText(ctx, text, maxWidth, startSize, minSize, family, weight);
  ctx.font = `${weight} ${size}px ${family}`;
  ctx.fillStyle = color;
  ctx.fillText(text, x, y);
  return size;
}

function metadata(ctx: CanvasRenderingContext2D, label: string, value: string, x: number, y: number, color: string, mono: string) {
  ctx.fillStyle = PINK;
  ctx.font = `700 20px ${mono}`;
  ctx.fillText(label, x, y);
  ctx.fillStyle = color;
  ctx.font = `700 27px ${mono}`;
  ctx.fillText(value, x, y + 36);
}

function drawOrnamentalBorder(ctx: CanvasRenderingContext2D, width: number, height: number, base: string) {
  ctx.strokeStyle = YELLOW;
  ctx.lineWidth = 18;
  ctx.strokeRect(20, 20, width - 40, height - 40);
  ctx.strokeStyle = base;
  ctx.lineWidth = 5;
  ctx.strokeRect(31, 31, width - 62, height - 62);
  ctx.save();
  ctx.setLineDash([4, 9]);
  ctx.strokeStyle = PINK;
  ctx.lineWidth = 4;
  ctx.strokeRect(41, 41, width - 82, height - 82);
  ctx.restore();
  star(ctx, 56, 56, 18, PINK);
  star(ctx, width - 56, 56, 18, PINK);
  star(ctx, 56, height - 56, 18, PINK);
  star(ctx, width - 56, height - 56, 18, PINK);
}

function drawBuilder(ctx: CanvasRenderingContext2D, input: ArtworkInput) {
  const { display, mono } = fonts();
  const { builder, image, crop, variant } = input;
  const loud = variant === "loud";
  const night = variant === "after-dark";
  const field = night ? "#041f16" : loud ? YELLOW : GREEN;
  const ink = loud ? GREEN : GREEN;
  const stock = night ? "#dfe8d8" : PAPER;

  ctx.fillStyle = field;
  ctx.fillRect(0, 0, BUILDER_SIZE.width, BUILDER_SIZE.height);
  drawOrnamentalBorder(ctx, BUILDER_SIZE.width, BUILDER_SIZE.height, field);

  ctx.fillStyle = stock;
  ctx.fillRect(58, 58, 1084, 1384);

  ctx.fillStyle = ink;
  ctx.font = `700 21px ${mono}`;
  ctx.fillText("GOA, INDIA", 84, 102);
  ctx.fillStyle = PINK;
  ctx.fillText("HEADS DOWN", 494, 102);
  ctx.fillText("BUILD STATION  /  247", 858, 102);
  line(ctx, 84, 122, 1118, 122, PINK, 2);

  drawTextFit(ctx, "HACKER HOUSE", 80, 260, 1040, 160, 104, display, ink, 600);
  ctx.fillStyle = PINK;
  ctx.font = `800 32px ${mono}`;
  ctx.fillText("गोवा", 565, 230);
  ctx.fillStyle = ink;
  ctx.font = `700 28px ${mono}`;
  ctx.fillText("28—31 OCT 2026", 85, 305);
  ctx.fillText("2:47 PM STUDIO", 830, 305);

  const photoBox = { x: 84, y: 340, width: 660, height: 570 };
  ctx.fillStyle = GREEN;
  ctx.fillRect(64, 320, 1090, 610);
  ctx.fillStyle = night ? DARK_GREEN : "#2b9b5d";
  ctx.fillRect(744, 340, 390, 570);
  drawSun(ctx, 945, 510, 92, YELLOW);
  for (let index = 0; index < 4; index += 1) drawWave(ctx, 772, 620 + index * 34, 332, WHITE, 6);
  drawPalm(ctx, 812, 885, 1.25, night ? YELLOW : DARK_GREEN);
  drawPalm(ctx, 1084, 890, 1.5, night ? YELLOW : DARK_GREEN);
  ctx.fillStyle = WHITE;
  ctx.fillRect(780, 730, 290, 120);
  ctx.strokeStyle = GREEN;
  ctx.lineWidth = 9;
  ctx.strokeRect(780, 730, 290, 120);
  ctx.fillStyle = PINK;
  ctx.fillRect(822, 706, 208, 40);
  ctx.fillStyle = WHITE;
  ctx.font = `700 17px ${mono}`;
  ctx.fillText("SHIP OR SHIP", 850, 733);
  drawPhotoCover(ctx, image, photoBox, crop);
  ctx.strokeStyle = YELLOW;
  ctx.lineWidth = 8;
  ctx.strokeRect(photoBox.x, photoBox.y, photoBox.width, photoBox.height);
  ctx.save();
  ctx.setLineDash([4, 7]);
  ctx.strokeStyle = PINK;
  ctx.lineWidth = 3;
  ctx.strokeRect(photoBox.x + 11, photoBox.y + 11, photoBox.width - 22, photoBox.height - 22);
  ctx.restore();

  ctx.fillStyle = GREEN;
  ctx.fillRect(64, 910, 1090, 92);
  ctx.fillStyle = PINK;
  ctx.fillRect(330, 924, 540, 64);
  ctx.strokeStyle = YELLOW;
  ctx.lineWidth = 5;
  ctx.strokeRect(330, 924, 540, 64);
  star(ctx, 285, 956, 22, PINK);
  star(ctx, 915, 956, 22, PINK);
  ctx.fillStyle = WHITE;
  ctx.font = `700 35px ${mono}`;
  ctx.textAlign = "center";
  ctx.fillText("BUILDER / 2026", 600, 968);
  ctx.textAlign = "left";

  const safeName = builder.name.trim().toUpperCase() || "GOA BUILDER";
  drawTextFit(ctx, safeName, 86, 1096, 1026, 85, 48, display, ink, 700);
  line(ctx, 84, 1122, 1116, 1122, ink, 2);

  metadata(ctx, "BUILDING WITH", builder.stack.toUpperCase().replace(/\s*\+\s*/g, " × ") || "MAKING THINGS", 86, 1167, ink, mono);
  metadata(ctx, "BUILDER CLASS", builder.builderClass.toUpperCase(), 637, 1167, ink, mono);
  line(ctx, 600, 1140, 600, 1286, ink, 2);
  line(ctx, 84, 1248, 1116, 1248, ink, 2);
  ctx.fillStyle = ink;
  ctx.font = `700 25px ${mono}`;
  ctx.fillText(builder.handle ? `𝕏 ${builder.handle.startsWith("@") ? builder.handle : `@${builder.handle}`}` : "𝕏 SIGNAL PRIVATE", 86, 1282);
  ctx.fillStyle = PINK;
  ctx.fillText(builder.builderId, 638, 1282);

  line(ctx, 84, 1315, 1116, 1315, ink, 2);
  ctx.font = `700 20px ${mono}`;
  ctx.fillStyle = ink;
  ctx.fillText("ACCESS: SHIP", 86, 1352);
  ctx.fillText("STATUS: LOCKED IN", 325, 1352);
  ctx.fillText("SIGNAL: HIGH", 685, 1352);
  ctx.fillText("NOISE: LOW", 925, 1352);
  drawWave(ctx, 86, 1383, 270, ink, 5);
  drawWave(ctx, 844, 1383, 270, ink, 5);
  ctx.fillStyle = PINK;
  ctx.font = `700 23px ${mono}`;
  ctx.textAlign = "center";
  ctx.fillText("#FrameInGoa", 600, 1393);
  ctx.textAlign = "left";
}

function drawPfp(ctx: CanvasRenderingContext2D, input: ArtworkInput) {
  const { display, mono } = fonts();
  const { image, crop, variant } = input;
  const field = variant === "after-dark" ? "#041f16" : variant === "loud" ? YELLOW : GREEN;

  ctx.fillStyle = field;
  ctx.fillRect(0, 0, PFP_SIZE.width, PFP_SIZE.height);
  drawPhotoCover(ctx, image, { x: 54, y: 54, width: 972, height: 972 }, crop);
  ctx.fillStyle = "rgba(11,104,57,0.84)";
  ctx.fillRect(54, 54, 972, 176);
  ctx.fillRect(54, 790, 972, 236);
  drawOrnamentalBorder(ctx, PFP_SIZE.width, PFP_SIZE.height, field);
  drawSun(ctx, 540, 180, 74, YELLOW);
  drawPalm(ctx, 154, 930, 1.3, YELLOW);
  drawPalm(ctx, 930, 930, 1.3, YELLOW);

  ctx.fillStyle = YELLOW;
  ctx.font = `700 54px ${mono}`;
  ctx.fillText("HH", 92, 145);
  ctx.textAlign = "right";
  ctx.fillText("2026", 986, 145);
  ctx.textAlign = "center";
  ctx.font = `600 205px ${display}`;
  ctx.fillText("GOA", 540, 953);
  ctx.fillStyle = PINK;
  ctx.font = `700 28px ${mono}`;
  ctx.fillText("#FrameInGoa", 540, 1002);
  ctx.fillStyle = WHITE;
  ctx.font = `700 18px ${mono}`;
  ctx.fillText("LESS NOISE / MORE SIGNAL", 540, 214);
  ctx.textAlign = "left";
}

export function renderArtwork(canvas: HTMLCanvasElement, input: ArtworkInput) {
  const size = input.format === "builder" ? BUILDER_SIZE : PFP_SIZE;
  if (canvas.width !== size.width) canvas.width = size.width;
  if (canvas.height !== size.height) canvas.height = size.height;
  const ctx = canvas.getContext("2d", { alpha: false });
  if (!ctx) throw new Error("Canvas unavailable");
  ctx.clearRect(0, 0, size.width, size.height);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  if (input.format === "builder") drawBuilder(ctx, input);
  else drawPfp(ctx, input);
}

export function canvasToBlob(canvas: HTMLCanvasElement) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("PNG export failed"))), "image/png");
  });
}
