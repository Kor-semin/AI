/**
 * 로컬 production 서버에서 랜딩 반응형·large 글씨 캡처 + 검증 결과 기록.
 * 사용: npm run build && npm run qa:screenshots
 */
import { spawn } from "node:child_process";
import fs from "node:fs";
import net from "node:net";
import pathMod from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = pathMod.dirname(fileURLToPath(import.meta.url));
const root = pathMod.join(__dirname, "..");
const outDir = pathMod.join(root, "qa", "screenshots");
const PORT = Number(process.env.QA_SCREENSHOT_PORT || 3010);
const BASE = `http://127.0.0.1:${PORT}`;
const TEXT_KEY = "sensora:textSize";

function mkdirp(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function waitForPort(port, timeoutMs = 120_000) {
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

function killTree(proc) {
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
  const proc = spawn("npm", ["run", "start", "--", "-p", String(PORT)], {
    cwd: root,
    stdio: "pipe",
    shell: true,
    env: { ...process.env, NODE_ENV: "production" },
  });
  proc.stdout?.on("data", () => {});
  proc.stderr?.on("data", () => {});
  return proc;
}

async function main() {
  mkdirp(outDir);
  const { chromium } = await import("playwright");

  let server;
  try {
    server = startNextStart();
    await waitForPort(PORT);
    const browser = await chromium.launch({ headless: true });

    const shots = [
      { w: 390, h: 844, file: "landing-390-default.png", storage: null },
      { w: 430, h: 932, file: "landing-430-default.png", storage: null },
      { w: 1440, h: 900, file: "landing-1440-default.png", storage: null },
    ];

    for (const { w, h, file, storage } of shots) {
      const ctx = await browser.newContext({ viewport: { width: w, height: h } });
      if (storage) {
        await ctx.addInitScript((key, val) => {
          localStorage.setItem(key, val);
        }, TEXT_KEY, storage);
      }
      const page = await ctx.newPage();
      await page.goto(BASE, { waitUntil: "domcontentloaded", timeout: 120_000 });
      await page.waitForSelector(".landing-showcase-hero", { timeout: 60_000 });
      await new Promise((r) => setTimeout(r, 2800));
      await page.screenshot({ path: pathMod.join(outDir, file), fullPage: true });
      await ctx.close();
    }

    /** large @ 390px — localStorage + 부트 스크립트로 data-text-size 검증 */
    const ctxL = await browser.newContext({ viewport: { width: 390, height: 844 } });
    await ctxL.addInitScript((key) => {
      localStorage.setItem(key, "large");
    }, TEXT_KEY);
    const pageL = await ctxL.newPage();
    await pageL.goto(BASE, { waitUntil: "domcontentloaded", timeout: 120_000 });
    await pageL.waitForSelector(".landing-showcase-hero", { timeout: 60_000 });
    await new Promise((r) => setTimeout(r, 2800));

    const verification = await pageL.evaluate(() => {
      const html = document.documentElement;
      const stored = (() => {
        try {
          return localStorage.getItem("sensora:textSize");
        } catch {
          return null;
        }
      })();
      const dataAttr = html.getAttribute("data-text-size");
      const body = document.body;
      const rootScroll = Math.max(html.scrollWidth - html.clientWidth, body.scrollWidth - body.clientWidth);
      const hero = document.querySelector(".landing-showcase-hero-headline");
      let heroOverflow = null;
      if (hero) {
        const r = hero.getBoundingClientRect();
        heroOverflow = r.width > html.clientWidth + 1;
      }
      const ctaRow = document.querySelector(".landing-showcase-copy-col .grid");
      let ctaWrapOk = null;
      if (ctaRow) {
        const r = ctaRow.getBoundingClientRect();
        ctaWrapOk = r.width <= html.clientWidth + 2;
      }
      return {
        stored,
        dataTextSize: dataAttr,
        rootHorizontalOverflowPx: rootScroll,
        heroHeadlineWiderThanViewport: heroOverflow,
        heroCtaGridFitsViewport: ctaWrapOk,
      };
    });

    await pageL.screenshot({ path: pathMod.join(outDir, "landing-390-text-large.png"), fullPage: true });
    await ctxL.close();
    await browser.close();

    const reportPath = pathMod.join(outDir, "verification-390-large.json");
    fs.writeFileSync(
      reportPath,
      JSON.stringify(
        {
          capturedAt: new Date().toISOString(),
          viewport: { width: 390, height: 844 },
          localStorageKey: TEXT_KEY,
          ...verification,
          checks: {
            storageIsLarge: verification.stored === "large",
            documentDataTextSizeLarge: verification.dataTextSize === "large",
            noRootHorizontalOverflow: verification.rootHorizontalOverflowPx <= 1,
            heroFitsWidth: verification.heroHeadlineWiderThanViewport !== true,
            ctaRowFits: verification.heroCtaGridFitsViewport !== false,
          },
        },
        null,
        2,
      ),
      "utf8",
    );

    const md = `# Responsive landing captures

Generated: ${new Date().toISOString()}

## File paths (absolute)

| Viewport | File |
|----------|------|
| 390×844 (default text) | \`${pathMod.join(outDir, "landing-390-default.png")}\` |
| 430×932 (default text) | \`${pathMod.join(outDir, "landing-430-default.png")}\` |
| 1440×900 (default text) | \`${pathMod.join(outDir, "landing-1440-default.png")}\` |
| 390×844 (\`sensora:textSize=large\`) | \`${pathMod.join(outDir, "landing-390-text-large.png")}\` |

## Large text verification (390px)

See \`verification-390-large.json\`.

Summary:
- \`stored === "large"\`: ${verification.stored === "large"}
- \`data-text-size === "large"\`: ${verification.dataTextSize === "large"}
- Root horizontal overflow (px): ${verification.rootHorizontalOverflowPx}
- Hero wider than viewport: ${verification.heroHeadlineWiderThanViewport}
- CTA grid fits viewport: ${verification.heroCtaGridFitsViewport}
`;

    fs.writeFileSync(pathMod.join(outDir, "REPORT.md"), md, "utf8");
    console.log(md);
  } finally {
    killTree(server);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
