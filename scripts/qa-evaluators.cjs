/**
 * Playwright page.evaluate()에 넘기는 함수 — 각 함수는 **자체 완결**(중첩 헬퍼 없음).
 * (직렬화 시 형제 함수는 포함되지 않음)
 */

function afterReload() {
  function fitRect(r, vw, vh, pad) {
    const p = pad === undefined ? 4 : pad;
    const ok = r.left >= -p && r.right <= vw + p && r.top >= -p && r.bottom <= vh + p;
    return {
      ok,
      detail:
        "L" +
        Math.round(r.left) +
        " R" +
        Math.round(r.right) +
        " T" +
        Math.round(r.top) +
        " B" +
        Math.round(r.bottom) +
        " vw" +
        vw +
        " vh" +
        vh,
    };
  }
  function isLaidOut(el) {
    if (!el) return false;
    const cs = window.getComputedStyle(el);
    if (cs.display === "none" || cs.visibility === "hidden") return false;
    const r = el.getBoundingClientRect();
    return r.width > 1 && r.height > 1;
  }
  const html = document.documentElement;
  const stored = localStorage.getItem("sensora:textSize");
  const ds = html.dataset.textSize;
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const isDesktopNav = vw >= 1024;
  const scrollWidth = html.scrollWidth;
  const scrollWidthOk = scrollWidth <= vw + 1;
  const rects = {};
  const navPairs = [
    ["navPreview", "button.landing-nav-cta-preview"],
    ["navJoin", "a.landing-nav-cta-join"],
  ];
  for (let i = 0; i < navPairs.length; i++) {
    const key = navPairs[i][0];
    const sel = navPairs[i][1];
    const el = document.querySelector(sel);
    if (!el) rects[key] = { ok: false, detail: "missing", found: false };
    else if (!isLaidOut(el)) {
      rects[key] = { ok: true, detail: "hidden-below-lg", found: false };
    } else {
      const r = el.getBoundingClientRect();
      const f = fitRect(r, vw, vh, 4);
      rects[key] = { ok: f.ok, detail: f.detail, found: true };
    }
  }
  const ctaRow = document.querySelector(".landing-hero-showcase-cta-row");
  if (ctaRow) ctaRow.scrollIntoView({ block: "center", inline: "nearest" });
  const heroPairs = [
    ["heroJoin", ".landing-hero-showcase-cta-row a.landing-showroom-cta-join"],
    ["heroPreview", ".landing-hero-showcase-cta-row button.landing-showroom-cta-preview"],
  ];
  for (let i = 0; i < heroPairs.length; i++) {
    const key = heroPairs[i][0];
    const sel = heroPairs[i][1];
    const el = document.querySelector(sel);
    if (!el) rects[key] = { ok: false, detail: "missing", found: false };
    else {
      const r = el.getBoundingClientRect();
      const f = fitRect(r, vw, vh, 16);
      rects[key] = { ok: f.ok, detail: f.detail, found: true };
    }
  }
  const card = document.querySelector("[data-sensora-landing-hero-copy-card]");
  const joinEl = document.querySelector(".landing-hero-showcase-cta-row a.landing-showroom-cta-join");
  const previewEl = document.querySelector(".landing-hero-showcase-cta-row button.landing-showroom-cta-preview");
  let heroContain = { ok: false, detail: "missing-card-or-ctas", padCheck: false };
  if (card && joinEl && previewEl) {
    const cr = card.getBoundingClientRect();
    const cs = window.getComputedStyle(card);
    const pl = parseFloat(cs.paddingLeft) || 0;
    const pr = parseFloat(cs.paddingRight) || 0;
    const innerLeft = cr.left + pl;
    const innerRight = cr.right - pr;
    const jr = joinEl.getBoundingClientRect();
    const prr = previewEl.getBoundingClientRect();
    const tol = 1.5;
    const padTarget = 16;
    const padOk =
      jr.left + tol >= cr.left + Math.min(padTarget, pl) &&
      prr.left + tol >= cr.left + Math.min(padTarget, pl) &&
      jr.right <= cr.right - Math.min(padTarget, pr) + tol &&
      prr.right <= cr.right - Math.min(padTarget, pr) + tol;
    const innerOk =
      jr.left + tol >= innerLeft &&
      prr.left + tol >= innerLeft &&
      jr.right <= innerRight + tol &&
      prr.right <= innerRight + tol;
    const ok = innerOk && scrollWidthOk;
    heroContain = {
      ok: ok,
      padCheck: padOk,
      detail:
        "card L" +
        Math.round(cr.left) +
        " R" +
        Math.round(cr.right) +
        " inner L" +
        Math.round(innerLeft) +
        " R" +
        Math.round(innerRight) +
        " join L" +
        Math.round(jr.left) +
        " R" +
        Math.round(jr.right) +
        " prev L" +
        Math.round(prr.left) +
        " R" +
        Math.round(prr.right) +
        " sw" +
        scrollWidth +
        " vw" +
        vw,
    };
  }
  return { stored, datasetTextSize: ds, rects, vw, vh, scrollWidth, scrollWidthOk, heroContain, isDesktopNav };
}

function modalStep0() {
  function fitRect(r, vw, vh, pad) {
    const p = pad === undefined ? 4 : pad;
    const ok = r.left >= -p && r.right <= vw + p && r.top >= -p && r.bottom <= vh + p;
    return { ok, detail: "L" + Math.round(r.left) + " R" + Math.round(r.right) + " T" + Math.round(r.top) + " B" + Math.round(r.bottom) };
  }
  const root = document.querySelector("[data-app-preview-toc]");
  if (!root) return { ok: false, reason: "no toc root" };
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const footer = root.querySelector("footer.sensora-guide-toc-footer");
  const closeBtn = root.querySelector("[data-app-preview-toc-close]");
  const kicker = root.querySelector(".sensora-guide-toc-scroll h2");
  const out = {};
  const step0Pairs = [
    ["closeBtn", closeBtn],
    ["footer", footer],
    ["headerKicker", kicker],
  ];
  for (let j = 0; j < step0Pairs.length; j++) {
    const name = step0Pairs[j][0];
    const el = step0Pairs[j][1];
    if (!el) out[name] = { ok: false, detail: "missing", found: false };
    else {
      const r = el.getBoundingClientRect();
      const f = fitRect(r, vw, vh, 4);
      out[name] = { ok: f.ok, detail: f.detail, found: true };
    }
  }
  return { ok: true, out };
}

function modalStep1() {
  function fitRect(r, vw, vh, pad) {
    const p = pad === undefined ? 4 : pad;
    const ok = r.left >= -p && r.right <= vw + p && r.top >= -p && r.bottom <= vh + p;
    return { ok, detail: "L" + Math.round(r.left) + " R" + Math.round(r.right) + " T" + Math.round(r.top) + " B" + Math.round(r.bottom) };
  }
  const root = document.querySelector("[data-app-preview-toc]");
  if (!root) return { ok: false, reason: "no root" };
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const pillar = root.querySelector("ul[role='list'] li button");
  const footer = root.querySelector("footer.sensora-guide-toc-footer");
  const out = {};
  const p1 = [
    ["pillarCard", pillar],
    ["footer", footer],
  ];
  for (let j = 0; j < p1.length; j++) {
    const name = p1[j][0];
    const el = p1[j][1];
    if (!el) out[name] = { ok: false, detail: "missing", found: false };
    else {
      const r = el.getBoundingClientRect();
      const f = fitRect(r, vw, vh, 4);
      out[name] = { ok: f.ok, detail: f.detail, found: true };
    }
  }
  return { ok: true, out };
}

function modalGallery() {
  function fitRect(r, vw, vh, pad) {
    const p = pad === undefined ? 4 : pad;
    const ok = r.left >= -p && r.right <= vw + p && r.top >= -p && r.bottom <= vh + p;
    return { ok, detail: "L" + Math.round(r.left) + " R" + Math.round(r.right) + " T" + Math.round(r.top) + " B" + Math.round(r.bottom) };
  }
  const root = document.querySelector("[data-app-preview-toc]");
  if (!root) return { ok: false, reason: "no root" };
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const pick = root.querySelector("button.sensora-guide-pick-card");
  const hero = root.querySelector("button.sensora-guide-hero-panel");
  const footer = root.querySelector("footer.sensora-guide-toc-footer");
  if (pick) pick.scrollIntoView({ block: "nearest", inline: "nearest" });
  const out = {};
  const pg = [
    ["pickCard", pick],
    ["heroPanel", hero],
    ["footer", footer],
  ];
  for (let j = 0; j < pg.length; j++) {
    const name = pg[j][0];
    const el = pg[j][1];
    if (!el) out[name] = { ok: false, detail: "missing", found: false };
    else {
      const r = el.getBoundingClientRect();
      const pad = name === "pickCard" ? 12 : 4;
      const f = fitRect(r, vw, vh, pad);
      out[name] = { ok: f.ok, detail: f.detail, found: true };
    }
  }
  return { ok: true, out };
}

function lastStepFooter() {
  function fitRect(r, vw, vh, pad) {
    const p = pad === undefined ? 8 : pad;
    const ok = r.left >= -p && r.right <= vw + p && r.top >= -p && r.bottom <= vh + p;
    return { ok, detail: "L" + Math.round(r.left) + " R" + Math.round(r.right) + " T" + Math.round(r.top) + " B" + Math.round(r.bottom) };
  }
  const root = document.querySelector("[data-app-preview-toc]");
  const footer = root && root.querySelector("footer.sensora-guide-toc-footer");
  if (!footer) return { ok: false, detail: "footer missing" };
  const buttons = Array.prototype.slice.call(footer.querySelectorAll("button.app-preview-guide-nav-btn"));
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const all = buttons.map(function (b, i) {
    const r = b.getBoundingClientRect();
    return Object.assign({ i: i }, fitRect(r, vw, vh, 8));
  });
  const ok = all.length >= 2 && all.every(function (x) {
    return x.ok;
  });
  return { ok: ok, all: all, vh: vh };
}

function openCallsCount() {
  const w = /** @type {Window & { __sensoraOpenCalls?: number }} */ (window);
  return w.__sensoraOpenCalls ?? 0;
}

module.exports = {
  afterReload,
  modalStep0,
  modalStep1,
  modalGallery,
  lastStepFooter,
  openCallsCount,
};
