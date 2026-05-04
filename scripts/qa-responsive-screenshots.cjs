const { mkdir } = require("node:fs/promises");
const { existsSync } = require("node:fs");
const { dirname, join } = require("node:path");

const { chromium } = require("@playwright/test");

const BASE_URL = process.env.QA_BASE_URL ?? "http://localhost:3000";
const OUT_DIR = join(process.cwd(), "qa", "screenshots");
const SYSTEM_CHROME_PATHS = [
  process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE,
  "/usr/local/bin/google-chrome",
  "/usr/bin/google-chrome-stable",
  "/usr/local/bin/chrome",
].filter(Boolean);

const CASES = [
  { name: "landing-390-large", width: 390, height: 900, textSize: "large" },
  { name: "landing-430", width: 430, height: 900 },
  { name: "landing-1440", width: 1440, height: 1100 },
];

async function assertLandingLayout(page, testCase) {
  const result = await page.evaluate(() => {
    const headerCtas = Array.from(
      document.querySelectorAll(".landing-nav-cta-preview, .landing-nav-cta-join"),
    ).filter((el) => {
      const rect = el.getBoundingClientRect();
      const style = window.getComputedStyle(el);
      return rect.width > 1 && rect.height > 1 && style.visibility !== "hidden" && style.display !== "none";
    });
    const heroCard = document.querySelector(".landing-hero-canvas");
    const heroCtas = Array.from(
      document.querySelectorAll(".landing-showcase-cta-primary, .landing-showcase-cta-ghost"),
    );
    const heroRect = heroCard?.getBoundingClientRect() ?? null;
    const ctaRects = heroCtas.map((el) => {
      const rect = el.getBoundingClientRect();
      return {
        left: rect.left,
        right: rect.right,
        width: rect.width,
        height: rect.height,
      };
    });
    return {
      viewportWidth: window.innerWidth,
      scrollWidth: document.documentElement.scrollWidth,
      headerCtaCount: headerCtas.length,
      heroRect: heroRect
        ? {
            left: heroRect.left,
            right: heroRect.right,
            width: heroRect.width,
          }
        : null,
      ctaRects,
    };
  });

  if (result.scrollWidth > result.viewportWidth) {
    throw new Error(`${testCase.name}: horizontal overflow ${result.scrollWidth} > ${result.viewportWidth}`);
  }

  if (testCase.width < 1024 && result.headerCtaCount > 0) {
    throw new Error(`${testCase.name}: mobile header CTA still visible (${result.headerCtaCount})`);
  }

  if (testCase.width >= 1024 && result.headerCtaCount < 2) {
    throw new Error(`${testCase.name}: desktop header CTA missing (${result.headerCtaCount})`);
  }

  if (!result.heroRect || result.ctaRects.length < 2) {
    throw new Error(`${testCase.name}: missing hero card or CTA buttons`);
  }

  const [primary, secondary] = result.ctaRects;
  const widthDelta = Math.abs(primary.width - secondary.width);
  if (widthDelta > 1) {
    throw new Error(`${testCase.name}: hero CTA widths differ by ${widthDelta.toFixed(2)}px`);
  }

  const inset = testCase.width < 1024 ? 20 : 0;
  for (const [idx, rect] of result.ctaRects.entries()) {
    if (rect.left < result.heroRect.left + inset - 1 || rect.right > result.heroRect.right - inset + 1) {
      throw new Error(
        `${testCase.name}: CTA ${idx + 1} outside card inset. card=${JSON.stringify(result.heroRect)} cta=${JSON.stringify(rect)}`,
      );
    }
  }

  console.log(
    [
      `${testCase.name}: ok`,
      `scroll=${result.scrollWidth}/${result.viewportWidth}`,
      `headerCtas=${result.headerCtaCount}`,
      `ctaWidths=${result.ctaRects.map((rect) => rect.width.toFixed(1)).join(",")}`,
    ].join(" "),
  );
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });
  const executablePath = SYSTEM_CHROME_PATHS.find((path) => existsSync(path));
  const browser = await chromium.launch({
    headless: true,
    executablePath,
  });
  try {
    for (const testCase of CASES) {
      const page = await browser.newPage({
        viewport: { width: testCase.width, height: testCase.height },
        deviceScaleFactor: 1,
      });
      await page.addInitScript((textSize) => {
        try {
          if (textSize) localStorage.setItem("sensora.textSize", textSize);
        } catch {
          // no-op: screenshot QA can still validate default sizing
        }
      }, testCase.textSize);
      await page.goto(BASE_URL, { waitUntil: "networkidle" });
      await assertLandingLayout(page, testCase);
      const filePath = join(OUT_DIR, `${testCase.name}.png`);
      await mkdir(dirname(filePath), { recursive: true });
      await page.screenshot({ path: filePath, fullPage: true });
      await page.close();
    }
  } finally {
    await browser.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
