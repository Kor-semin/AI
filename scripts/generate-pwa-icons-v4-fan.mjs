/**
 * Sensora PWA v4 아이콘 — BX 가이드라인의 부채꼴 심볼(벡터)로 생성합니다.
 * 이전 v3(파란 S 래스터)과 달리 소스 PNG 없이 SVG에서 직접 렌더링합니다.
 *   node scripts/generate-pwa-icons-v4-fan.mjs
 * 산출물:
 *   public/icons/icon-192-v4.png · icon-512-v4.png (any)
 *   public/icons/icon-512-maskable-v4.png (maskable)
 *   public/icons/apple-touch-icon-v4.png (180)
 *   app/favicon.ico (16/32/48 PNG 내장 ICO)
 */
import { writeFile, mkdir } from "fs/promises";
import { dirname, join } from "path";
import sharp from "sharp";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const iconsDir = join(root, "public", "icons");

/** 다크 와인 배경 — 로고 워드마크 색(#2A0405) */
const BG = "#2A0405";

/** 부채꼴 심볼(뷰박스 0 0 32 32) — 다크 배경용 라이트 로즈 톤 */
const FAN_PATHS = [
  ["M3 16 30 2.4 30 7.4Z", "#E8A9AF"],
  ["M3 16 30 8.6 30 12.9Z", "#D98A93"],
  ["M3 16 30 14.1 30 17.9Z", "#F6DDDF"],
  ["M3 16 30 19.1 30 23.4Z", "#D98A93"],
  ["M3 16 30 24.6 30 29.6Z", "#E8A9AF"],
];

function fanGroup(canvas, contentScale) {
  const inner = canvas * contentScale;
  const offset = (canvas - inner) / 2;
  const s = inner / 32;
  const paths = FAN_PATHS.map(
    ([d, color]) =>
      `<path d="${d}" fill="${color}" stroke="${color}" stroke-width="1.1" stroke-linejoin="round"/>`,
  ).join("");
  return `<g transform="translate(${offset} ${offset}) scale(${s})">${paths}</g>`;
}

function iconSvg(canvas, { contentScale, rounded }) {
  // v3와 동일 비율의 모서리(108/512)
  const rx = rounded ? Math.round((canvas * 108) / 512) : 0;
  return Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${canvas}" height="${canvas}" viewBox="0 0 ${canvas} ${canvas}">` +
      `<rect width="${canvas}" height="${canvas}" rx="${rx}" ry="${rx}" fill="${BG}"/>` +
      fanGroup(canvas, contentScale) +
      `</svg>`,
  );
}

async function renderPng(canvas, opts) {
  return sharp(iconSvg(canvas, opts)).png().toBuffer();
}

/** PNG 여러 장을 담은 ICO 컨테이너를 만듭니다(모던 브라우저는 PNG 내장 ICO 지원). */
function buildIco(entries) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type: icon
  header.writeUInt16LE(entries.length, 4);

  const dir = Buffer.alloc(16 * entries.length);
  let offset = 6 + 16 * entries.length;
  entries.forEach(({ size, buf }, i) => {
    const o = i * 16;
    dir.writeUInt8(size >= 256 ? 0 : size, o); // width
    dir.writeUInt8(size >= 256 ? 0 : size, o + 1); // height
    dir.writeUInt8(0, o + 2); // palette
    dir.writeUInt8(0, o + 3); // reserved
    dir.writeUInt16LE(1, o + 4); // planes
    dir.writeUInt16LE(32, o + 6); // bpp
    dir.writeUInt32LE(buf.length, o + 8);
    dir.writeUInt32LE(offset, o + 12);
    offset += buf.length;
  });

  return Buffer.concat([header, dir, ...entries.map((e) => e.buf)]);
}

async function main() {
  await mkdir(iconsDir, { recursive: true });

  // any: 둥근 모서리 배경 + 심볼 64%
  await writeFile(join(iconsDir, "icon-192-v4.png"), await renderPng(192, { contentScale: 0.64, rounded: true }));
  await writeFile(join(iconsDir, "icon-512-v4.png"), await renderPng(512, { contentScale: 0.64, rounded: true }));
  // maskable: 풀블리드 배경 + 심볼 54% (런처가 자체 마스크 적용)
  await writeFile(join(iconsDir, "icon-512-maskable-v4.png"), await renderPng(512, { contentScale: 0.54, rounded: false }));
  // apple-touch: iOS가 모서리를 직접 깎으므로 풀블리드
  await writeFile(join(iconsDir, "apple-touch-icon-v4.png"), await renderPng(180, { contentScale: 0.64, rounded: false }));

  // favicon.ico — 16/32/48
  const icoEntries = [];
  for (const size of [16, 32, 48]) {
    icoEntries.push({ size, buf: await renderPng(size, { contentScale: 0.8, rounded: true }) });
  }
  await writeFile(join(root, "app", "favicon.ico"), buildIco(icoEntries));

  console.log("v4 fan icons written: icon-192/512, maskable, apple-touch, favicon.ico");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
