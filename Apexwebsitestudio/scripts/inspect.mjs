#!/usr/bin/env node
// One browser pass → one compact JSON report. Replaces eyeballing for everything a script can judge.
// Usage: node inspect.mjs <url|file.html> [--out DIR] [--shots]   (exit 1 when blockers exist)
// Checks: horizontal overflow, header collisions, empty boxes, call link in first viewport,
// long centered paragraphs, page height, axe-core (serious+critical), console errors, LCP/CLS, weight.
// --shots also builds sheet-mobile.png and sheet-desktop.png: the whole tour as one contact sheet
// (critics view 2 images instead of ~20, roughly 10x fewer image tokens).
// --shots writes a scroll tour: mobile-NN.png (375×812) and desktop-NN.png (1280×800), one per screen,
// max 10 each, plus 768.png, 1920.png and 375-reduced-motion.png. Tours trigger scroll reveals, and
// screen-sized images stay legible for critics (a full-page strip gets shrunk to mush).
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import fs from 'node:fs'; import path from 'node:path'; import os from 'node:os';

function load(name) {   // find deps next to the script, in cwd, or in the shared tools dir from setup.sh
  for (const base of [import.meta.url, pathToFileURL(path.join(process.cwd(), 'x.js')).href,
    pathToFileURL(path.join(os.homedir(), '.apex-atelier/tools/x.js')).href]) {
    try { return createRequire(base)(name); } catch {}
  }
  return null;
}
const pw = load('playwright');
if (!pw) { console.log(JSON.stringify({ error: 'playwright missing: run scripts/setup.sh' })); process.exit(2); }
const axeSrc = (() => { try { return fs.readFileSync(createRequire(import.meta.url).resolve?.('axe-core') ?? '', 'utf8'); } catch {}
  for (const b of [process.cwd(), path.join(os.homedir(), '.apex-atelier/tools')]) {
    const p = path.join(b, 'node_modules/axe-core/axe.min.js'); if (fs.existsSync(p)) return fs.readFileSync(p, 'utf8'); }
  return null; })();

const args = process.argv.slice(2); const target = args.find(a => !a.startsWith('--'));
const out = args.includes('--out') ? args[args.indexOf('--out') + 1] : '.atelier/inspect';
const shots = args.includes('--shots');
const url = /^https?:/.test(target) ? target : pathToFileURL(path.resolve(target)).href;
const report = { url, blockers: [], warnings: [], metrics: {} };
const B = m => report.blockers.push(m), W = m => report.warnings.push(m);

const browser = await pw.chromium.launch();
async function pass(width, height, opts = {}) {
  const ctx = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: 1, ...opts });
  const page = await ctx.newPage(); const errors = [];
  page.on('pageerror', e => errors.push(String(e.message).slice(0, 120)));
  page.on('console', m => m.type() === 'error' && !/Failed to load resource/.test(m.text()) && errors.push(m.text().slice(0, 120)));
  page.on('requestfailed', r => report.warnings.push(`missing resource: ${r.url().split('/').pop().slice(0, 60)}`));
  await page.addInitScript(() => {
    window.__lcp = 0; window.__cls = 0;
    new PerformanceObserver(l => { for (const e of l.getEntries()) window.__lcp = e.startTime; }).observe({ type: 'largest-contentful-paint', buffered: true });
    new PerformanceObserver(l => { for (const e of l.getEntries()) if (!e.hadRecentInput) window.__cls += e.value; }).observe({ type: 'layout-shift', buffered: true });
  });
  await page.goto(url, { waitUntil: 'load', timeout: 45000 });
  await page.waitForTimeout(800);
  return { ctx, page, errors };
}


async function tour(page, prefix, max = 10) {
  const H = page.viewportSize().height; const total = await page.evaluate(() => document.documentElement.scrollHeight);
  const n = Math.min(max, Math.ceil(total / H)); const step = n > 1 ? (total - H) / (n - 1) : 0;
  for (let i = 0; i < n; i++) { await page.evaluate(y => window.scrollTo(0, y), Math.round(i * step)); await page.waitForTimeout(450);
    await page.screenshot({ path: `${out}/${prefix}-${String(i + 1).padStart(2, '0')}.png` }); }
  await page.evaluate(() => window.scrollTo(0, 0));
}

async function sheet(prefix, cols, w) {
  const files = fs.readdirSync(out).filter(f => f.startsWith(prefix + '-') && f.endsWith('.png')).sort();
  if (!files.length) return;
  const imgs = files.map(f => `<figure><img src="data:image/png;base64,${fs.readFileSync(path.join(out, f)).toString('base64')}"><figcaption>${f.replace('.png', '')}</figcaption></figure>`).join('');
  const ctx = await browser.newContext({ viewport: { width: cols * (w + 12) + 12, height: 400 } }); const p = await ctx.newPage();
  await p.setContent(`<style>body{margin:0;padding:6px;background:#222;display:grid;grid-template-columns:repeat(${cols},${w}px);gap:12px}figure{margin:0}img{width:100%;display:block;outline:1px solid #555}figcaption{font:12px monospace;color:#ccc;padding:2px 0}</style>${imgs}`);
  await p.screenshot({ path: `${out}/sheet-${prefix}.png`, fullPage: true }); await ctx.close();
}

const layout = () => {
  const r = { b: [], w: [] }, d = document.documentElement;
  // On phones a too-wide page silently widens the layout viewport (VW 735 on a 375 screen), so measure the device.
  const VW = Math.min(innerWidth, screen.width || innerWidth, d.clientWidth), VH = Math.min(innerHeight, d.clientHeight);
  const vis = e => { const s = getComputedStyle(e), b = e.getBoundingClientRect();
    return s.visibility !== 'hidden' && +s.opacity > 0.05 && b.width > 1 && b.height > 1; };
  if (Math.max(d.scrollWidth, innerWidth) > VW + 2) {
    const culprit = [...document.querySelectorAll('body *')].find(e => vis(e) && e.getBoundingClientRect().right > VW + 2 && getComputedStyle(e).position !== 'fixed');
    r.b.push(`horizontal overflow ${Math.max(d.scrollWidth, innerWidth)}px > ${VW}px` + (culprit ? ` (e.g. <${culprit.tagName.toLowerCase()} class="${String(culprit.className).slice(0, 40)}">)` : ''));
  }
  // Clipped content: catches overflow that overflow-x:hidden on body would mask.
  const scrollerAnc = e => { for (let a = e.parentElement; a && a !== document.body; a = a.parentElement) { const o = getComputedStyle(a).overflowX; if (o === 'auto' || o === 'scroll') return true; } return false; };
  const clipped = [...document.querySelectorAll('body *')].filter(e => e instanceof HTMLElement && !e.closest('[aria-hidden="true"]') && vis(e)
    && (e.children.length === 0 || /^(IMG|PICTURE|VIDEO)$/.test(e.tagName)) && (e.textContent.trim() || /^(IMG|PICTURE|VIDEO)$/.test(e.tagName))
    && (b => b.right > VW + 4 && b.left < VW - 4 && b.top < d.scrollHeight)(e.getBoundingClientRect())
    && getComputedStyle(e).position !== 'fixed' && !scrollerAnc(e));
  if (clipped.length) r.b.push(`${clipped.length} element(s) cut off at the right edge, e.g. "${(clipped[0].textContent || clipped[0].tagName).trim().slice(0, 30)}"`);
  const hdr = document.querySelector('header') || document.querySelector('[role=banner]') || document.querySelector('nav');
  if (hdr) {
    const hb = hdr.getBoundingClientRect();
    if (VW < 500 && hb.height > 88 && hb.top < 80) r.b.push(`mobile header is ${Math.round(hb.height)}px tall (aim ≤ 72)`);
    const leaves = [...hdr.querySelectorAll('a,button,img,svg,span,p,h1,div')].filter(e => vis(e) && e.children.length === 0 && e.getBoundingClientRect().top < VH);
    const R = leaves.map(e => [e, e.getBoundingClientRect()]); const seen = new Set();
    for (let i = 0; i < R.length; i++) for (let j = i + 1; j < R.length; j++) {
      const [a, A] = R[i], [c, C] = R[j]; if (a.contains(c) || c.contains(a)) continue;
      const ox = Math.min(A.right, C.right) - Math.max(A.left, C.left), oy = Math.min(A.bottom, C.bottom) - Math.max(A.top, C.top);
      if (ox > 6 && oy > 6) { const k = `${(a.textContent || a.tagName).trim().slice(0, 18)} × ${(c.textContent || c.tagName).trim().slice(0, 18)}`; if (!seen.has(k)) { seen.add(k); r.b.push(`header elements overlap: ${k}`); } }
    }
    const wraps = [...hdr.querySelectorAll('a,button')].filter(e => vis(e) && e.textContent.trim().length > 3 && e.getClientRects().length && e.getBoundingClientRect().height > 2.2 * parseFloat(getComputedStyle(e).lineHeight || 20));
    wraps.forEach(e => r.w.push(`header control text wraps: "${e.textContent.trim().slice(0, 30)}"`));
  }
  const tel = [...document.querySelectorAll('a[href^="tel:"]')].filter(vis);
  const inFirst = tel.some(e => { const b = e.getBoundingClientRect(); return b.top >= 0 && b.bottom <= VH; });
  r.tel = tel.length; r.telFirstViewport = inFirst;
  for (const e of document.querySelectorAll('main *, section *')) {
    if (!(e instanceof HTMLElement) || e.closest('svg,[aria-hidden="true"]')) continue;   // decorative layers are fine
    const b = e.getBoundingClientRect(); if (b.width < 220 || b.height < 160 || !vis(e)) continue;
    const s = getComputedStyle(e);
    if (s.pointerEvents === 'none' || s.position === 'absolute' || s.position === 'fixed') continue;
    if (!e.textContent.trim() && !e.querySelector('img,svg,video,canvas,iframe,picture,object') && s.backgroundImage === 'none'
      && !/^(IMG|VIDEO|CANVAS|SVG|IFRAME|PICTURE|TEXTAREA|INPUT|SELECT|BUTTON|FORM)$/.test(e.tagName)) { r.b.push(`empty ${Math.round(b.width)}×${Math.round(b.height)} box <${e.tagName.toLowerCase()} class="${String(e.className).slice(0, 40)}">`); break; }
  }
  for (const p of document.querySelectorAll('p')) { const s = getComputedStyle(p); const lh = parseFloat(s.lineHeight) || 24;
    if (vis(p) && s.textAlign === 'center' && p.getBoundingClientRect().height > 4.5 * lh) { r.w.push(`centered paragraph over 4 lines: "${p.textContent.trim().slice(0, 40)}…"`); break; } }
  const h1 = [...document.querySelectorAll('h1')]; r.h1 = h1.length; r.h1Text = h1[0]?.textContent.trim().replace(/\s+/g, ' ').slice(0, 90);
  r.heightVp = +(d.scrollHeight / VH).toFixed(1);
  r.lcp = Math.round(window.__lcp); r.cls = +window.__cls.toFixed(3);
  const tap = [...document.querySelectorAll('a,button,input,select')].filter(e => vis(e)).filter(e => { const b = e.getBoundingClientRect(); return b.top < VH && (b.height < 32 || b.width < 32) && e.textContent.trim().length < 30; });
  r.smallTaps = tap.length;
  return r;
};

// Mobile pass (the one that matters most for local service sites)
const m = await pass(375, 812, { isMobile: true, hasTouch: true });
const lm = await m.page.evaluate(layout);
lm.b.forEach(x => B(`[375] ${x}`)); lm.w.forEach(x => W(`[375] ${x}`));
if (!lm.tel) B('[375] no tel: link anywhere'); else if (!lm.telFirstViewport) B('[375] no call link visible in the first screen');
if (lm.h1 !== 1) B(`${lm.h1} <h1> elements (want exactly 1)`);
if (lm.smallTaps > 3) W(`[375] ${lm.smallTaps} tap targets under 32px in the first screen`);
if (m.errors.length) B(`JS errors: ${[...new Set(m.errors)].slice(0, 3).join(' | ')}`);
if (axeSrc) {
  await m.page.addScriptTag({ content: axeSrc });
  const ax = await m.page.evaluate(async () => (await axe.run(document, { resultTypes: ['violations'] })).violations
    .filter(v => ['serious', 'critical'].includes(v.impact)).map(v => `${v.id} ×${v.nodes.length}`));
  report.metrics.axe = ax; ax.forEach(v => B(`axe: ${v}`));
} else W('axe-core not installed: accessibility not machine-checked');
const weight = await m.page.evaluate(() => performance.getEntriesByType('resource').reduce((s, r) => s + (r.transferSize || r.encodedBodySize || 0), 0) + (performance.getEntriesByType('navigation')[0]?.encodedBodySize || 0));
report.metrics.mobile = { h1: lm.h1Text, heightVp: lm.heightVp, lcpMs: lm.lcp, cls: lm.cls, kb: Math.round(weight / 1024) };
if (weight > 1.5e6) W(`first load ≈ ${(weight / 1e6).toFixed(1)} MB (aim < 1 MB)`);
if (lm.cls > 0.1) B(`CLS ${lm.cls} (> 0.1)`);
if (shots) { fs.mkdirSync(out, { recursive: true }); await tour(m.page, 'mobile'); }
await m.ctx.close();

// Desktop pass
const dsk = await pass(1280, 800);
const ld = await dsk.page.evaluate(layout);
ld.b.filter(x => !/tel|header is/.test(x)).forEach(x => B(`[1280] ${x}`));
if (ld.heightVp > 9) B(`[1280] homepage is ${ld.heightVp} screens tall (budget 7): cut or merge sections`); else if (ld.heightVp > 7.5) W(`[1280] homepage is ${ld.heightVp} screens tall (budget 7)`);
report.metrics.desktop = { heightVp: ld.heightVp, lcpMs: ld.lcp, cls: ld.cls };
if (shots) await tour(dsk.page, 'desktop');
await dsk.ctx.close();

if (shots) {
  for (const [w, h] of [[768, 1024], [1920, 1080]]) { const p = await pass(w, h); await p.page.screenshot({ path: `${out}/${w}.png` }); await p.ctx.close(); }
  const rm = await pass(375, 812, { reducedMotion: 'reduce', isMobile: true }); await rm.page.screenshot({ path: `${out}/375-reduced-motion.png` }); await rm.ctx.close();
  await sheet('mobile', 5, 300); await sheet('desktop', 3, 520);
  report.shots = out;
}
await browser.close();
report.blockers = [...new Set(report.blockers)]; report.warnings = [...new Set(report.warnings)].slice(0, 15);
console.log(JSON.stringify(report, null, 1));
process.exit(report.blockers.length ? 1 : 0);
