/**
 * Generates Sensora PWA PNGs from SVG (sharp).
 * Concept: Cosmic S — Sense + Aura, quiet futurism; silver S + orbital curves + soft nebula (no stars/neon).
 * npm run pwa-icons
 */
import sharp from "sharp";
import { join, dirname } from "path";
import { mkdir } from "fs/promises";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const iconsDir = join(__dirname, "..", "public", "icons");

/** Maskable padding uses this RGB (deep space, matches icon base). */
const BG = { r: 6, g: 9, b: 14 };

/**
 * 512×512 — content weighted ~middle 62% for legibility + maskable safe zone.
 * Unique geometry only; no third-party marks.
 */
const svgCosmic = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <defs>
    <radialGradient id="bg" cx="34%" cy="30%" r="85%">
      <stop offset="0%" stop-color="#141c30"/>
      <stop offset="42%" stop-color="#0c111c"/>
      <stop offset="100%" stop-color="#03050a"/>
    </radialGradient>
    <linearGradient id="rim" x1="18%" y1="12%" x2="88%" y2="92%">
      <stop offset="0%" stop-color="#1c2738"/>
      <stop offset="100%" stop-color="#0b0f18"/>
    </linearGradient>
    <linearGradient id="silver" x1="22%" y1="18%" x2="78%" y2="82%">
      <stop offset="0%" stop-color="#fefefe"/>
      <stop offset="35%" stop-color="#e9edf5"/>
      <stop offset="72%" stop-color="#c8d0e2"/>
      <stop offset="100%" stop-color="#9eabbf"/>
    </linearGradient>
    <linearGradient id="aura" x1="72%" y1="28%" x2="18%" y2="88%">
      <stop offset="0%" stop-color="#7d8dbf" stop-opacity="0.55"/>
      <stop offset="45%" stop-color="#6f6eae" stop-opacity="0.28"/>
      <stop offset="100%" stop-color="#4c5680" stop-opacity="0"/>
    </linearGradient>
  </defs>

  <!-- Base plate -->
  <rect width="512" height="512" rx="108" fill="#03050a"/>
  <rect width="512" height="512" rx="108" fill="url(#bg)"/>
  <rect width="512" height="512" rx="108" fill="none" stroke="url(#rim)" stroke-width="2" opacity="0.9"/>

  <!-- Soft aurora / nebula (ellipses only — no star shapes) -->
  <ellipse cx="348" cy="158" rx="228" ry="138" fill="#6f78ae" opacity="0.17" transform="rotate(-26 348 158)"/>
  <ellipse cx="142" cy="372" rx="236" ry="148" fill="#5c6ea0" opacity="0.14" transform="rotate(18 142 372)"/>
  <ellipse cx="256" cy="272" rx="200" ry="176" fill="url(#aura)" opacity="0.85"/>

  <!-- Orbit arcs (partial ellipses, very light) -->
  <g fill="none" stroke-linecap="round">
    <ellipse cx="258" cy="272" rx="196" ry="124" stroke="#b9c6dd" stroke-width="2.2" opacity="0.22" transform="rotate(-14 258 272)"/>
    <ellipse cx="252" cy="248" rx="168" ry="154" stroke="#a69fd0" stroke-width="1.8" opacity="0.18" transform="rotate(34 252 248)"/>
  </g>

  <!-- S: stacked strokes for depth + small-size legibility (absolute geometry) -->
  <path fill="none" stroke="#03060c" stroke-width="42" stroke-linecap="round" stroke-linejoin="round"
    d="M 292 170 C 198 170 158 218 158 274 C 158 330 222 360 278 370 C 334 380 374 416 374 466 C 374 522 312 542 244 532 C 206 526 182 488 182 448"/>
  <path fill="none" stroke="#8b9cc433" stroke-width="36" stroke-linecap="round" stroke-linejoin="round"
    d="M 292 170 C 198 170 158 218 158 274 C 158 330 222 360 278 370 C 334 380 374 416 374 466 C 374 522 312 542 244 532 C 206 526 182 488 182 448"/>
  <path fill="none" stroke="url(#silver)" stroke-width="30" stroke-linecap="round" stroke-linejoin="round"
    d="M 292 170 C 198 170 158 218 158 274 C 158 330 222 360 278 370 C 334 380 374 416 374 466 C 374 522 312 542 244 532 C 206 526 182 488 182 448"/>
</svg>`;

await mkdir(iconsDir, { recursive: true });

async function png(name, svgString, size) {
  await sharp(Buffer.from(svgString, "utf8")).resize(size, size).png({ compressionLevel: 9 }).toFile(join(iconsDir, name));
}

await png("icon-192.png", svgCosmic, 192);
await png("icon-512.png", svgCosmic, 512);
await png("apple-touch-icon.png", svgCosmic, 180);

const inner = Math.floor(512 * 0.72);
const pad = Math.floor((512 - inner) / 2);
await sharp(Buffer.from(svgCosmic, "utf8"))
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

console.log("Wrote PNGs to public/icons/ (Cosmic S concept)");
