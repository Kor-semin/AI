/**
 * Generates Sensora PWA PNGs from SVG (sharp).
 * Nebula ribbon traces one smooth S — quiet futurism, premium, not a typographic S.
 * npm run pwa-icons
 */
import sharp from "sharp";
import { join, dirname } from "path";
import { mkdir } from "fs/promises";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const iconsDir = join(__dirname, "..", "public", "icons");

/** Maskable pad color — corner of base plate. */
const BG = { r: 2, g: 5, b: 12 };

/**
 * Single S spine: open curves, centered in 512 canvas for maskable safe zone.
 * Fewer control swings than a full “script” S — reads at 192px.
 */
const NEBULA_PATH =
  "M 306 162 C 184 162 126 230 126 292 C 126 348 204 380 268 390 C 328 400 386 438 386 492 C 386 536 328 554 242 542 C 192 532 162 484 162 434";

const svgNebulaS = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <defs>
    <radialGradient id="bg" cx="36%" cy="30%" r="90%">
      <stop offset="0%" stop-color="#101a2e"/>
      <stop offset="50%" stop-color="#0a101c"/>
      <stop offset="100%" stop-color="#02050e"/>
    </radialGradient>
    <linearGradient id="rim" x1="10%" y1="6%" x2="94%" y2="96%">
      <stop offset="0%" stop-color="#162033"/>
      <stop offset="100%" stop-color="#050812"/>
    </linearGradient>
  </defs>

  <rect width="512" height="512" rx="108" fill="#02050e"/>
  <rect width="512" height="512" rx="108" fill="url(#bg)"/>
  <rect width="512" height="512" rx="108" fill="none" stroke="url(#rim)" stroke-width="1.25" opacity="0.75"/>

  <!-- Single faint depth field (not photo-nebula) -->
  <ellipse cx="256" cy="288" rx="210" ry="160" fill="#3d4a78" opacity="0.06"/>

  <!-- S ribbon: outside (muted violet) → in (blue-lavender) → soft silver core; 6 layers for clean downscale -->
  <g fill="none" stroke-linecap="round" stroke-linejoin="round">
    <path d="${NEBULA_PATH}" stroke="#2a2644" stroke-width="56" opacity="0.4"/>
    <path d="${NEBULA_PATH}" stroke="#3d3d6e" stroke-width="42" opacity="0.48"/>
    <path d="${NEBULA_PATH}" stroke="#4f5c94" stroke-width="30" opacity="0.52"/>
    <path d="${NEBULA_PATH}" stroke="#6c7eb8" stroke-width="20" opacity="0.58"/>
    <path d="${NEBULA_PATH}" stroke="#a6b4dc" stroke-width="12" opacity="0.62"/>
    <path d="${NEBULA_PATH}" stroke="#d8deef" stroke-width="5" opacity="0.38"/>
  </g>

  <!-- Almost no stars: three pinpricks only -->
  <g fill="#c5cee8">
    <circle cx="118" cy="142" r="1" opacity="0.11"/>
    <circle cx="398" cy="124" r="0.9" opacity="0.1"/>
    <circle cx="94" cy="324" r="0.85" opacity="0.09"/>
  </g>
</svg>`;

await mkdir(iconsDir, { recursive: true });

async function png(name, svgString, size) {
  await sharp(Buffer.from(svgString, "utf8")).resize(size, size).png({ compressionLevel: 9 }).toFile(join(iconsDir, name));
}

await png("icon-192.png", svgNebulaS, 192);
await png("icon-512.png", svgNebulaS, 512);
await png("apple-touch-icon.png", svgNebulaS, 180);

const inner = Math.floor(512 * 0.72);
const pad = Math.floor((512 - inner) / 2);
await sharp(Buffer.from(svgNebulaS, "utf8"))
  .resize(inner, inner)
  .extend({
    top: pad,
    bottom: pad,
    left: pad,
    right: pad,
    background: BG,
  })
  .png({ compressionLevel: 9 })
  .toFile(join(iconsDir, "icon-512-maskable.png"));

console.log("Wrote PNGs to public/icons/ (quiet nebula S ribbon)");
