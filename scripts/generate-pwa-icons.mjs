/**
 * Generates Sensora PWA PNGs from SVG (sharp).
 * Wide soft nebula ribbon forms S — cloud-like mass, not an LED stroke.
 * npm run pwa-icons
 */
import sharp from "sharp";
import { join, dirname } from "path";
import { mkdir } from "fs/promises";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const iconsDir = join(__dirname, "..", "public", "icons");

const BG = { r: 2, g: 5, b: 12 };

const NEBULA_PATH =
  "M 306 162 C 184 162 126 230 126 292 C 126 348 204 380 268 390 C 328 400 386 438 386 492 C 386 536 328 554 242 542 C 192 532 162 484 162 434";

const svgNebulaS = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <defs>
    <radialGradient id="bg" cx="42%" cy="34%" r="92%">
      <stop offset="0%" stop-color="#152542"/>
      <stop offset="38%" stop-color="#0e1628"/>
      <stop offset="72%" stop-color="#060a14"/>
      <stop offset="100%" stop-color="#02040a"/>
    </radialGradient>
    <radialGradient id="bgWash" cx="28%" cy="22%" r="65%">
      <stop offset="0%" stop-color="#2a3868" stop-opacity="0.22"/>
      <stop offset="55%" stop-color="#283060" stop-opacity="0.08"/>
      <stop offset="100%" stop-color="#1a2548" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="bgWash2" cx="82%" cy="78%" r="58%">
      <stop offset="0%" stop-color="#3a3568" stop-opacity="0.18"/>
      <stop offset="60%" stop-color="#2c2850" stop-opacity="0.06"/>
      <stop offset="100%" stop-color="#181428" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="vignette" cx="50%" cy="46%" r="72%">
      <stop offset="55%" stop-color="#020306" stop-opacity="0"/>
      <stop offset="100%" stop-color="#010208" stop-opacity="0.55"/>
    </radialGradient>
    <linearGradient id="rim" x1="8%" y1="4%" x2="94%" y2="96%">
      <stop offset="0%" stop-color="#1e2e48"/>
      <stop offset="100%" stop-color="#080c18"/>
    </linearGradient>
    <radialGradient id="tipTop" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#7c88bc" stop-opacity="0.45"/>
      <stop offset="45%" stop-color="#5c6494" stop-opacity="0.2"/>
      <stop offset="100%" stop-color="#3a4070" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="tipBot" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#7080b0" stop-opacity="0.4"/>
      <stop offset="50%" stop-color="#506088" stop-opacity="0.16"/>
      <stop offset="100%" stop-color="#303858" stop-opacity="0"/>
    </radialGradient>
    <!-- Soft airborne haze (blurred ribbon mass — reads as cloud, not line) -->
    <filter id="nebHaze" x="-100%" y="-100%" width="300%" height="300%">
      <feGaussianBlur in="SourceGraphic" stdDeviation="22" result="b"/>
      <feMerge>
        <feMergeNode in="b"/>
      </feMerge>
    </filter>
  </defs>

  <rect width="512" height="512" rx="108" fill="#02040c"/>
  <rect width="512" height="512" rx="108" fill="url(#bg)"/>
  <rect width="512" height="512" rx="108" fill="url(#bgWash)"/>
  <rect width="512" height="512" rx="108" fill="url(#bgWash2)"/>
  <!-- Distant faint cloud disks -->
  <ellipse cx="120" cy="380" rx="240" ry="150" fill="#344078" opacity="0.07" transform="rotate(18 120 380)"/>
  <ellipse cx="400" cy="140" rx="200" ry="128" fill="#403878" opacity="0.065" transform="rotate(-22 400 140)"/>

  <!-- Vignette depth -->
  <rect width="512" height="512" rx="108" fill="url(#vignette)" opacity="0.72"/>
  <rect width="512" height="512" rx="108" fill="none" stroke="url(#rim)" stroke-width="1.25" opacity="0.72"/>

  <!-- Endpoint bloom so caps feel continuous with nebula -->
  <ellipse cx="306" cy="162" rx="52" ry="44" fill="url(#tipTop)" transform="rotate(-28 306 162)"/>
  <ellipse cx="162" cy="434" rx="46" ry="40" fill="url(#tipBot)" transform="rotate(18 162 434)"/>

  <!-- Diffuse halo behind ribbon -->
  <g filter="url(#nebHaze)" opacity="0.5" stroke-linecap="round">
    <path d="${NEBULA_PATH}" fill="none" stroke="#5348a0" stroke-width="104"/>
    <path d="${NEBULA_PATH}" fill="none" stroke="#3d4890" stroke-width="82"/>
  </g>

  <!-- Layered ribbon: wide outer → luminous core (high mass / not LED) -->
  <g fill="none" stroke-linecap="round" stroke-linejoin="round">
    <path d="${NEBULA_PATH}" stroke="#1f1738" stroke-width="88" opacity="0.36"/>
    <path d="${NEBULA_PATH}" stroke="#282050" stroke-width="76" opacity="0.44"/>
    <path d="${NEBULA_PATH}" stroke="#342c62" stroke-width="64" opacity="0.5"/>
    <path d="${NEBULA_PATH}" stroke="#3d3a78" stroke-width="54" opacity="0.54"/>
    <path d="${NEBULA_PATH}" stroke="#4a5090" stroke-width="44" opacity="0.56"/>
    <path d="${NEBULA_PATH}" stroke="#5868aa" stroke-width="34" opacity="0.58"/>
    <path d="${NEBULA_PATH}" stroke="#6f82c4" stroke-width="24" opacity="0.58"/>
    <path d="${NEBULA_PATH}" stroke="#93a6de" stroke-width="16" opacity="0.55"/>
    <path d="${NEBULA_PATH}" stroke="#bac6ea" stroke-width="10" opacity="0.5"/>
    <path d="${NEBULA_PATH}" stroke="#dce3f6" stroke-width="5.5" opacity="0.36"/>
  </g>

  <g fill="#c8d4ed">
    <circle cx="132" cy="118" r="1.1" opacity="0.09"/>
    <circle cx="386" cy="98" r="1" opacity="0.085"/>
    <circle cx="88" cy="288" r="0.95" opacity="0.078"/>
    <circle cx="432" cy="362" r="1.05" opacity="0.082"/>
    <circle cx="256" cy="72" r="0.85" opacity="0.07"/>
    <circle cx="64" cy="196" r="0.85" opacity="0.068"/>
    <circle cx="336" cy="466" r="1" opacity="0.074"/>
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

console.log("Wrote PNGs to public/icons/ (wide nebula S ribbon + haze)");
