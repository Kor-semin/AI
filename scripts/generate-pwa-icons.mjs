/**
 * Generates Sensora PWA PNGs from SVG (sharp).
 * npm run pwa-icons
 */
import sharp from "sharp";
import { join, dirname } from "path";
import { mkdir } from "fs/promises";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const iconsDir = join(__dirname, "..", "public", "icons");

/** Sensora mono "S" + accent dot — no external brand marks. */
const svgAny = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="96" fill="#111827"/>
  <path fill="#F4F6F8" d="M168 356c56 40 146 42 206 2 18-11 34-31 43-53l48 22c-12 28-35 54-61 71-82 53-207 53-294-6v-106c86-62 218-61 297-4l34 27-54 54-28-21c-40-31-141-39-217 8v94z"/>
  <circle cx="352" cy="158" r="36" fill="#C9A962"/>
</svg>`;

await mkdir(iconsDir, { recursive: true });

async function png(name, svgString, size) {
  await sharp(Buffer.from(svgString, "utf8")).resize(size, size).png().toFile(join(iconsDir, name));
}

await png("icon-192.png", svgAny, 192);
await png("icon-512.png", svgAny, 512);
await png("apple-touch-icon.png", svgAny, 180);

const inner = Math.floor(512 * 0.72); // ~ adaptive-icon safe inset
const pad = Math.floor((512 - inner) / 2);
await sharp(Buffer.from(svgAny, "utf8"))
  .resize(inner, inner)
  .extend({
    top: pad,
    bottom: pad,
    left: pad,
    right: pad,
    background: { r: 17, g: 24, b: 39 },
  })
  .png()
  .toFile(join(iconsDir, "icon-512-maskable.png"));

console.log("Wrote PNGs to public/icons/");
