/**
 * Builds Sensora PWA v3 PNGs from a single source raster (official logo).
 * Default source: public/brand/sensora-logo.png — replace this file then re-run:
 * npm run pwa-icons-v3
 *
 * Padding: safe area for launcher crops; maskable uses a tighter inner box (Android).
 */
import { existsSync } from "fs";
import { mkdir } from "fs/promises";
import { dirname, join } from "path";
import sharp from "sharp";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const defaultSource = join(root, "public", "brand", "sensora-logo.png");
const iconsDir = join(root, "public", "icons");

const BG = { r: 2, g: 4, b: 12, alpha: 1 }; // midnight #02040c

/** "any" icons — keep logo ~82% max side so OS masks don’t clip artwork */
const SCALE_ANY = 0.82;
/** maskable — ~76% inner safe zone */
const SCALE_MASKABLE = 0.76;
/** apple-touch */
const SCALE_APPLE = 0.82;

async function compositeOnSquare(sourcePath, canvasSize, contentScale) {
  const inner = Math.round(canvasSize * contentScale);
  const resized = await sharp(sourcePath)
    .resize(inner, inner, { fit: "inside", withoutEnlargement: true })
    .toBuffer({ resolveWithObject: false });
  const meta = await sharp(resized).metadata();
  const w = meta.width ?? inner;
  const h = meta.height ?? inner;
  const left = Math.floor((canvasSize - w) / 2);
  const top = Math.floor((canvasSize - h) / 2);

  return sharp({
    create: {
      width: canvasSize,
      height: canvasSize,
      channels: 4,
      background: BG,
    },
  })
    .composite([{ input: resized, left, top }])
    .png({ compressionLevel: 9 });
}

async function main() {
  const source =
    process.argv.find((a) => a.startsWith("--source="))?.slice("--source=".length) ?? defaultSource;

  if (!existsSync(source)) {
    console.error("Source image missing:", source);
    process.exit(1);
  }

  await mkdir(iconsDir, { recursive: true });

  const w192 = await compositeOnSquare(source, 192, SCALE_ANY);
  await w192.toFile(join(iconsDir, "icon-192-v3.png"));
  const w512 = await compositeOnSquare(source, 512, SCALE_ANY);
  await w512.toFile(join(iconsDir, "icon-512-v3.png"));
  const wMask = await compositeOnSquare(source, 512, SCALE_MASKABLE);
  await wMask.toFile(join(iconsDir, "icon-512-maskable-v3.png"));
  const wApple = await compositeOnSquare(source, 180, SCALE_APPLE);
  await wApple.toFile(join(iconsDir, "apple-touch-icon-v3.png"));

  console.log(
    `Wrote v3 PNGs → public/icons/ (from ${source.replace(/\\/g, "/")}, ${SCALE_ANY * 100}% any · ${SCALE_MASKABLE * 100}% maskable)`,
  );
}

await main();
