import sharp from "sharp";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = join(__dirname, "..", "public");

const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="p" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" style="stop-color:#fbf7ef"/>
      <stop offset="100%" style="stop-color:#f1eadc"/>
    </linearGradient>
  </defs>
  <rect width="512" height="512" rx="108" fill="url(#p)"/>
  <rect x="96" y="96" width="320" height="320" rx="28" fill="none" stroke="#1a1a1a" stroke-width="28"/>
  <circle cx="256" cy="220" r="42" fill="#1a1a1a"/>
  <path d="M168 342h176" stroke="#1a1a1a" stroke-width="24" stroke-linecap="round"/>
</svg>`;

const buf = Buffer.from(svg, "utf8");

async function out(name, size) {
  await sharp(buf).resize(size, size).png().toFile(join(publicDir, name));
}

await out("icon-192.png", 192);
await out("icon-512.png", 512);
