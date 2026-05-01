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

/** ~6.5% larger mark than prior 0.82 / 0.76 (readability; still inside safe padding) */
const SCALE_BOOST = 1.065;
/** "any" icons — was 0.82; cap so circle crops stay safe */
const SCALE_ANY = Math.min(0.876, 0.82 * SCALE_BOOST);
/** maskable — was 0.76; stay within typical ~80% safe band */
const SCALE_MASKABLE = Math.min(0.812, 0.76 * SCALE_BOOST);
/** apple-touch */
const SCALE_APPLE = SCALE_ANY;

/** Subtle home-screen polish: no source redraw; keep nebula mood. */
const TUNE = {
  /** Slightly brighter core / midtones */
  brightness: 1.028,
  /** Tiny saturation nudge for blue–violet read (not neon) */
  saturation: 1.012,
  /** Lift dark nebula veils a bit so lower S curve reads (gentle) */
  linearScale: 1.022,
  linearOffset: -3,
};

function rimSvgBuffer(canvasSize) {
  const rx = Math.round((canvasSize * 108) / 512);
  const inset = Math.max(0.35, canvasSize * 0.0035);
  const sw = Math.max(0.55, canvasSize / 480);
  const innerW = canvasSize - inset * 2;
  const opacity = canvasSize <= 180 ? 0.085 : canvasSize <= 192 ? 0.09 : 0.1;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${canvasSize}" height="${canvasSize}">
  <rect x="${inset}" y="${inset}" width="${innerW}" height="${innerW}" rx="${rx}" ry="${rx}" fill="none" stroke="rgba(208,216,248,${opacity})" stroke-width="${sw}" stroke-linejoin="round"/>
</svg>`;
  return Buffer.from(svg);
}

async function compositeOnSquare(sourcePath, canvasSize, contentScale) {
  const inner = Math.round(canvasSize * contentScale);
  const resized = await sharp(sourcePath)
    .resize(inner, inner, { fit: "inside", withoutEnlargement: true })
    .ensureAlpha()
    .modulate({ brightness: TUNE.brightness, saturation: TUNE.saturation })
    .linear(TUNE.linearScale, TUNE.linearOffset)
    .toBuffer();

  const meta = await sharp(resized).metadata();
  const w = meta.width ?? inner;
  const h = meta.height ?? inner;
  const left = Math.floor((canvasSize - w) / 2);
  const top = Math.floor((canvasSize - h) / 2);

  const rim = await sharp(rimSvgBuffer(canvasSize)).png().toBuffer();

  return sharp({
    create: {
      width: canvasSize,
      height: canvasSize,
      channels: 4,
      background: BG,
    },
  })
    .composite([
      { input: resized, left, top },
      { input: rim, blend: "over" },
    ])
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
    `Wrote v3 PNGs → public/icons/ (from ${source.replace(/\\/g, "/")}, ${(SCALE_ANY * 100).toFixed(1)}% any · ${(SCALE_MASKABLE * 100).toFixed(1)}% maskable · mild tone + rim)`,
  );
}

await main();
