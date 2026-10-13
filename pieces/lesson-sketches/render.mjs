// Renders the lesson sketches: a contact sheet of settled frames, or each lesson as an MP4 clip plus a WebP poster.
//   node pieces/lesson-sketches/render.mjs sheet <out.png> [B01,B02...]   settled frames, 4 across
//   node pieces/lesson-sketches/render.mjs clips <outDir> [ids...]       <id>.mp4 (12fps, on 2s) + <id>.webp
// Uses the animate skill's Playwright install (~/.claude/skills/animate/node_modules) and ffmpeg on PATH.
import { createRequire } from 'node:module';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';

const require = createRequire(path.join(os.homedir(), '.claude/skills/animate/package.json'));
const { chromium } = require('playwright');
const HERE = path.dirname(fileURLToPath(import.meta.url));
const [mode, out, filter] = process.argv.slice(2);
const pick = filter ? filter.split(',') : null;

const browser = await chromium.launch(), page = await browser.newPage();
page.on('pageerror', (e) => { console.error('PAGE ERROR:', e.message); process.exitCode = 1; });
await page.goto(pathToFileURL(path.join(HERE, 'index.html')).href + '?export=1');
await page.waitForFunction(() => window.TIMELINE && window.renderFrame);
await page.evaluate(() => document.fonts.ready);
const T = await page.evaluate(() => ({ ids: TIMELINE.lessons, L: TIMELINE.lessonT, fps: TIMELINE.fps }));
const ids = T.ids.filter((id) => !pick || pick.some((p) => id.startsWith(p)));

// One frame as PNG bytes, scaled to w px wide.
const frame = (t, w) => page.evaluate(([t, w]) => {
  const c = document.createElement('canvas'); c.width = TIMELINE.width; c.height = TIMELINE.height;
  window.renderFrame(t, c);
  const s = document.createElement('canvas'); s.width = w; s.height = Math.round(w * c.height / c.width);
  const g = s.getContext('2d'); g.imageSmoothingQuality = 'high'; g.drawImage(c, 0, 0, s.width, s.height);
  return s.toDataURL('image/png').split(',')[1];
}, [t, w]);

if (mode === 'sheet') {
  const cols = 4, w = 480, h = 270, pad = 8;
  const url = await page.evaluate(async ([ids, L, cols, w, h, pad]) => {
    const c = document.createElement('canvas'); c.width = TIMELINE.width; c.height = TIMELINE.height;
    const rows = Math.ceil(ids.length / cols), s = document.createElement('canvas');
    s.width = cols * (w + pad) + pad; s.height = rows * (h + pad + 28) + pad;
    const g = s.getContext('2d'); g.fillStyle = '#222'; g.fillRect(0, 0, s.width, s.height); g.font = '20px sans-serif'; g.fillStyle = '#eee';
    ids.forEach((id, i) => {
      const k = TIMELINE.lessons.indexOf(id), x = pad + (i % cols) * (w + pad), y = pad + Math.floor(i / cols) * (h + pad + 28);
      window.renderFrame((k + 1) * L - 0.1, c); g.drawImage(c, x, y + 26, w, h); g.fillText(id, x + 4, y + 20);
    });
    return s.toDataURL('image/png').split(',')[1];
  }, [ids, T.L, cols, w, h, pad]);
  fs.writeFileSync(out, Buffer.from(url, 'base64'));
  console.log('sheet', out, ids.length, 'lessons');
} else if (mode === 'clips') {
  fs.mkdirSync(out, { recursive: true });
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'sketch-'));
  for (const id of ids) {
    const k = T.ids.indexOf(id), n = T.L * 12;   // on 2s: 12 drawings a second
    for (let f = 0; f < n; f++) fs.writeFileSync(path.join(tmp, `f${String(f).padStart(3, '0')}.png`), Buffer.from(await frame(k * T.L + f / 12, 1280), 'base64'));
    const mp4 = path.join(out, id + '.mp4'), webp = path.join(out, id + '.webp');
    let r = spawnSync('ffmpeg', ['-y', '-hide_banner', '-loglevel', 'error', '-framerate', '12', '-i', path.join(tmp, 'f%03d.png'), '-c:v', 'libx264', '-preset', 'slow', '-crf', '30', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', '-an', mp4]);
    if (r.status) { console.error(String(r.stderr)); process.exit(1); }
    r = spawnSync('ffmpeg', ['-y', '-hide_banner', '-loglevel', 'error', '-i', path.join(tmp, `f${String(n - 1).padStart(3, '0')}.png`), '-c:v', 'libwebp', '-quality', '78', webp]);
    if (r.status) { console.error(String(r.stderr)); process.exit(1); }
    console.log(id, (fs.statSync(mp4).size / 1024).toFixed(0) + ' KB mp4', (fs.statSync(webp).size / 1024).toFixed(0) + ' KB webp');
    for (const f of fs.readdirSync(tmp)) fs.unlinkSync(path.join(tmp, f));
  }
  fs.rmSync(tmp, { recursive: true, force: true });
}
await browser.close();
