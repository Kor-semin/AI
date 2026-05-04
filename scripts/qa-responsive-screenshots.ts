/**
 * 반복 QA: 랜딩 반응형 PNG + `sensora:textSize=large` 390px 체크리스트.
 *
 * 실행:
 *   npm run build
 *   npx playwright install chromium
 *   npm run qa:responsive-screenshots
 *
 * 결과: `qa/screenshots/` (전체 gitignored) — 커밋하지 마세요.
 * 브라우저 프로필은 일회성입니다. 수동 테스트 후에는
 * `localStorage.setItem('sensora:textSize','medium'); location.reload()` 권장.
 *
 * `page.evaluate` 본문은 `qa-evaluators.cjs`(순수 JS)에 두어 tsx의 `__name` 주입 이슈를 피합니다.
 */

import { spawn } from "node:child_process";
import { createRequire } from "node:module";
import fs from "node:fs";
import net from "node:net";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { chromium, type Browser } from "playwright";

const require = createRequire(import.meta.url);
const ev = require("./qa-evaluators.cjs") as {
  afterReload: () => {
    stored: string | null;
    datasetTextSize: string | undefined;
    rects: Record<string, { ok: boolean; detail: string; found: boolean }>;
    vw: number;
    vh: number;
    scrollWidth: number;
    scrollWidthOk: boolean;
    heroContain: { ok: boolean; detail: string; padCheck?: boolean };
    isDesktopNav: boolean;
  };
  modalStep0: () => { ok: boolean; reason?: string; out?: Record<string, { ok: boolean; detail: string; found: boolean }> };
  modalStep1: () => { ok: boolean; reason?: string; out?: Record<string, { ok: boolean; detail: string; found: boolean }> };
  modalGallery: () => { ok: boolean; reason?: string; out?: Record<string, { ok: boolean; detail: string; found: boolean }> };
  lastStepFooter: () => { ok: boolean; detail?: string; all?: Array<{ i: number; ok: boolean; detail: string }>; vh?: number };
  openCallsCount: () => number;
};

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const outDir = path.join(root, "qa", "screenshots");
const PORT = Number(process.env.QA_SCREENSHOT_PORT || 3010);
const BASE = `http://127.0.0.1:${PORT}`;
const TEXT_KEY = "sensora:textSize";

function mkdirp(dir: string) {
  fs.mkdirSync(dir, { recursive: true });
}

function waitForPort(port: number, timeoutMs = 120_000): Promise<void> {
  const start = Date.now();
  return new Promise((resolve, reject) => {
    const tryOnce = () => {
      const socket = net.createConnection({ port, host: "127.0.0.1" }, () => {
        socket.end();
        resolve();
      });
      socket.on("error", () => {
        socket.destroy();
        if (Date.now() - start > timeoutMs) reject(new Error(`Port ${port} not ready within ${timeoutMs}ms`));
        else setTimeout(tryOnce, 400);
      });
    };
    tryOnce();
  });
}

function killTree(proc: ReturnType<typeof spawn> | undefined) {
  if (!proc?.pid) return;
  if (process.platform === "win32") {
    spawn("taskkill", ["/pid", String(proc.pid), "/f", "/t"], { stdio: "ignore", shell: true });
  } else {
    try {
      process.kill(-proc.pid, "SIGTERM");
    } catch {
      proc.kill("SIGTERM");
    }
  }
}

function startNextStart() {
  return spawn("npm", ["run", "start", "--", "-p", String(PORT)], {
    cwd: root,
    stdio: "pipe",
    shell: true,
    env: { ...process.env, NODE_ENV: "production" },
  });
}

async function screenshotViewport(
  browser: Browser,
  width: number,
  height: number,
  file: string,
  textSize: "medium" | "large" | null,
) {
  const ctx = await browser.newContext({ viewport: { width, height } });
  if (textSize) {
    await ctx.addInitScript(
      ([k, v]) => {
        localStorage.setItem(k, v);
      },
      [TEXT_KEY, textSize],
    );
  }
  const page = await ctx.newPage();
  await page.goto(BASE, { waitUntil: "domcontentloaded", timeout: 120_000 });
  await page.waitForSelector(".landing-showcase-hero", { timeout: 60_000 });
  await new Promise((r) => setTimeout(r, 2200));
  await page.screenshot({ path: path.join(outDir, file), fullPage: true });
  await ctx.close();
}

async function main() {
  mkdirp(outDir);
  let server: ReturnType<typeof spawn> | undefined;

  try {
    server = startNextStart();
    await waitForPort(PORT);

    const browser = await chromium.launch({ headless: true });

    await screenshotViewport(browser, 430, 932, "landing-430.png", "medium");
    await screenshotViewport(browser, 1440, 900, "landing-1440.png", "medium");

    const ctx430Check = await browser.newContext({ viewport: { width: 430, height: 932 } });
    const page430 = await ctx430Check.newPage();
    await page430.goto(BASE, { waitUntil: "domcontentloaded", timeout: 120_000 });
    await page430.waitForSelector(".landing-showcase-hero", { timeout: 60_000 });
    await new Promise((r) => setTimeout(r, 900));
    const metrics430 = await page430.evaluate(ev.afterReload);
    await ctx430Check.close();
    if (!metrics430.scrollWidthOk) {
      throw new Error(`[430] scrollWidth overflow: ${metrics430.scrollWidth} > ${metrics430.vw}`);
    }
    if (!metrics430.heroContain?.ok) {
      throw new Error(`[430] hero CTA containment: ${metrics430.heroContain?.detail ?? ""}`);
    }

    const ctx390 = await browser.newContext({ viewport: { width: 390, height: 844 } });
    await ctx390.addInitScript((k) => {
      localStorage.setItem(k, "large");
      const w = window as Window & { __sensoraOpenCalls?: number };
      w.__sensoraOpenCalls = 0;
      window.open = () => {
        w.__sensoraOpenCalls = (w.__sensoraOpenCalls ?? 0) + 1;
        return null;
      };
    }, TEXT_KEY);

    const page = await ctx390.newPage();
    await page.goto(BASE, { waitUntil: "domcontentloaded", timeout: 120_000 });
    await page.waitForSelector(".landing-showcase-hero", { timeout: 60_000 });
    await new Promise((r) => setTimeout(r, 600));

    await page.reload({ waitUntil: "domcontentloaded", timeout: 120_000 });
    await page.waitForSelector(".landing-showcase-hero", { timeout: 60_000 });
    await new Promise((r) => setTimeout(r, 800));

    const afterReload = await page.evaluate(ev.afterReload);

    if (afterReload.stored !== "large") {
      throw new Error(`localStorage ${TEXT_KEY}: expected large, got ${JSON.stringify(afterReload.stored)}`);
    }
    if (afterReload.datasetTextSize !== "large") {
      throw new Error(
        `document.documentElement.dataset.textSize: expected "large", got ${JSON.stringify(afterReload.datasetTextSize)}`,
      );
    }
    if (!afterReload.scrollWidthOk) {
      throw new Error(`[390-large] scrollWidth overflow: ${afterReload.scrollWidth} > ${afterReload.vw}`);
    }
    if (!afterReload.heroContain?.ok) {
      throw new Error(`[390-large] hero CTA containment: ${afterReload.heroContain?.detail ?? ""}`);
    }

    const heroCtaViewportOk = afterReload.rects.heroJoin?.ok === true && afterReload.rects.heroPreview?.ok === true;
    const navCtaOk =
      !afterReload.isDesktopNav ||
      (afterReload.rects.navPreview?.found === true &&
        afterReload.rects.navJoin?.found === true &&
        afterReload.rects.navPreview?.ok === true &&
        afterReload.rects.navJoin?.ok === true);

    const landingChecks = {
      headerCtaNoClip: heroCtaViewportOk && navCtaOk,
      navPreviewVisible: afterReload.isDesktopNav === true && afterReload.rects.navPreview?.found === true,
      heroCtaWithinCard: afterReload.heroContain.ok === true,
      scrollWidthOk: afterReload.scrollWidthOk === true,
    };

    await page.screenshot({ path: path.join(outDir, "landing-390-large.png"), fullPage: true });

    await page.locator(".landing-hero-showcase-cta-row button.landing-showroom-cta-preview").first().click();
    await page.waitForSelector("[data-app-preview-toc]", { timeout: 30_000 });
    await new Promise((r) => setTimeout(r, 500));

    const modalStep0 = await page.evaluate(ev.modalStep0);
    if (!modalStep0.ok) throw new Error(String(modalStep0.reason));

    const footerNav = page.locator("footer.sensora-guide-toc-footer");
    await page.getByRole("button", { name: "앱 시작하기" }).click();
    await new Promise((r) => setTimeout(r, 500));

    const modalStep1 = await page.evaluate(ev.modalStep1);
    if (!modalStep1.ok) throw new Error(String(modalStep1.reason));

    /** step1(기둥) → step2(가이드 갤러리): `다음` 한 번만 */
    await footerNav.getByRole("button", { name: "다음" }).click();
    await new Promise((r) => setTimeout(r, 700));

    const modalGallery = await page.evaluate(ev.modalGallery);
    if (!modalGallery.ok) throw new Error(String(modalGallery.reason));

    await page.locator("button.sensora-guide-pick-card").first().click();
    await page.waitForSelector("[data-sensora-guide-detail-modal]", { timeout: 20_000 });
    const urlDuringDetail = page.url();
    const openCalls = await page.evaluate(ev.openCallsCount);

    await page.keyboard.press("Escape");
    await page.locator("[data-sensora-guide-detail-modal]").waitFor({ state: "detached", timeout: 15_000 });

    const detailInternal =
      urlDuringDetail.startsWith(BASE) && !urlDuringDetail.includes("/join") && openCalls === 0;

    await footerNav.getByRole("button", { name: "다음" }).click();
    await new Promise((r) => setTimeout(r, 600));

    const lastStepFooter = await page.evaluate(ev.lastStepFooter);

    await page.screenshot({ path: path.join(outDir, "landing-390-large-wizard-last.png"), fullPage: true });

    await ctx390.close();
    await browser.close();

    const checklist = {
      landingHeaderCtaNoClip: landingChecks.headerCtaNoClip === true,
      appPreviewButtonOk: afterReload.rects.heroPreview?.found === true && afterReload.rects.heroPreview?.ok === true,
      heroCtaWithinCard: landingChecks.heroCtaWithinCard === true,
      documentNoHorizontalOverflow: landingChecks.scrollWidthOk === true,
      onboardingModalNoClip:
        modalStep0.ok &&
        Object.values(modalStep0.out ?? {}).every((x) => !x.found || x.ok) &&
        modalStep1.ok &&
        Object.values(modalStep1.out ?? {}).every((x) => !x.found || x.ok) &&
        modalGallery.ok &&
        Object.values(modalGallery.out ?? {}).every((x) => !x.found || x.ok),
      detailModalInApp: detailInternal,
      lastStepFooterNotClipped: lastStepFooter.ok === true,
    };

    const report = {
      capturedAt: new Date().toISOString(),
      paths: {
        "390-large": path.join(outDir, "landing-390-large.png"),
        "390-wizard-last": path.join(outDir, "landing-390-large-wizard-last.png"),
        "430": path.join(outDir, "landing-430.png"),
        "1440": path.join(outDir, "landing-1440.png"),
      },
      metrics430,
      afterReloadLarge: afterReload,
      landingChecks,
      modalStep0,
      modalStep1,
      modalGallery,
      detailModal: {
        urlDuringDetail,
        windowOpenCalls: openCalls,
        detailInternal,
      },
      lastStepFooter,
      checklist,
    };

    fs.writeFileSync(path.join(outDir, "qa-report.json"), JSON.stringify(report, null, 2), "utf8");

    const resetBrowser = await chromium.launch({ headless: true });
    try {
      const rctx = await resetBrowser.newContext();
      const rp = await rctx.newPage();
      await rp.goto(BASE, { waitUntil: "domcontentloaded", timeout: 60_000 });
      await rp.evaluate((k) => {
        try {
          localStorage.setItem(k, "medium");
          document.documentElement.setAttribute("data-text-size", "medium");
        } catch {
          /* ignore */
        }
      }, TEXT_KEY);
      const resetDs = await rp.evaluate(() => document.documentElement.dataset.textSize);
      if (resetDs !== "medium") {
        console.warn(`[qa] ephemeral reset: dataset.textSize=${JSON.stringify(resetDs)} (expected medium)`);
      }
    } finally {
      await resetBrowser.close();
    }

    console.log(JSON.stringify(report, null, 2));
    console.log("\n[qa] 완료. 산출물은 qa/screenshots/ (gitignore). package.json 스크립트: npm run qa:responsive-screenshots\n");
  } finally {
    killTree(server);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
