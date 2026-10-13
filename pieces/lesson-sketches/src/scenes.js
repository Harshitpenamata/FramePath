// =====================================================================
//  SCENES: one sketchbook page per lesson, 1600x900. Things draw on in order (pencil, ink, colour) with
//  at(a, d), where a, d are fractions of the draw-on (SLOW seconds); everything is settled by at(1).
//  The pencil prop follows whichever ink line is being written. Shared props are prefixed fp.
// =====================================================================
const at = (a, d = 0.18) => ev(E0 + a * SLOW, d * SLOW);
let PEN = null;   // where the pencil is this frame (the tip of the line being inked)
const penWrap = (fn) => () => { PEN = null; fn(); if (PEN) pencilTool(PEN[0], PEN[1], -0.75 + 0.06 * Math.sin(B * 1.7), 0.8); };
LESSONS.push = function (item) { return Array.prototype.push.call(this, [item[0], penWrap(item[1])]); };

// ---- drawing primitives that know their start time t (0..1)
function L(P, t, o = {}) {                              // ink, written on
  const part = o.part ?? at(t, o.d ?? 0.16);
  if (part <= 0) return;
  gline(P, { w: 4.5, ...o, part, key: o.key ?? 'L' + P[0][0] + ',' + P[0][1] });
  if (part < 1) PEN = writeEnd(o.closed ? closeP(P) : P, part);
}
function PC(P, t, o = {}) { const part = at(t, o.d ?? 0.16); if (part > 0) gpencil(P, { w: 2.6, a: 0.7, ...o, part, key: o.key ?? 'P' + P[0][0] + ',' + P[0][1] }); }
function FL(P, col, t, o = {}) { const k = at(t, 0.1); if (k > 0) gfill(P, col, { off: [4, 3], ...o, a: (o.a ?? 1) * k, key: o.key ?? 'F' + P[0][0] }); }
function SF(P, col, t, o = {}) { const part = at(t, o.d ?? 0.22); if (part > 0) scribbleFill(P, col, { gap: 10, w: 4, base: 0.35, ...o, part, key: o.key ?? 'S' + P[0][0] }); }
function HT(P, t, o = {}) { const k = at(t, 0.12); if (k <= 0) return; const b = bbox(P); ctx.save(); gclip(P); ghatch(b[0], b[1], b[2], b[3], { ang: -0.8, gap: 9, col: SK.graph, w: 1.8, a: 0.4 * k, key: 'H' + P[0][0], ...o }); ctx.restore(); }
function TX(str, x, y, size, t, o = {}) { const r = at(t, o.d ?? 0.2); if (r > 0) handLetter(str, x, y, size, { key: 'tx' + str + x + y, jit: 0.8, ...o, reveal: r }); }
function fade(t, fn) { const k = at(t, 0.1); if (k <= 0) return; ctx.save(); ctx.globalAlpha *= k; fn(); ctx.restore(); }
const box = (x, y, w, h, r = 10, over = 0.02) => sketchBox(x, y, w, h, r, over);
const circ = (x, y, r, over = 0.06) => loopPts(x, y, r, r, over);
function arrow(P, t, o = {}) { const part = at(t, 0.14); if (part > 0) arrowPencil(P, part, { key: 'ar' + P[0][0] + P[0][1], ...o }); }
function check(x, y, s, t) { const part = at(t, 0.1); if (part > 0) checkMark(x, y, s, part, SK.green, 'ck' + x + y); }
function cross(x, y, s, t) { L([[x - 26 * s, y - 26 * s], [x + 26 * s, y + 26 * s]], t, { col: SK.red, w: 6, second: false, d: 0.06 }); L([[x + 26 * s, y - 26 * s], [x - 26 * s, y + 26 * s]], t + 0.06, { col: SK.red, w: 6, second: false, d: 0.06 }); }
function hero(x, y, r, t, o = {}) {                    // the hero arrives with a little hop
  const k = at(t, 0.12); if (k <= 0) return;
  const hop = Math.sin(Math.PI * k) * 0.12;
  ctx.save(); ctx.globalAlpha *= Math.min(1, k * 2);
  doodleHero(x, y - hop * r, r, { key: 'hero' + x, legs: true, mood: 'happy', ...o, sy: 1 + hop, sx: 1 - hop / 2 });
  ctx.restore();
}
function person(x, y, s, t, o = {}) {                  // a graphite stick person (not the hero)
  PC(circ(x, y - 70 * s, 22 * s), t, { closed: true, w: 3 });
  PC([[x, y - 48 * s], [x, y + 10 * s]], t + 0.05, { w: 3 });
  PC([[x - 26 * s, y - 20 * s], [x, y - 34 * s], [x + 26 * s, y - 20 * s + (o.wave ? -26 * s : 0)]], t + 0.08, { w: 3 });
  PC([[x - 18 * s, y + 52 * s], [x, y + 10 * s], [x + 18 * s, y + 52 * s]], t + 0.1, { w: 3 });
}
function ground(x0, x1, y, t = 0) { PC([[x0, y], [(x0 + x1) / 2, y - 4], [x1, y + 2]], t, { w: 2.4, a: 0.55, key: 'gr' + x0 + y }); }
function label(str, x, y, t, o = {}) { TX(str, x, y, o.size ?? 36, t, { col: o.col ?? SK.ink, face: o.face ?? 'hand', align: o.align ?? 'center' }); }

// ---- page furniture: a marker tag top left and a hand-lettered caption with one highlighted word
function fpPage(tag, lines, hi) {
  sketchPage({ grid: 'dots' });
  const f = () => {
    const size = 50, w = letterW(tag, size, 'marker'), x = 70, y = 150;
    tapeStrip(x + w / 2, y - size * 0.3, w + 56, -0.03, 'tagtape' + tag, size * 1.15);
    const [x0, x1] = handLetter(tag, x, y, size, { face: 'marker', align: 'left', reveal: at(0.02, 0.12), key: 'tag' + tag, jit: 0.7 });
    underline(x0, x1, y + 16, { col: SK.red, w: 4, key: 'tagu' + tag, part: at(0.14, 0.08) });
    const cs = 60, y0 = lines.length > 1 ? 760 : 800;
    lines.forEach((line, li) => {
      const yy = y0 + li * cs * 1.12, xs = glyphX(line, skFont(cs, 'hand')), cx0 = CX - xs[xs.length - 1] / 2;
      for (const [hl, word] of hi) if (hl === li) { const i = line.indexOf(word); if (i >= 0) highlight(cx0 + xs[i] - 4, cx0 + xs[i + word.length] + 4, yy - cs * 0.28, cs * 0.55, at(0.88, 0.1), { key: 'caph' + li + line }); }
      handLetter(line, CX, yy, cs, { reveal: at(0.62 + li * 0.08, 0.22), key: 'cap' + li + line });
    });
  };
  if (DEFER) DEFER.push(f); else f();
}

// ---- props: (x, y) is the centre unless noted; s = scale; t = start time
function fpBulb(x, y, r, t) {
  const P = [], a0 = Math.PI / 2 - 0.6, a1 = Math.PI / 2 + 0.6 - TAU;
  for (let i = 0; i <= 36; i++) { const a = lerp(a0, a1, i / 36); P.push([x + Math.cos(a) * r, y + Math.sin(a) * r]); }
  P.push([x - 0.36 * r, y + 1.12 * r], [x - 0.34 * r, y + 1.42 * r], [x + 0.34 * r, y + 1.42 * r], [x + 0.36 * r, y + 1.12 * r]);
  SF(P, SK.hilite, t + 0.2);
  L(P, t, { closed: true, d: 0.2 });
  for (let i = 0; i < 2; i++) L([[x - 0.36 * r, y + (1.22 + i * 0.12) * r], [x + 0.36 * r, y + (1.2 + i * 0.12) * r]], t + 0.18, { w: 3, second: false, d: 0.05 });
}
function fpCamera(x, y, s, t, o = {}) {
  const body = box(x - 90 * s, y - 55 * s, 150 * s, 110 * s, 14 * s);
  const hood = [[x + 60 * s, y - 30 * s], [x + 110 * s, y - 52 * s], [x + 110 * s, y + 52 * s], [x + 60 * s, y + 30 * s]];
  FL(body, SK.sheet, t + 0.1, { off: [0, 0] }); HT(body, t + 0.2);
  L(body, t, { closed: true, d: 0.18 }); L(closeP(hood), t + 0.12, { d: 0.1 });
  for (const cx of [x - 50 * s, x + 6 * s]) L(circ(cx, y - 82 * s, 26 * s), t + 0.16, { w: 3.5, d: 0.08 });
  if (o.rec !== false) fade(t + 0.26, () => { ctx.fillStyle = SK.red; ctx.beginPath(); ctx.arc(x - 66 * s, y - 32 * s, 7 * s, 0, TAU); ctx.fill(); });
}
function fpPhone(x, y, s, t, o = {}) {                 // o.wide: landscape; o.screen(x0, y0, w, h): what's on it
  const w = (o.wide ? 170 : 90) * s, h = (o.wide ? 96 : 160) * s, P = box(x - w / 2, y - h / 2, w, h, 14 * s);
  FL(P, SK.sheet, t + 0.08);
  L(P, t, { closed: true, d: 0.16 });
  if (o.screen) fade(t + 0.18, () => o.screen(x - w / 2 + 10 * s, y - h / 2 + 12 * s, w - 20 * s, h - 24 * s));
  else L(closeP([[x - 12 * s, y - 20 * s], [x + 20 * s, y], [x - 12 * s, y + 20 * s]]), t + 0.15, { w: 3.5, second: false, d: 0.06 });
}
function fpLaptop(x, y, s, t) {                         // returns the screen rectangle [x0, y0, w, h]
  const w = 320 * s, h = 200 * s, scr = box(x - w / 2, y - h, w, h, 10 * s);
  FL(scr, SK.sheet, t + 0.08); L(scr, t, { closed: true, d: 0.16 });
  L([[x - w / 2 - 30 * s, y + 6 * s], [x + w / 2 + 30 * s, y + 6 * s], [x + w / 2 + 14 * s, y + 24 * s], [x - w / 2 - 14 * s, y + 24 * s], [x - w / 2 - 30 * s, y + 6 * s]], t + 0.12, { d: 0.1 });
  return [x - w / 2 + 14 * s, y - h + 14 * s, w - 28 * s, h - 28 * s];
}
function fpFrame(x, y, w, h, t, o = {}) {              // a viewfinder: a card with corner marks; o.grid adds thirds
  const P = box(x - w / 2, y - h / 2, w, h, 8);
  FL(P, o.fill ?? SK.sheet, t + 0.06, { off: [5, 4] }); L(P, t, { closed: true, d: 0.14, w: 4 });
  if (o.grid) for (const k of [1 / 3, 2 / 3]) { PC([[x - w / 2 + w * k, y - h / 2 + 6], [x - w / 2 + w * k, y + h / 2 - 6]], t + 0.12, { w: 2, a: 0.6 }); PC([[x - w / 2 + 6, y - h / 2 + h * k], [x + w / 2 - 6, y - h / 2 + h * k]], t + 0.14, { w: 2, a: 0.6 }); }
  if (o.label) label(o.label, x, y + h / 2 + 46, t + 0.18, { size: o.size ?? 34 });
}
function fpStrip(x, y, s, t, n = 3, o = {}) {           // a timeline of n clips; o.cut marks a cut line, o.icons draws in each
  const cw = 64 * s, gap = 8 * s, x0 = x - (n * cw + (n - 1) * gap) / 2;
  for (let i = 0; i < n; i++) {
    const bx = x0 + i * (cw + gap), P = box(bx, y - 28 * s, cw, 56 * s, 6 * s, 0);
    FL(P, o.fills?.[i] ?? (i % 2 ? SK.sheet : '#efe3c8'), t + 0.05 + i * 0.04, { off: [3, 3] });
    L(P, t + i * 0.04, { closed: true, w: 3.5, d: 0.08 });
    if (o.icons?.[i]) fade(t + 0.12 + i * 0.04, () => o.icons[i](bx + cw / 2, y));
  }
  if (o.cut) { ctx.save(); ctx.setLineDash([8, 8]); PC([[x, y - 52 * s], [x, y + 52 * s]], t + 0.2, { w: 2.5, a: 0.8 }); ctx.restore(); }
  return { x0, cw, gap };
}
function fpMic(x, y, s, t, o = {}) {                    // stick at (x, y), head up; o.ang tilts it
  const col = o.col ?? SK.ink;
  ctx.save(); ctx.translate(x, y); ctx.rotate(o.ang ?? 0); ctx.globalAlpha *= o.a ?? 1;
  const head = circ(0, -78 * s, 28 * s, 0.06);
  FL(head, '#d8d2c6', t + 0.08, { off: [2, 2] }); HT(head, t + 0.1, { ang: 0.8, gap: 7, a: 0.7 });
  L(head, t, { closed: true, w: 3.5, col, d: 0.1 });
  L(closeP([[-12 * s, -50 * s], [12 * s, -50 * s], [7 * s, 20 * s], [-7 * s, 20 * s]]), t + 0.08, { w: 3.5, col, second: false, d: 0.08 });
  ctx.restore();
}
function fpWaves(x, y, n, r0, gap, t, o = {}) {
  for (let i = 0; i < n; i++) {
    const P = arcPts(x, y, r0 + i * gap, -0.55, 0.55, 10);
    if (o.faint) PC(P, t + i * 0.04, { w: 2.4, a: 0.55 - i * 0.12, amp: 2.2 });
    else L(P, t + i * 0.05, { w: 4.5 - i * 0.6, second: false, d: 0.08 });
  }
}
function fpWave(x, y, w, amp, t, o = {}) {              // a waveform from x to x + w; o.quiet = [[a, b], ...] flat parts (0..1)
  const P = [], n = Math.round(w / 9);
  for (let i = 0; i <= n; i++) { const u = i / n, q = (o.quiet || []).some(([a, b]) => u >= a && u <= b); const R = RNG('wv', x, y, i); P.push([x + u * w, y + (i % 2 ? -1 : 1) * (q ? 2 : amp * (0.35 + 0.65 * R.f()))]); }
  L(P, t, { w: o.w ?? 3, second: false, col: o.col ?? SK.ink, d: 0.2, amp: 0.4 });
}
function fpDial(x, y, r, name, value, t) {
  FL(circ(x, y, r, 0), SK.sheet, t + 0.06, { off: [3, 3] }); L(circ(x, y, r), t, { closed: true, d: 0.1 });
  for (let i = 0; i < 9; i++) { const a = -Math.PI * 1.15 + i * Math.PI * 1.3 / 8; L([[x + Math.cos(a) * r * 0.72, y + Math.sin(a) * r * 0.72], [x + Math.cos(a) * r * 0.88, y + Math.sin(a) * r * 0.88]], t + 0.1, { w: 2.4, second: false, amp: 0.3, d: 0.03 }); }
  L([[x, y], [x + Math.cos(-0.95) * r * 0.62, y + Math.sin(-0.95) * r * 0.62]], t + 0.14, { w: 5, second: false, d: 0.04 });
  label(name, x, y + r + 40, t + 0.16, { size: 32, col: SK.graph });
  label(value, x, y + r + 78, t + 0.2, { size: 38, face: 'marker' });
}
function fpSun(x, y, r, t) {
  for (let i = 0; i < 12; i++) { const a = i / 12 * TAU, r1 = r * (1.5 + 0.1 * ((B + i) % 2)); L([[x + Math.cos(a) * r * 1.22, y + Math.sin(a) * r * 1.22], [x + Math.cos(a) * r1, y + Math.sin(a) * r1]], t + 0.2 + i * 0.01, { w: 4, second: false, amp: 0.8, step: 8, d: 0.04 }); }
  SF(loopPts(x, y, r, r, 0, 0, 48), SK.hilite, t + 0.12); L(circ(x, y, r), t, { closed: true, d: 0.12 });
}
function fpCup(x, y, s, t, o = {}) {                    // a mug with steam
  const P = [[x - 50 * s, y - 50 * s], [x + 50 * s, y - 50 * s], [x + 42 * s, y + 50 * s], [x - 42 * s, y + 50 * s]];
  FL(P, o.col ?? '#c9d7e6', t + 0.08, { off: [3, 3] }); HT(P, t + 0.12);
  L(closeP(P), t, { d: 0.12 }); L(arcPts(x + 52 * s, y - 2 * s, 26 * s, -1.4, 1.4, 10), t + 0.1, { d: 0.06 });
  if (o.steam !== false) for (let i = 0; i < 3; i++) { const sm = []; for (let k = 0; k <= 8; k++) sm.push([x + (i - 1) * 24 * s + Math.sin(k * 0.9 - TT * 4 + i) * 7 * s, y - 64 * s - k * 9 * s]); PC(sm, t + 0.16 + i * 0.03, { w: 2.4, a: 0.6 }); }
}
function fpWindow(x, y, w, h, t, o = {}) {
  const P = box(x - w / 2, y - h / 2, w, h, 4);
  FL(P, o.fill ?? '#dfeaf0', t + 0.06, { off: [0, 0] }); L(P, t, { closed: true, d: 0.12 });
  L([[x, y - h / 2], [x, y + h / 2]], t + 0.1, { w: 3.5, d: 0.05 }); L([[x - w / 2, y], [x + w / 2, y]], t + 0.12, { w: 3.5, d: 0.05 });
  if (o.curtain) PC([[x - w / 2 - 16, y - h / 2 - 10], [x - w / 2 - 6, y], [x - w / 2 - 18, y + h / 2 + 10]], t + 0.14, { w: 3 });
}
function fpFolder(x, y, s, name, t, o = {}) {
  const P = [[x - 70 * s, y - 40 * s], [x - 30 * s, y - 40 * s], [x - 20 * s, y - 52 * s], [x + 10 * s, y - 52 * s], [x + 18 * s, y - 40 * s], [x + 70 * s, y - 40 * s], [x + 70 * s, y + 46 * s], [x - 70 * s, y + 46 * s]];
  FL(P, o.col ?? SK.wood, t + 0.08, { a: 0.85 }); L(closeP(P), t, { d: 0.12 });
  if (name) label(name, x, y + 96 * s, t + 0.12, { size: 32 * Math.max(0.9, s) });
}
function fpClock(x, y, r, t, o = {}) {
  FL(circ(x, y, r, 0), SK.sheet, t + 0.05); L(circ(x, y, r), t, { closed: true, d: 0.1 });
  L([[x, y], [x, y - r * 0.7]], t + 0.1, { w: 5, second: false, d: 0.04 }); L([[x, y], [x + r * 0.5, y + r * 0.1]], t + 0.12, { w: 5, second: false, d: 0.04 });
  if (o.text) label(o.text, x, y + r + 46, t + 0.14, { size: 36, face: 'marker' });
}
function fpCloud(x, y, s, t) {
  const P = [[x - 90 * s, y + 20 * s], ...arcPts(x - 50 * s, y, 40 * s, Math.PI, TAU * 0.86, 8), ...arcPts(x + 10 * s, y - 20 * s, 50 * s, Math.PI * 1.1, TAU * 0.98, 9), ...arcPts(x + 70 * s, y + 4 * s, 34 * s, Math.PI * 1.3, TAU * 1.1, 7), [x + 104 * s, y + 20 * s]];
  FL(closeP(P), SK.sheet, t + 0.08, { off: [0, 0] }); L(closeP(P), t, { d: 0.14 });
}
function fpBattery(x, y, s, t, level = 1) {
  const P = box(x - 70 * s, y - 34 * s, 140 * s, 68 * s, 10 * s);
  const fill = [[x - 62 * s, y - 26 * s], [x - 62 * s + 124 * s * level, y - 26 * s], [x - 62 * s + 124 * s * level, y + 26 * s], [x - 62 * s, y + 26 * s]];
  SF(fill, SK.green, t + 0.14); L(P, t, { closed: true, d: 0.1 }); L(box(x + 70 * s, y - 14 * s, 12 * s, 28 * s, 3 * s), t + 0.1, { closed: true, w: 3.5, d: 0.04 });
}
function fpCard(x, y, s, t) {                           // a memory card
  const P = [[x - 34 * s, y - 46 * s], [x + 18 * s, y - 46 * s], [x + 34 * s, y - 30 * s], [x + 34 * s, y + 46 * s], [x - 34 * s, y + 46 * s]];
  FL(P, '#3b5c8c', t + 0.08, { a: 0.85 }); L(closeP(P), t, { d: 0.1 });
  for (let i = 0; i < 4; i++) L([[x - 22 * s + i * 12 * s, y - 40 * s], [x - 22 * s + i * 12 * s, y - 24 * s]], t + 0.1, { w: 3, col: SK.wood, second: false, d: 0.03 });
}
function fpDrive(x, y, s, t) { const P = box(x - 60 * s, y - 40 * s, 120 * s, 80 * s, 14 * s); FL(P, '#d8d2c6', t + 0.08); HT(P, t + 0.1); L(P, t, { closed: true, d: 0.1 }); fade(t + 0.12, () => { ctx.fillStyle = SK.green; ctx.beginPath(); ctx.arc(x + 38 * s, y + 22 * s, 6 * s, 0, TAU); ctx.fill(); }); }
function fpSpeech(x, y, w, h, text, t, o = {}) {        // a speech bubble with its tail at bottom left (o.tail: 'right')
  const P = box(x - w / 2, y - h / 2, w, h, 26), tx = o.tail === 'right' ? x + w * 0.25 : x - w * 0.25;
  FL(P, SK.sheet, t + 0.06); L(P, t, { closed: true, d: 0.12 });
  L([[tx - 16, y + h / 2 - 2], [tx + (o.tail === 'right' ? 34 : -34), y + h / 2 + 40], [tx + 18, y + h / 2 - 2]], t + 0.1, { d: 0.05 });
  if (text) label(text, x, y + 12, t + 0.14, { size: o.size ?? 34 });
}
function fpMeter(x, y, w, level, t, o = {}) {           // a horizontal level meter; the good zone is shaded green
  const h = 40, P = box(x, y - h / 2, w, h, 8);
  FL([[x + w * 0.62, y - h / 2 + 4], [x + w * 0.8, y - h / 2 + 4], [x + w * 0.8, y + h / 2 - 4], [x + w * 0.62, y + h / 2 - 4]], '#b8dcae', t + 0.08, { off: [0, 0] });
  FL([[x + w * 0.88, y - h / 2 + 4], [x + w - 4, y - h / 2 + 4], [x + w - 4, y + h / 2 - 4], [x + w * 0.88, y + h / 2 - 4]], '#f3b6ad', t + 0.08, { off: [0, 0] });
  SF([[x + 6, y - 10], [x + w * level, y - 10], [x + w * level, y + 10], [x + 6, y + 10]], o.col ?? SK.ink, t + 0.16, { gap: 6, w: 4 });
  L(P, t, { closed: true, d: 0.12 });
  if (o.name) label(o.name, x - 16, y + 12, t + 0.1, { size: 34, align: 'right' });
}
function fpSlider(x, y, w, name, v, t) {
  L([[x, y], [x + w, y]], t, { w: 4, second: false, d: 0.1 });
  fade(t + 0.1, () => { gfill(circ(x + w * v, y, 16, 0), SK.sheet, { off: [0, 0], key: 'sl' + x + y }); gline(circ(x + w * v, y, 16), { w: 4, key: 'slo' + x + y }); });
  label(name, x - 20, y + 12, t + 0.08, { size: 34, align: 'right' });
}
function fpMagnifier(x, y, r, t) { FL(circ(x, y, r, 0), '#dfeaf0', t + 0.08, { a: 0.6, off: [0, 0] }); L(circ(x, y, r), t, { closed: true, w: 6, d: 0.1 }); L([[x + r * 0.7, y + r * 0.7], [x + r * 1.6, y + r * 1.6]], t + 0.1, { w: 10, second: false, d: 0.05 }); }
function fpNote(x, y, s, t) {                           // a music note
  fade(t + 0.06, () => { ctx.fillStyle = SK.ink; ctx.beginPath(); ctx.ellipse(x, y, 16 * s, 12 * s, -0.4, 0, TAU); ctx.fill(); ctx.beginPath(); ctx.ellipse(x + 50 * s, y - 10 * s, 16 * s, 12 * s, -0.4, 0, TAU); ctx.fill(); });
  L([[x + 14 * s, y - 4 * s], [x + 14 * s, y - 80 * s], [x + 64 * s, y - 90 * s], [x + 64 * s, y - 14 * s]], t, { w: 4.5, second: false, d: 0.08 });
}
function fpCard3(x, y, w, h, t, o = {}) {               // an index card with a title
  const P = box(x - w / 2, y - h / 2, w, h, 8);
  FL(P, '#fffaf0', t + 0.05, { off: [5, 5] }); L(P, t, { closed: true, d: 0.12 });
  if (o.bar) FL([[x - w / 2, y - h / 2], [x - w / 2 + 12, y - h / 2], [x - w / 2 + 12, y + h / 2], [x - w / 2, y + h / 2]], o.bar, t + 0.08, { off: [0, 0] });
  if (o.title) label(o.title, x, y - h / 2 + 46, t + 0.1, { size: o.size ?? 34, face: 'marker' });
  if (o.lines) for (let i = 0; i < o.lines; i++) PC([[x - w / 2 + 30, y - h / 2 + 80 + i * 26], [x + w / 2 - 30 - (i % 2) * 40, y - h / 2 + 80 + i * 26]], t + 0.12 + i * 0.02, { w: 2.4 });
}
function fpPadlock(x, y, s, t) { const P = box(x - 34 * s, y - 20 * s, 68 * s, 56 * s, 8 * s); FL(P, SK.yellow, t + 0.08, { a: 0.9 }); L(P, t, { closed: true, d: 0.08 }); L(arcPts(x, y - 20 * s, 22 * s, Math.PI, TAU, 10), t + 0.06, { w: 5, second: false, d: 0.05 }); }
function fpLamp(x, y, t) { L([[x, 170], [x, y - 40]], t, { w: 3, second: false, d: 0.08 }); const P = [[x - 46, y], [x - 20, y - 40], [x + 20, y - 40], [x + 46, y]]; FL(P, SK.sheet, t + 0.06); L(closeP(P), t + 0.04, { d: 0.08 }); SF(loopPts(x, y + 8, 18, 18, 0), SK.hilite, t + 0.1); }
function fpScissors(x, y, s, t, ang = 0) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(ang);
  L(circ(-40 * s, -18 * s, 16 * s), t, { closed: true, w: 4, d: 0.06 }); L(circ(-40 * s, 18 * s, 16 * s), t + 0.04, { closed: true, w: 4, d: 0.06 });
  L([[-26 * s, -10 * s], [50 * s, 12 * s]], t + 0.08, { w: 4, second: false, d: 0.05 }); L([[-26 * s, 10 * s], [50 * s, -12 * s]], t + 0.1, { w: 4, second: false, d: 0.05 });
  ctx.restore();
}
function fpLoaf(x, y, s, t) { const P = [[x - 80 * s, y + 30 * s], ...arcPts(x, y + 10 * s, 84 * s, Math.PI * 1.05, TAU * 0.98, 16), [x + 80 * s, y + 30 * s]]; FL(closeP(P), SK.wood, t + 0.08); HT(closeP(P), t + 0.12, { a: 0.5 }); L(closeP(P), t, { d: 0.12 }); for (let i = 0; i < 3; i++) L([[x - 40 * s + i * 34 * s, y - 40 * s], [x - 26 * s + i * 34 * s, y - 20 * s]], t + 0.1, { w: 3.5, second: false, d: 0.03 }); }
function fpFile(x, y, s, name, t) {
  const P = [[x - 40 * s, y - 52 * s], [x + 20 * s, y - 52 * s], [x + 40 * s, y - 32 * s], [x + 40 * s, y + 52 * s], [x - 40 * s, y + 52 * s]];
  FL(P, SK.sheet, t + 0.06, { off: [4, 4] }); L(closeP(P), t, { d: 0.1 });
  if (name) label(name, x, y + 52 * s + 46, t + 0.1, { size: 30 });
}
function fpHeart(x, y, t) { fade(t, () => { ctx.fillStyle = SK.red; ctx.beginPath(); ctx.moveTo(x, y + 30); ctx.bezierCurveTo(x - 50, y - 5, x - 20, y - 40, x, y - 12); ctx.bezierCurveTo(x + 20, y - 40, x + 50, y - 5, x, y + 30); ctx.fill(); }); }

function fpSoftbox(x, y, s, t) {                         // a softbox on a stand, facing left
  const P = [[x - 70 * s, y - 60 * s], [x + 30 * s, y - 40 * s], [x + 30 * s, y + 40 * s], [x - 70 * s, y + 60 * s]];
  FL(P, SK.sheet, t + 0.06, { off: [3, 3] }); L(closeP(P), t, { d: 0.1 });
  L([[x + 30 * s, y], [x + 50 * s, y], [x + 50 * s, y + 200 * s]], t + 0.08, { w: 3.5, second: false, d: 0.06 });
  L([[x + 20 * s, y + 230 * s], [x + 50 * s, y + 200 * s], [x + 80 * s, y + 230 * s]], t + 0.12, { w: 3.5, second: false, d: 0.04 });
}
function fpClapper(x, y, s, t) {
  const P = box(x - 80 * s, y - 30 * s, 160 * s, 90 * s, 6 * s, 0); FL(P, SK.sheet, t + 0.06); L(P, t, { closed: true, d: 0.1 });
  const top = [[x - 80 * s, y - 34 * s], [x + 80 * s, y - 70 * s], [x + 84 * s, y - 50 * s], [x - 76 * s, y - 14 * s]]; FL(top, SK.ink, t + 0.1, { a: 0.9 }); L(closeP(top), t + 0.08, { d: 0.06 });
  for (let i = 0; i < 4; i++) L([[x - 50 * s + i * 40 * s, y - 40 * s - i * 9 * s], [x - 34 * s + i * 40 * s, y - 22 * s - i * 9 * s]], t + 0.14, { w: 4, col: SK.sheet, second: false, d: 0.03 });
}
function fpCalendar(x, y, s, t, mark = 2) {
  const P = box(x - 90 * s, y - 70 * s, 180 * s, 150 * s, 8 * s); FL(P, SK.sheet, t + 0.05); L(P, t, { closed: true, d: 0.1 });
  FL([[x - 90 * s, y - 70 * s], [x + 90 * s, y - 70 * s], [x + 90 * s, y - 36 * s], [x - 90 * s, y - 36 * s]], SK.red, t + 0.08, { a: 0.85, off: [0, 0] });
  for (let r = 0; r < 3; r++) for (let c = 0; c < 4; c++) PC(box(x - 76 * s + c * 40 * s, y - 24 * s + r * 32 * s, 28 * s, 22 * s, 3, 0), t + 0.1 + (r * 4 + c) * 0.005, { closed: true, w: 2 });
  if (mark >= 0) PC(circ(x - 62 * s + (mark % 4) * 40 * s, y - 13 * s + Math.floor(mark / 4) * 32 * s, 20 * s), t + 0.2, { closed: true, col: SK.red, w: 3, a: 1 });
}
function fpScope(x, y, w, h, t, kind = 'wave') {        // a waveform or vectorscope panel
  const P = box(x - w / 2, y - h / 2, w, h, 8); FL(P, '#2a2420', t + 0.04, { off: [4, 4], a: 0.92 }); L(P, t, { closed: true, d: 0.1 });
  fade(t + 0.12, () => {
    ctx.save(); ctx.fillStyle = '#9ad08a';
    const R = RNG('scope', x, y);
    if (kind === 'wave') for (let i = 0; i < 700; i++) { const u = R.f(), base = 0.25 + 0.5 * Math.abs(Math.sin(u * 7)); ctx.globalAlpha = 0.6; ctx.fillRect(x - w / 2 + 10 + u * (w - 20), y + h / 2 - 12 - (base + R.n(0.08)) * (h - 24), 2, 2); }
    else { ctx.strokeStyle = 'rgba(154,208,138,0.5)'; ctx.beginPath(); ctx.arc(x, y, h * 0.4, 0, TAU); ctx.stroke(); ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - h * 0.22, y - h * 0.33); ctx.stroke(); for (let i = 0; i < 400; i++) { const a = -2.2 + R.n(0.25), r = Math.abs(R.n(h * 0.22)); ctx.globalAlpha = 0.6; ctx.fillRect(x + Math.cos(a) * r, y + Math.sin(a) * r, 2, 2); } }
    ctx.restore();
  });
}
function fpRecorder(x, y, s, t) { const P = box(x - 50 * s, y - 70 * s, 100 * s, 140 * s, 12 * s); FL(P, '#d8d2c6', t + 0.06); HT(P, t + 0.1); L(P, t, { closed: true, d: 0.1 }); L(box(x - 34 * s, y - 54 * s, 68 * s, 40 * s, 4 * s), t + 0.1, { closed: true, w: 3, d: 0.04 }); for (const dx of [-20, 20]) L(circ(x + dx * s, y + 20 * s, 12 * s), t + 0.12, { closed: true, w: 3, d: 0.04 }); }
function fpList(x, y, w, title, items, t = 0.02, o = {}) {      // a card with a title and ticked lines; t may be left out
  if (typeof t === 'object') { o = t; t = 0.02; }
  const h = 110 + items.length * 56; fpCard3(x, y + h / 2 - 50, w, h, t, { bar: o.bar ?? SK.terra, title });
  items.forEach((n, i) => { label(n, x - w / 2 + 34, y + 70 + i * 56, t + 0.12 + i * 0.05, { size: 32, align: 'left', col: o.cross?.includes(i) ? SK.graph : SK.ink }); if (o.cross?.includes(i)) cross(x + w / 2 - 40, y + 60 + i * 56, 0.45, t + 0.3 + i * 0.04); else if (o.check !== false) check(x + w / 2 - 40, y + 60 + i * 56, 0.42, t + 0.3 + i * 0.04); });
}
function fpCoins(x, y, s, t) { for (let i = 0; i < 4; i++) { const yy = y - i * 16 * s; FL(loopPts(x, yy, 50 * s, 14 * s, 0), SK.yellow, t + 0.04 + i * 0.03, { off: [0, 0] }); L(loopPts(x, yy, 50 * s, 14 * s, 0.05), t + i * 0.03, { closed: true, w: 3, d: 0.04 }); } }
function fpTrack(x, y, w, name, t, o = {}) { L(box(x, y - 40, w, 80, 8), t, { closed: true, w: 3.5, d: 0.1 }); label(name, x - 20, y + 12, t + 0.04, { size: 32, face: 'marker', align: 'right' }); fpWave(x + 20, y, w - 40, o.amp ?? 28, t + 0.08, o); }
function fpHeadphones(x, y, r, t) { L(arcPts(x, y, r * 1.25, Math.PI * 1.05, TAU * 0.95, 20), t, { w: 8, second: false, d: 0.08 }); for (const s of [-1, 1]) { const P = box(x + s * r * 1.25 - 20, y - 30, 40, 70, 12); FL(P, SK.ink, t + 0.06); L(P, t + 0.04, { closed: true, d: 0.04 }); } }

// =====================================================================
//  B01: How videos tell a story
// =====================================================================
lesson('B01-1', () => {   // The steps of making a video
  fpPage('lesson 1', ['every video takes five steps'], [[0, 'five steps']]);
  const xs = [230, 520, 810, 1100, 1390], y = 400;
  fpBulb(xs[0], y - 40, 62, 0.02);
  fpCard3(xs[1], y, 150, 110, 0.12, { bar: SK.graph, lines: 2 });
  fpCamera(xs[2] - 10, y + 10, 0.85, 0.22);
  fpStrip(xs[3], y, 1, 0.32, 3, { cut: true });
  fpPhone(xs[4], y, 1, 0.42);
  for (let i = 0; i < 4; i++) arrow([[xs[i] + 80, y - 10], [(xs[i] + xs[i + 1]) / 2, y - 46], [xs[i + 1] - 85, y - 10]], 0.12 + i * 0.1);
  ['idea', 'plan', 'film', 'edit', 'share'].forEach((n, i) => label(n, xs[i], y + 150, 0.1 + i * 0.1));
  ground(120, 1480, 700, 0.5); hero(xs[2] - 10, 630, 46, 0.52, { look: [0.6, -0.4], step: 0.6, arms: [-0.6, 1.1] });
});
lesson('B01-2', () => {   // Shots, scenes and sequences
  fpPage('lesson 2', ['shots make a scene'], [[0, 'scene']]);
  L(box(140, 210, 1320, 490, 26), 0.02, { closed: true, w: 3.5, d: 0.2 }); label('scene: one place, one time', 800, 262, 0.1, { col: SK.graph });
  L(box(230, 320, 1140, 300, 18), 0.18, { closed: true, w: 3.5, d: 0.16 }); label('sequence: one action', 800, 664, 0.28, { col: SK.graph, size: 32 });
  [430, 800, 1170].forEach((x, i) => { fpFrame(x, 460, 280, 190, 0.3 + i * 0.1); fpCup(x, 480, 0.8, 0.36 + i * 0.1, { steam: i > 0 }); label('shot ' + (i + 1), x, 592, 0.4 + i * 0.1, { size: 28, col: SK.graph }); });
});
lesson('B01-3', () => {   // Who will watch your video
  fpPage('lesson 3', ['make it for your viewer'], [[0, 'viewer']]);
  ground(160, 640, 568, 0.02); hero(330, 470, 70, 0.04, { look: [1, 0], arms: [-0.4, 0.5] }); fpCamera(470, 420, 0.7, 0.1);
  arrow([[600, 420], [760, 380], [920, 430]], 0.3);
  fpPhone(1080, 420, 1.3, 0.38, { wide: true });
  [[960, 620], [1080, 640], [1200, 620]].forEach(([x, y], i) => { PC(circ(x, y, 34), 0.5 + i * 0.05, { closed: true, w: 3 }); PC(arcPts(x, y + 6, 14, 0.3, Math.PI - 0.3, 6), 0.56 + i * 0.05, { w: 3 }); });
  label('who? what should they feel?', 1080, 280, 0.5, { size: 34, col: SK.graph });
});
lesson('B01-4', () => {   // How pictures and sound work together
  fpPage('lesson 4', ['picture + sound = feeling'], [[0, 'feeling']]);
  fpFrame(520, 430, 460, 300, 0.02); fpCup(520, 470, 1.1, 0.12);
  label('+', 840, 460, 0.3, { size: 90, face: 'marker' });
  fpWaves(960, 420, 3, 40, 30, 0.36); fpNote(1120, 470, 1.1, 0.42);
  label('birds, pages, a kettle', 1140, 610, 0.5, { size: 34, col: SK.graph });
  fpHeart(1300, 300, 0.56);
});

// =====================================================================
//  B02: Turn an idea into a simple plan
// =====================================================================
lesson('B02-1', () => {   // Pick one main message
  fpPage('lesson 1', ['pick one main message'], [[0, 'one']]);
  fpCard3(560, 440, 440, 300, 0.02, { bar: SK.terra, title: 'my message' });
  label('slow bread is worth it', 560, 480, 0.18, { size: 40 });
  [['food', 1040, 300], ['my kitchen', 1230, 420], ['holidays', 1060, 560]].forEach(([w, x, y], i) => { label(w, x, y, 0.36 + i * 0.06, { col: SK.graph, size: 40 }); L([[x - 90, y - 12], [x + 90, y - 18]], 0.5 + i * 0.05, { col: SK.red, w: 4, second: false, d: 0.06 }); });
  hero(840, 640, 40, 0.5, { look: [-1, -0.5], arms: [1.2, null] });
});
lesson('B02-2', () => {   // Know who will watch
  fpPage('lesson 2', ['plan for their screen'], [[0, 'screen']]);
  fpWindow(400, 400, 380, 240, 0.02); label('on the bus', 400, 580, 0.14, { col: SK.graph });
  fpPhone(820, 440, 1.6, 0.2, { screen: (x, y, w, h) => { gline(box(x + 6, y + h - 46, w - 12, 30, 6), { w: 2.5, key: 'capb' }); gline(circ(x + w / 2, y + h * 0.4, 30), { w: 3, key: 'face' }); } });
  [['short', 330], ['vertical', 430], ['captions', 530]].forEach(([n, y], i) => { label(n, 1100, y, 0.4 + i * 0.08, { face: 'marker', size: 44, align: 'left' }); check(1340, y - 10, 0.7, 0.44 + i * 0.08); });
});
lesson('B02-3', () => {   // A clear start, middle and end
  fpPage('lesson 3', ['a start, a middle, an end'], [[0, 'middle']]);
  const xs = [330, 800, 1270];
  xs.forEach((x, i) => fpFrame(x, 420, 340, 230, 0.02 + i * 0.12, { label: ['start', 'middle', 'end'][i], size: 40 }));
  PC(arcPts(330, 430, 80, 0.15, Math.PI - 0.15, 12), 0.1, { w: 3.5 }); PC([[250, 445], [410, 445]], 0.12, { w: 3 }); label('empty bowl', 330, 360, 0.14, { size: 28, col: SK.graph });
  hero(800, 410, 50, 0.24, { arms: [-0.3, -0.3] }); label('knead', 900, 350, 0.3, { size: 28, col: SK.graph });
  fpLoaf(1270, 440, 1, 0.36);
  arrow([[510, 420], [620, 420]], 0.2); arrow([[980, 420], [1090, 420]], 0.34);
});
lesson('B02-4', () => {   // Main shots and extra shots
  fpPage('lesson 4', ['main shots first, extras after'], [[0, 'extras']]);
  fpFrame(560, 420, 560, 340, 0.02, { label: 'main: tells the story', size: 36 });
  hero(560, 400, 80, 0.12, { arms: [-0.3, 0.6] });
  fpFrame(1150, 320, 280, 170, 0.3); fpClock(1150, 320, 54, 0.36);
  fpFrame(1150, 540, 280, 170, 0.42, { label: 'extras: add detail', size: 32 }); fpCup(1150, 560, 0.6, 0.48);
});
lesson('B02-5', () => {   // Simple scripts and interview questions
  fpPage('lesson 5', ['ask open questions'], [[0, 'open']]);
  ground(200, 1500, 640, 0.02); hero(330, 540, 70, 0.04, { look: [1, -0.4], arms: [-0.5, 0.5] });
  fpSpeech(720, 300, 480, 120, 'Do you like baking?', 0.12); cross(990, 260, 0.8, 0.26); label('yes / no', 720, 400, 0.3, { size: 30, col: SK.graph });
  fpSpeech(800, 500, 620, 120, 'Tell me about your first loaf.', 0.32); check(1140, 460, 0.9, 0.46);
  person(1360, 580, 1.1, 0.5);
});

// =====================================================================
//  B03: Get ready for a shoot
// =====================================================================
lesson('B03-1', () => {   // Shot lists
  fpPage('lesson 1', ['write down every shot'], [[0, 'every shot']]);
  fpCard3(600, 440, 520, 400, 0.02, { bar: SK.terra, title: 'shot list' });
  ['1  wide: kitchen', '2  close: hands', '3  medium: pouring', '4  close: steam'].forEach((s, i) => { label(s, 400, 370 + i * 64, 0.14 + i * 0.07, { size: 36, align: 'left' }); check(800, 360 + i * 64, 0.45, 0.4 + i * 0.06); });
  fpCamera(1180, 460, 1.1, 0.4);
});
lesson('B03-2', () => {   // Quick sketches of shots
  fpPage('lesson 2', ['stick figures are fine'], [[0, 'fine']]);
  [340, 800, 1260].forEach((x, i) => fpFrame(x, 420, 360, 240, 0.02 + i * 0.12, { label: 'shot ' + (i + 1), size: 34 }));
  person(300, 470, 1.1, 0.12); person(390, 470, 1.1, 0.16);
  person(800, 490, 1.5, 0.26);
  PC(circ(1260, 410, 70), 0.38, { closed: true, w: 3 }); PC(circ(1236, 395, 8), 0.42, { closed: true }); PC(circ(1284, 395, 8), 0.42, { closed: true }); PC(arcPts(1260, 420, 30, 0.3, Math.PI - 0.3, 8), 0.44);
});
lesson('B03-3', () => {   // Checking light and noise where you film
  fpPage('lesson 3', ['look and listen first'], [[0, 'listen']]);
  fpWindow(360, 380, 280, 220, 0.02); fpSun(360, 380, 34, 0.12); check(540, 270, 0.8, 0.26); label('soft light', 360, 560, 0.2);
  const fr = box(1000, 250, 200, 340, 16); FL(fr, SK.sheet, 0.3); L(fr, 0.28, { closed: true, d: 0.12 }); L([[1000, 370], [1200, 370]], 0.36, { w: 3.5, d: 0.04 });
  fpWaves(1220, 420, 3, 30, 22, 0.4, { faint: true }); label('humm', 1360, 340, 0.42, { col: SK.graph, size: 38 });
  cross(1100, 650, 0.9, 0.5); label('fridge', 1100, 730, 0.48, { size: 32 });
  hero(720, 560, 52, 0.46, { look: [1, -0.6], mood: 'puzzled' });
});
lesson('B03-4', () => {   // Asking people before you film them
  fpPage('lesson 4', ['always ask first'], [[0, 'ask']]);
  ground(200, 1500, 640, 0.02); hero(420, 540, 70, 0.04, { look: [1, -0.3], arms: [-0.3, 0.6] }); fpCamera(250, 460, 0.6, 0.08, { rec: false });
  fpSpeech(700, 320, 380, 120, 'Can I film you?', 0.16);
  person(1150, 580, 1.4, 0.32, { wave: true });
  fpSpeech(1280, 350, 200, 110, 'Yes!', 0.44, { tail: 'right' }); check(1430, 300, 0.8, 0.56);
});
lesson('B03-5', () => {   // Charging batteries and freeing space
  fpPage('lesson 5', ['get ready the night before'], [[0, 'night before']]);
  fpBattery(380, 400, 1.4, 0.02, 1); label('charge it', 380, 520, 0.14);
  fpCard(800, 400, 1.4, 0.2); label('free up space', 800, 540, 0.3);
  const lens = circ(1220, 400, 80); FL(lens, '#dfeaf0', 0.36, { a: 0.7 }); L(lens, 0.34, { closed: true, w: 6, d: 0.1 }); L(circ(1220, 400, 40), 0.42, { closed: true, w: 3, d: 0.06 });
  sparkle(1290, 330, 40, 0.6); label('clean the lens', 1220, 540, 0.44);
  fade(0.5, () => gline(arcPts(1460, 230, 50, 0.9, 5.2, 18), { w: 4, key: 'moon' }));
});
lesson('B03-6', () => {   // Backing up your files
  fpPage('lesson 6', ['keep two copies'], [[0, 'two copies']]);
  fpPhone(250, 420, 1.1, 0.02); label('phone', 250, 560, 0.1);
  arrow([[330, 420], [450, 400], [560, 420]], 0.14);
  fpLaptop(760, 480, 0.9, 0.18); fpFolder(760, 370, 0.6, null, 0.26); label('computer', 760, 570, 0.28);
  arrow([[930, 390], [1050, 310], [1150, 330]], 0.36); fpDrive(1270, 330, 1, 0.42);
  arrow([[930, 480], [1050, 530], [1150, 540]], 0.48); fpCloud(1280, 540, 0.9, 0.52);
  check(1460, 440, 0.9, 0.62);
});

// =====================================================================
//  B04: Use your camera well
// =====================================================================
lesson('B04-1', () => {   // Holding the camera steady
  fpPage('lesson 1', ['two hands, steady shot'], [[0, 'steady']]);
  fpPhone(420, 400, 1, 0.02); for (let i = 0; i < 3; i++) PC([[330 - i * 14, 330 + i * 30], [310 - i * 14, 350 + i * 30], [330 - i * 14, 370 + i * 30]], 0.1 + i * 0.03, { w: 2.6 });
  label('one hand: shaky', 420, 570, 0.14, { col: SK.graph }); cross(520, 300, 0.7, 0.22);
  fpPhone(1060, 300, 0.9, 0.3); hero(1060, 500, 80, 0.36, { look: [0, -0.6], arms: [1.0, 1.0] });
  label('two hands, elbows in', 1060, 680, 0.46); check(1240, 300, 0.8, 0.52);
});
lesson('B04-2', () => {   // Recording and playing back
  fpPage('lesson 2', ['wait, record, then check'], [[0, 'check']]);
  const rb = circ(300, 420, 70); FL(rb, SK.red, 0.08, { a: 0.9 }); L(rb, 0.02, { closed: true, w: 5, d: 0.1 }); label('record', 300, 560, 0.1);
  fpStrip(800, 420, 1.6, 0.2, 3);
  label('2 sec', 685, 350, 0.3, { size: 30, col: SK.graph }); label('action', 800, 350, 0.32, { size: 30 }); label('2 sec', 915, 350, 0.34, { size: 30, col: SK.graph });
  const pb = circ(1300, 420, 70); FL(pb, SK.sheet, 0.44); L(pb, 0.42, { closed: true, w: 5, d: 0.1 }); L(closeP([[1278, 385], [1332, 420], [1278, 455]]), 0.48, { w: 4, second: false, d: 0.06 }); label('play it back', 1300, 560, 0.5);
});
lesson('B04-3', () => {   // Brightness: aperture, shutter speed and ISO
  fpPage('lesson 3', ['three settings, one bright picture'], [[0, 'bright']]);
  fpSun(240, 380, 66, 0.02);
  ctx.save(); ctx.setLineDash([12, 12]); for (let i = 0; i < 3; i++) PC([[330, 380 + i * 22], [520, 410 + i * 18]], 0.16 + i * 0.03, { w: 2.6 }); ctx.restore();
  fpCamera(650, 440, 1.5, 0.12);
  fpDial(1010, 330, 62, 'aperture', 'f/2.8', 0.3); fpDial(1200, 330, 62, 'shutter', '1/250', 0.38); fpDial(1390, 330, 62, 'ISO', '200', 0.46);
  arrow([[1010, 520], [900, 560], [830, 520]], 0.54);
  ground(480, 1500, 686, 0.5); hero(1210, 610, 52, 0.56, { look: [0.2, -1], arms: [1.3, -0.2] });
});
lesson('B04-4', () => {   // Focus
  fpPage('lesson 4', ['tap the face to lock focus'], [[0, 'focus']]);
  fpFrame(640, 430, 760, 440, 0.02);
  PC([[300, 560], [360, 380], [410, 420], [460, 330], [540, 400]], 0.1, { w: 3, a: 0.4, amp: 4 }); PC([[760, 340], [820, 300], [890, 360], [980, 320]], 0.12, { w: 3, a: 0.4, amp: 4 });
  label('blurry background', 850, 280, 0.2, { size: 30, col: SK.graphL });
  hero(640, 470, 90, 0.22, { mood: 'calm' });
  L(box(540, 360, 200, 210, 6), 0.4, { closed: true, col: SK.yellow, w: 5, d: 0.08 });
  label('tap and hold', 1250, 470, 0.5, { face: 'marker', size: 40 }); arrow([[1140, 470], [900, 480], [760, 470]], 0.52);
});
lesson('B04-5', () => {   // Picture size and frame rate
  fpPage('lesson 5', ['50-60 frames for slow motion'], [[0, 'slow motion']]);
  fpStrip(450, 360, 1.3, 0.02, 4); label('24-30: normal', 450, 460, 0.14, { face: 'marker', size: 40 });
  fpStrip(1130, 360, 0.9, 0.2, 8); label('50-60: can slow down', 1130, 460, 0.32, { face: 'marker', size: 40 });
  for (let i = 0; i < 5; i++) { const a = -Math.PI * 0.9 + i * 0.4; L([[1130 + Math.cos(a) * 30, 620 + Math.sin(a) * 30], [1130 + Math.cos(a) * 70, 620 + Math.sin(a) * 70]], 0.4 + i * 0.02, { w: 4, second: false, col: SK.blue, d: 0.04 }); }
  label('splash!', 1270, 640, 0.5, { size: 34 }); ground(330, 570, 670, 0.4); hero(450, 600, 48, 0.44, { arms: [0.4, 0.4] });
});

// =====================================================================
//  B05: Frame your shots and film a sequence
// =====================================================================
lesson('B05-1', () => {   // Wide, medium and close-up shots
  fpPage('lesson 1', ['wide, medium, close'], [[0, 'close']]);
  const xs = [330, 800, 1270];
  ['wide: where', 'medium: who', 'close: feeling'].forEach((n, i) => fpFrame(xs[i], 420, 360, 240, 0.02 + i * 0.14, { label: n, size: 36 }));
  ground(180, 480, 486, 0.08); hero(300, 455, 22, 0.12); fpWindow(410, 400, 70, 60, 0.12);
  hero(800, 440, 70, 0.28, { arms: [-0.3, 0.3] });
  ctx.save(); trace(box(1092, 302, 356, 236, 8), true); ctx.clip(); hero(1270, 470, 130, 0.42, { mood: 'wow' }); ctx.restore();
});
lesson('B05-2', () => {   // Where to place your subject
  fpPage('lesson 2', ['put it where the lines cross'], [[0, 'lines cross']]);
  fpFrame(760, 430, 720, 450, 0.02, { grid: true });
  fpCup(760 + 120, 430 + 75, 1.1, 0.24);
  PC(circ(760 + 120, 430 + 75, 30), 0.4, { closed: true, w: 3, col: SK.red, a: 0.9 });
  label('not in the middle', 1310, 300, 0.48, { col: SK.graph, size: 34 });
});
lesson('B05-3', () => {   // Space above heads and in front of faces
  fpPage('lesson 3', ['give them room to look'], [[0, 'room']]);
  fpFrame(760, 430, 720, 450, 0.02);
  hero(560, 450, 100, 0.12, { look: [1, 0], arms: [-0.4, null] });
  arrow([[690, 440], [850, 430], [1020, 440]], 0.34); label('looking space', 860, 380, 0.4, { size: 34 });
  label('a little headroom', 560, 290, 0.48, { size: 30, col: SK.graph });
});
lesson('B05-4', () => {   // Keeping backgrounds clean
  fpPage('lesson 4', ['check behind them'], [[0, 'behind']]);
  fpFrame(430, 430, 520, 340, 0.02); L([[430, 270], [430, 600]], 0.08, { w: 9, col: SK.graph, second: false, d: 0.06 }); hero(430, 480, 80, 0.12); cross(620, 300, 0.8, 0.28);
  label('a pole on the head', 430, 650, 0.2, { size: 32, col: SK.graph });
  fpFrame(1150, 430, 520, 340, 0.36); L([[960, 600], [960, 270]], 0.4, { w: 9, col: SK.graph, second: false, d: 0.06 }); hero(1230, 480, 80, 0.44); check(1360, 300, 0.8, 0.56);
  label('move a step', 1150, 650, 0.5, { size: 32 });
});
lesson('B05-5', () => {   // Extra shots for editing
  fpPage('lesson 5', ['close details help you cut'], [[0, 'details']]);
  fpStrip(800, 300, 1.8, 0.02, 3);
  fpFrame(800, 530, 320, 200, 0.26, { label: 'detail', size: 32 }); fpCup(800, 550, 0.9, 0.34);
  arrow([[800, 420], [800, 360]], 0.48); label('cut away to it', 1110, 420, 0.5, { size: 34, col: SK.graph });
});

// =====================================================================
//  B06: Work with the light you have
// =====================================================================
lesson('B06-1', () => {   // Where light comes from
  fpPage('lesson 1', ['turn them towards the light'], [[0, 'light']]);
  fpWindow(320, 380, 260, 300, 0.02, { curtain: true }); fpSun(320, 300, 30, 0.1);
  for (let i = 0; i < 3; i++) arrow([[480, 330 + i * 60], [720, 360 + i * 40]], 0.2 + i * 0.04);
  ground(760, 1050, 598, 0.28); hero(900, 470, 90, 0.3, { look: [-1, -0.2] });
  label('face the window', 900, 680, 0.5);
});
lesson('B06-2', () => {   // Hard and soft light
  fpPage('lesson 2', ['soft light is kinder to faces'], [[0, 'soft']]);
  fpLamp(380, 300, 0.02); hero(380, 500, 60, 0.12); fade(0.2, () => { ctx.fillStyle = 'rgba(42,36,32,0.55)'; ctx.beginPath(); ctx.ellipse(380, 600, 90, 16, 0, 0, TAU); ctx.fill(); }); label('hard: sharp shadow', 380, 680, 0.2);
  fpWindow(1150, 300, 260, 180, 0.32, { curtain: true }); hero(1150, 500, 60, 0.42); fade(0.5, () => { ctx.save(); ctx.fillStyle = 'rgba(42,36,32,0.18)'; ctx.filter = 'blur(10px)'; ctx.beginPath(); ctx.ellipse(1150, 600, 110, 20, 0, 0, TAU); ctx.fill(); ctx.restore(); }); label('soft: gentle shadow', 1150, 680, 0.5);
});
lesson('B06-3', () => {   // Window light and shade
  fpPage('lesson 3', ['a window is free light'], [[0, 'free']]);
  fpWindow(360, 400, 300, 340, 0.02, { curtain: true });
  for (let i = 0; i < 4; i++) PC([[520, 300 + i * 50], [760, 360 + i * 40]], 0.14 + i * 0.03, { w: 2.4, a: 0.5 });
  ground(740, 1000, 608, 0.24); hero(860, 480, 80, 0.26, { look: [-1, 0] });
  fpDial(1250, 380, 60, 'ISO', 'low', 0.4);
});
lesson('B06-4', () => {   // Light from behind
  fpPage('lesson 4', ['keep the sun to the side'], [[0, 'side']]);
  fpSun(400, 320, 60, 0.02); const sil = circ(400, 520, 70); FL(sil, SK.ink, 0.14, { a: 0.85 }); L(sil, 0.12, { closed: true, d: 0.08 }); cross(560, 420, 0.8, 0.22); label('just a dark shape', 400, 680, 0.2, { col: SK.graph });
  fpSun(1400, 300, 50, 0.32); hero(1080, 520, 70, 0.4, { look: [1, -0.4] }); check(1230, 420, 0.8, 0.52); label('light on the face', 1100, 680, 0.48);
});
lesson('B06-5', () => {   // Bouncing light with white card
  fpPage('lesson 5', ['bounce light with white card'], [[0, 'white card']]);
  fpWindow(280, 400, 200, 280, 0.02); arrow([[400, 380], [640, 420]], 0.12);
  hero(760, 470, 90, 0.18, { look: [-0.6, 0] });
  const card = [[1000, 300], [1080, 280], [1080, 640], [1000, 620]]; FL(card, SK.sheet, 0.32, { off: [6, 4] }); L(closeP(card), 0.3, { d: 0.1 });
  for (let i = 0; i < 3; i++) arrow([[990, 380 + i * 80], [870, 400 + i * 50]], 0.42 + i * 0.04);
  label('white card', 1160, 700, 0.5);
});

// =====================================================================
//  B07: Record clear sound and guide a speaker
// =====================================================================
lesson('B07-1', () => {   // Putting the mic close to the speaker
  fpPage('lesson 1', ['keep the mic close'], [[0, 'close']]);
  ctx.save(); ctx.setLineDash([14, 14]); PC([[800, 170], [800, 680]], 0.02, { w: 2.6, a: 0.6 }); ctx.restore();
  ground(140, 700, 518, 0.04); hero(300, 420, 60, 0.06, { mood: 'puzzled', look: [1, 0], arms: [-0.7, -0.7] });
  fpWaves(360, 400, 3, 40, 26, 0.16, { faint: true }); fpMic(640, 520, 0.8, 0.18, { a: 0.55, col: SK.graph, ang: -0.35 });
  label('?', 590, 330, 0.24, { size: 80, col: SK.graph }); label('far away: hard to hear', 400, 650, 0.26, { col: SK.graph });
  ground(900, 1460, 518, 0.3); hero(1050, 420, 60, 0.32, { look: [1, 0], arms: [-0.7, 0.4] });
  fpMic(1180, 490, 1, 0.38, { ang: -0.5 }); fpWaves(1150, 405, 3, 60, 34, 0.46);
  check(1400, 330, 1.3, 0.56); label('close: clear', 1150, 650, 0.52);
});
lesson('B07-2', () => {   // Checking sound levels
  fpPage('lesson 2', ['loud enough, never at the top'], [[0, 'never']]);
  fpMeter(500, 330, 800, 0.72, 0.02, { name: 'voice' });
  label('good', 500 + 800 * 0.71, 290, 0.2, { size: 32, col: SK.green }); label('too loud', 500 + 800 * 0.94, 290, 0.22, { size: 32, col: SK.red });
  hero(520, 560, 60, 0.3, { look: [0.4, -1] }); fpMic(640, 610, 0.8, 0.36, { ang: -0.4 });
  fpWave(760, 560, 640, 50, 0.4);
});
lesson('B07-3', () => {   // Listening with headphones
  fpPage('lesson 3', ['listen while you record'], [[0, 'listen']]);
  hero(480, 480, 100, 0.02, { look: [0.5, 0] });
  L(arcPts(480, 480, 125, Math.PI * 1.05, TAU * 0.95, 20), 0.14, { w: 9, second: false, d: 0.1 });
  for (const s of [-1, 1]) { const P = box(480 + s * 125 - 22, 450, 44, 80, 12); FL(P, SK.ink, 0.22); L(P, 0.2, { closed: true, d: 0.05 }); }
  label('wind? buzz? hum?', 1100, 330, 0.34, { size: 44, face: 'marker' });
  fpWave(840, 470, 540, 40, 0.42, { quiet: [[0.3, 0.45]] });
  label('fix it now, not later', 1100, 620, 0.5, { col: SK.graph });
});
lesson('B07-4', () => {   // Background noise
  fpPage('lesson 4', ['turn off the noise'], [[0, 'noise']]);
  [['fridge', 300], ['traffic', 640], ['fan', 980], ['TV', 1300]].forEach(([n, x], i) => { fpFrame(x, 400, 220, 170, 0.02 + i * 0.1); fpWaves(x - 40, 400, 3, 20, 18, 0.08 + i * 0.1, { faint: true }); cross(x + 70, 340, 0.6, 0.42 + i * 0.04); label(n, x, 540, 0.1 + i * 0.1); });
  hero(800, 640, 40, 0.5);
});
lesson('B07-5', () => {   // Recording a few seconds of quiet room sound
  fpPage('lesson 5', ['record 10 seconds of quiet'], [[0, 'quiet']]);
  fpClock(320, 400, 90, 0.02, { text: '10 sec' });
  fpWave(580, 420, 800, 40, 0.2, { quiet: [[0.4, 0.62]] });
  label('room tone fills the gap', 980, 310, 0.44, { col: SK.graph });
  arrow([[980, 340], [980, 400]], 0.5);
});
lesson('B07-6', () => {   // Giving clear, kind directions
  fpPage('lesson 6', ['be clear and kind'], [[0, 'kind']]);
  ground(200, 1500, 640, 0.02); hero(360, 540, 70, 0.04, { look: [1, -0.3], arms: [-0.3, 0.8] });
  fpSpeech(720, 320, 600, 140, 'Just tell me, like a friend.', 0.12);
  person(1180, 580, 1.5, 0.3);
  fpHeart(1300, 340, 0.5);
});

// =====================================================================
//  B08: Organise your footage
// =====================================================================
lesson('B08-1', () => {   // Copying and checking your clips
  fpPage('lesson 1', ['copy, then count'], [[0, 'count']]);
  fpPhone(320, 420, 1.2, 0.02); label('24 clips', 320, 580, 0.12, { face: 'marker', size: 40 });
  arrow([[420, 420], [560, 380], [700, 420]], 0.18);
  fpLaptop(940, 500, 1, 0.26); fpFolder(940, 390, 0.7, null, 0.34); label('24 clips', 940, 600, 0.4, { face: 'marker', size: 40 });
  check(1260, 450, 1, 0.52); label('same number', 1290, 560, 0.5, { col: SK.graph, size: 32 });
});
lesson('B08-2', () => {   // Folders that make sense
  fpPage('lesson 2', ['the same folders every time'], [[0, 'same']]);
  ['video', 'sound', 'music', 'exports'].forEach((n, i) => fpFolder(290 + i * 340, 400, 1.3, n, 0.02 + i * 0.12));
  hero(800, 630, 40, 0.52);
});
lesson('B08-3', () => {   // Keeping the original files safe
  fpPage('lesson 3', ['never edit your only copy'], [[0, 'only copy']]);
  fpFolder(420, 400, 1.6, 'originals', 0.02); fpPadlock(420, 410, 1.2, 0.2);
  arrow([[600, 400], [720, 370], [860, 400]], 0.3);
  fpFolder(1060, 400, 1.6, 'my edit', 0.36); fpScissors(1060, 400, 0.9, 0.46, -0.3);
});
lesson('B08-4', () => {   // Importing into your editor
  fpPage('lesson 4', ['make bins, then import'], [[0, 'bins']]);
  const s = fpLaptop(860, 600, 1.6, 0.02);
  ['video', 'sound', 'music'].forEach((n, i) => { fpFolder(s[0] + 60, s[1] + 50 + i * 86, 0.4, null, 0.16 + i * 0.06); label(n, s[0] + 110, s[1] + 62 + i * 86, 0.2 + i * 0.06, { size: 30, align: 'left' }); });
  fpStrip(s[0] + 340, s[1] + 160, 0.85, 0.38, 4);
  label('import', 240, 300, 0.48, { face: 'marker', size: 40 }); arrow([[240, 330], [300, 380], [s[0] + 20, s[1] + 40]], 0.5);
});
lesson('B08-5', () => {   // Naming and saving versions
  fpPage('lesson 5', ['name it, number it'], [[0, 'number']]);
  ['bread_v01', 'bread_v02', 'bread_v03'].forEach((n, i) => fpFile(400 + i * 280, 400, 1.3, n, 0.02 + i * 0.14));
  hero(1300, 470, 60, 0.46, { look: [-1, 0] });
  label('final_final_REAL?', 1290, 300, 0.5, { size: 30, col: SK.graph }); L([[1180, 290], [1400, 284]], 0.6, { col: SK.red, w: 4, second: false, d: 0.06 });
});

// =====================================================================
//  B09: Make your first edit
// =====================================================================
lesson('B09-1', () => {   // The editing screen
  fpPage('lesson 1', ['clips, viewer, timeline'], [[0, 'timeline']]);
  const s = fpLaptop(800, 640, 2.1, 0.02);
  const clips = box(s[0] + 10, s[1] + 10, 160, 200, 8), view = box(s[0] + 200, s[1] + 10, 380, 200, 8), tl = box(s[0] + 10, s[1] + 240, s[2] - 20, 120, 8);
  L(clips, 0.16, { closed: true, w: 3.5, d: 0.08 }); L(view, 0.22, { closed: true, w: 3.5, d: 0.08 }); L(tl, 0.28, { closed: true, w: 3.5, d: 0.08 });
  label('clips', s[0] + 90, s[1] + 120, 0.3, { size: 34 }); label('viewer', s[0] + 390, s[1] + 120, 0.34, { size: 34 });
  fpStrip(s[0] + 420, s[1] + 300, 0.9, 0.4, 5); label('timeline', s[0] + 120, s[1] + 312, 0.44, { size: 34 });
});
lesson('B09-2', () => {   // Choosing your best clips
  fpPage('lesson 2', ['keep the best clips'], [[0, 'best']]);
  const keep = [false, true, false, true, true], names = ['shaky', 'sharp', 'blocked', 'clear', 'detail'];
  [260, 520, 780, 1040, 1300].forEach((x, i) => { fpFrame(x, 420, 200, 140, 0.02 + i * 0.08); label(names[i], x, 432, 0.06 + i * 0.08, { size: 30, col: keep[i] ? SK.ink : SK.graph }); if (keep[i]) check(x, 560, 0.6, 0.5 + i * 0.03); else cross(x, 560, 0.6, 0.5 + i * 0.03); });
});
lesson('B09-3', () => {   // Trimming clips
  fpPage('lesson 3', ['start late, leave early'], [[0, 'late']]);
  const P = box(300, 400, 1000, 120, 10); FL(P, '#efe3c8', 0.04); L(P, 0.02, { closed: true, d: 0.12 });
  FL([[300, 402], [430, 402], [430, 518], [300, 518]], '#f3b6ad', 0.2, { off: [0, 0], a: 0.7 }); FL([[1170, 402], [1300, 402], [1300, 518], [1170, 518]], '#f3b6ad', 0.24, { off: [0, 0], a: 0.7 });
  fpScissors(430, 330, 1, 0.3, Math.PI / 2); fpScissors(1170, 330, 1, 0.36, Math.PI / 2);
  label('the good part', 800, 472, 0.44, { size: 40, face: 'marker' });
  label('waiting', 365, 600, 0.48, { size: 30, col: SK.graph }); label('"cut!"', 1235, 600, 0.5, { size: 30, col: SK.graph });
});
lesson('B09-4', () => {   // Putting clips in order
  fpPage('lesson 4', ['put the clips in order'], [[0, 'order']]);
  const icons = [(x, y) => gline(box(x - 26, y - 16, 52, 32, 3), { w: 3, key: 'w' }), (x, y) => gline(circ(x, y, 16), { w: 3, key: 'm' }), (x, y) => gline(circ(x, y, 26), { w: 3, key: 'c' })];
  fpStrip(800, 400, 2.2, 0.02, 3, { icons });
  ['1 wide', '2 medium', '3 close'].forEach((n, i) => label(n, 800 + (i - 1) * 158, 520, 0.3 + i * 0.06, { size: 34 }));
  arrow([[560, 600], [800, 630], [1040, 600]], 0.5);
});
lesson('B09-5', () => {   // Removing mistakes
  fpPage('lesson 5', ['cut out the mistakes'], [[0, 'mistakes']]);
  fpWave(240, 440, 1120, 60, 0.02);
  FL([[640, 360], [860, 360], [860, 520], [640, 520]], '#f3b6ad', 0.3, { off: [0, 0], a: 0.6 });
  label('"umm... wait"', 750, 590, 0.36, { face: 'marker', size: 38 }); fpScissors(750, 310, 1, 0.42, Math.PI / 2);
  label('"I bake on Sundays"', 410, 320, 0.2, { size: 30, col: SK.graph }); label('"it makes me calm"', 1140, 320, 0.24, { size: 30, col: SK.graph });
});
lesson('B09-6', () => {   // Simple pacing
  fpPage('lesson 6', ['tighter feels better'], [[0, 'tighter']]);
  fpStrip(620, 340, 1.4, 0.02, 3, { fills: [SK.sheet, SK.sheet, SK.sheet] }); label('slow', 320, 352, 0.1, { col: SK.graph });
  fpStrip(620, 520, 1.4, 0.2, 5); label('tight', 290, 532, 0.28);
  const m = [[1180, 650], [1240, 330], [1300, 650]]; FL(closeP(m), SK.wood, 0.36); L(closeP(m), 0.34, { d: 0.1 }); L([[1240, 600], [1200 + 60 * Math.sin(TT * 4), 390]], 0.44, { w: 5, second: false, d: 0.06 });
  label('pace', 1240, 720, 0.5, { face: 'marker', size: 40 });
});

// =====================================================================
//  B10: Edit sound and music
// =====================================================================
lesson('B10-1', () => {   // Audio tracks
  fpPage('lesson 1', ['one kind of sound per track'], [[0, 'one']]);
  ['voice', 'natural', 'music'].forEach((n, i) => { const y = 300 + i * 140; L(box(380, y - 50, 1000, 100, 10), 0.02 + i * 0.12, { closed: true, w: 3.5, d: 0.1 }); label(n, 340, y + 12, 0.06 + i * 0.12, { size: 36, face: 'marker', align: 'right' }); fpWave(410, y, 940, i === 2 ? 24 : 36, 0.12 + i * 0.12, { quiet: i === 1 ? [[0.2, 0.5]] : i === 0 ? [[0.45, 0.55]] : [] }); });
});
lesson('B10-2', () => {   // Trimming sound
  fpPage('lesson 2', ['trim breaths and coughs'], [[0, 'coughs']]);
  fpWave(240, 440, 1120, 60, 0.02);
  [[300, 'breath'], [760, 'cough']].forEach(([x, n], i) => { FL([[x, 360], [x + 120, 360], [x + 120, 520], [x, 520]], '#f3b6ad', 0.26 + i * 0.08, { off: [0, 0], a: 0.6 }); label(n, x + 60, 590, 0.3 + i * 0.08, { size: 34 }); fpScissors(x + 60, 310, 0.8, 0.36 + i * 0.08, Math.PI / 2); });
});
lesson('B10-3', () => {   // Fading in and out
  fpPage('lesson 3', ['fade in, fade out'], [[0, 'fade']]);
  fpWave(300, 460, 1000, 70, 0.02);
  L([[300, 540], [480, 380], [1120, 380], [1300, 540]], 0.3, { w: 5, col: SK.terraD, second: false, d: 0.14 });
  label('fade in', 390, 340, 0.42, { face: 'marker', size: 40 }); label('fade out', 1210, 340, 0.48, { face: 'marker', size: 40 });
});
lesson('B10-4', () => {   // Voice louder than music
  fpPage('lesson 4', ['voice on top, music below'], [[0, 'voice']]);
  fpMeter(520, 330, 760, 0.72, 0.02, { name: 'voice' });
  fpMeter(520, 470, 760, 0.42, 0.16, { name: 'music', col: SK.graph });
  label('10 lower', 1000, 540, 0.4, { size: 32, col: SK.graph });
  hero(660, 630, 44, 0.46); fpNote(900, 660, 0.8, 0.5);
});
lesson('B10-5', () => {   // Using natural sound
  fpPage('lesson 5', ['real sounds feel real'], [[0, 'real']]);
  fpLoaf(560, 480, 1.8, 0.02);
  L([[720, 260], [620, 560]], 0.26, { w: 7, second: false, d: 0.08 }); FL([[708, 240], [750, 254], [730, 300], [700, 292]], SK.wood, 0.3);
  label('crunch!', 1060, 400, 0.4, { face: 'marker', size: 70 }); fpWaves(860, 440, 3, 30, 24, 0.44);
});
lesson('B10-6', () => {   // Music you are allowed to use
  fpPage('lesson 6', ['only music you may use'], [[0, 'may use']]);
  fpNote(300, 460, 1.6, 0.02); fpCard3(570, 420, 220, 140, 0.12, { title: 'licence', size: 32 }); check(660, 370, 0.6, 0.26);
  label('or made by you', 570, 570, 0.22, { size: 32 }); check(730, 550, 0.5, 0.3);
  const r = box(1000, 330, 280, 180, 14); FL(r, '#d8d2c6', 0.36); L(r, 0.34, { closed: true, d: 0.1 }); L(circ(1200, 420, 50), 0.4, { closed: true, w: 3, d: 0.06 });
  label('a radio hit', 1140, 580, 0.44, { col: SK.graph }); cross(1140, 300, 0.9, 0.52);
});

// =====================================================================
//  B11: Fix colour so shots match
// =====================================================================
lesson('B11-1', () => {   // Spotting shots that are too bright or dark
  fpPage('lesson 1', ['not too dark, not too bright'], [[0, 'not']]);
  [330, 800, 1270].forEach((x, i) => { fpFrame(x, 420, 340, 230, 0.02 + i * 0.12, { label: ['too dark', 'just right', 'too bright'][i], size: 38 }); fpCup(x, 440, 0.9, 0.08 + i * 0.12, { steam: false }); });
  fade(0.2, () => { ctx.fillStyle = 'rgba(30,26,22,0.55)'; ctx.fillRect(162, 307, 336, 226); });
  fade(0.44, () => { ctx.fillStyle = 'rgba(255,255,255,0.6)'; ctx.fillRect(1102, 307, 336, 226); });
  check(950, 290, 0.8, 0.56);
});
lesson('B11-2', () => {   // Spotting colour that is too warm or too blue
  fpPage('lesson 2', ['white should look white'], [[0, 'white']]);
  const tints = ['rgba(255,138,0,0.28)', null, 'rgba(47,109,255,0.24)'];
  [330, 800, 1270].forEach((x, i) => { fpFrame(x, 420, 340, 230, 0.02 + i * 0.12, { label: ['too orange', 'white', 'too blue'][i], size: 38 }); fpCup(x, 440, 0.9, 0.08 + i * 0.12, { col: '#fbf8f0' }); if (tints[i]) fade(0.2 + i * 0.1, () => { ctx.fillStyle = tints[i]; ctx.fillRect(x - 168, 307, 336, 226); }); });
  check(950, 290, 0.8, 0.56);
});
lesson('B11-3', () => {   // Basic colour tools
  fpPage('lesson 3', ['four simple sliders'], [[0, 'four']]);
  [['brightness', 0.6], ['contrast', 0.5], ['temperature', 0.35], ['saturation', 0.55]].forEach(([n, v], i) => fpSlider(640, 280 + i * 110, 700, n, v, 0.02 + i * 0.12));
  hero(1460, 620, 40, 0.5, { look: [-1, -0.5] });
});
lesson('B11-4', () => {   // Comparing shots side by side
  fpPage('lesson 4', ['shots side by side should match'], [[0, 'match']]);
  fpFrame(480, 420, 480, 300, 0.02); fpCup(480, 440, 1.1, 0.1, { col: '#fbf8f0' });
  label('=', 800, 450, 0.3, { size: 110, face: 'marker' });
  fpFrame(1120, 420, 480, 300, 0.32); fpCup(1120, 440, 1.1, 0.4, { col: '#fbf8f0' });
  check(1330, 300, 0.8, 0.56);
});
lesson('B11-5', () => {   // Fixing versus adding a style
  fpPage('lesson 5', ['fix first, style second'], [[0, 'fix']]);
  fpFrame(420, 420, 420, 280, 0.02, { label: '1 fix', size: 44 }); fpCup(420, 440, 1, 0.1, { col: '#fbf8f0' });
  arrow([[660, 420], [800, 390], [940, 420]], 0.3);
  fpFrame(1180, 420, 420, 280, 0.36, { label: '2 style', size: 44 }); fpCup(1180, 440, 1, 0.44, { col: '#fbf8f0' }); fade(0.5, () => { ctx.fillStyle = 'rgba(217,160,80,0.22)'; ctx.fillRect(972, 282, 416, 276); });
});

// =====================================================================
//  B12: Add titles and captions, then export
// =====================================================================
lesson('B12-1', () => {   // Simple titles
  fpPage('lesson 1', ['short and easy to read'], [[0, 'easy']]);
  fpFrame(760, 420, 760, 420, 0.02);
  label('Sunday Bread', 760, 450, 0.16, { face: 'marker', size: 96 });
  fpClock(1330, 330, 46, 0.44); label('3 sec', 1330, 430, 0.5, { size: 32 });
});
lesson('B12-2', () => {   // Checking names and spelling
  fpPage('lesson 2', ['check every word'], [[0, 'every']]);
  label('Recieved with thanks', 680, 380, 0.02, { face: 'marker', size: 70 });
  PC(loopPts(470, 358, 128, 52, 0.1), 0.3, { col: SK.red, w: 4, a: 1 });
  label('Received', 470, 500, 0.4, { size: 54, col: SK.green });
  fpMagnifier(1230, 360, 80, 0.46);
});
lesson('B12-3', () => {   // Captions that match the speech
  fpPage('lesson 3', ['captions match the words'], [[0, 'match']]);
  fpFrame(760, 420, 760, 430, 0.02);
  hero(760, 380, 80, 0.12); fpSpeech(1110, 270, 280, 100, 'I bake...', 0.24);
  const bar = box(460, 540, 600, 60, 8); FL(bar, 'rgba(42,36,32,0.8)', 0.36, { off: [0, 0] });
  fade(0.44, () => handLetter('I bake every Sunday', 760, 582, 36, { col: SK.sheet, key: 'capt', jit: 0.6 }));
});
lesson('B12-4', () => {   // Export settings
  fpPage('lesson 4', ['pick the right shape'], [[0, 'shape']]);
  fpPhone(480, 400, 1.7, 0.02); label('9:16  Reels', 480, 600, 0.16, { face: 'marker', size: 42 });
  fpPhone(1080, 400, 2, 0.28, { wide: true }); label('16:9  YouTube', 1080, 600, 0.42, { face: 'marker', size: 42 });
});
lesson('B12-5', () => {   // Watching the final file all the way through
  fpPage('lesson 5', ['watch it to the end'], [[0, 'end']]);
  fpFrame(540, 400, 600, 340, 0.02); L(closeP([[510, 360], [580, 400], [510, 440]]), 0.12, { w: 4, second: false, d: 0.06 });
  L([[280, 540], [800, 540]], 0.18, { w: 4, second: false, d: 0.1 }); fade(0.3, () => gfill(circ(800, 540, 12, 0), SK.ink, { off: [0, 0], key: 'ph' }));
  fpCard3(1180, 420, 340, 360, 0.3, { title: 'checklist' });
  ['sound', 'spelling', 'captions', 'plays to end'].forEach((n, i) => { label(n, 1040, 340 + i * 60, 0.38 + i * 0.05, { size: 32, align: 'left' }); check(1300, 330 + i * 60, 0.4, 0.44 + i * 0.05); });
});

// =====================================================================
//  B13: Your pathway project
// =====================================================================
lesson('B13-1', () => {   // What makes your chosen style work
  fpPage('lesson 1', ['study the videos you love'], [[0, 'love']]);
  fpStrip(640, 400, 2, 0.02, 4);
  fpMagnifier(700, 380, 110, 0.24);
  label('shots? length? sound?', 1220, 320, 0.44, { face: 'marker', size: 44 });
});
lesson('B13-2', () => {   // A simple message for that style
  fpPage('lesson 2', ['one feeling, one line'], [[0, 'one feeling']]);
  fpSpeech(760, 340, 760, 170, 'One idea a viewer can say back.', 0.02);
  ground(620, 900, 668, 0.3); hero(760, 580, 60, 0.36);
  fpHeart(1230, 260, 0.5);
});
lesson('B13-3', () => {   // Shots you need for that style
  fpPage('lesson 3', ['film the must-haves first'], [[0, 'must-haves']]);
  fpCard3(480, 430, 460, 380, 0.02, { bar: SK.terra, title: 'must-have' });
  ['a wide: where we are', 'the key moment, close', 'clear sound'].forEach((n, i) => { label(n, 290, 390 + i * 70, 0.14 + i * 0.07, { size: 32, align: 'left' }); check(670, 380 + i * 70, 0.45, 0.36 + i * 0.05); });
  fpCard3(1130, 430, 380, 300, 0.4, { title: 'nice to have' });
  ['drone', 'slow motion'].forEach((n, i) => label(n, 1130, 450 + i * 60, 0.5 + i * 0.05, { size: 32, col: SK.graph }));
});

// =====================================================================
//  B14: Beginner final project
// =====================================================================
lesson('B14-1', () => {   // A new brief in your chosen style
  fpPage('lesson 1', ['start from the brief'], [[0, 'brief']]);
  fpCard3(560, 430, 460, 420, 0.02, { bar: SK.terra, title: 'the brief', lines: 6 });
  fpClock(1060, 380, 80, 0.3, { text: '60-90 sec' });
  ground(1220, 1480, 637, 0.4); hero(1350, 560, 54, 0.46, { look: [-1, -0.4] });
});
lesson('B14-2', () => {   // Planning, filming and editing
  fpPage('lesson 2', ['plan, film, edit'], [[0, 'edit']]);
  fpCard3(330, 420, 220, 160, 0.02, { bar: SK.graph, lines: 2 }); label('plan', 330, 560, 0.1);
  arrow([[470, 420], [620, 420]], 0.16);
  fpCamera(800, 430, 1.1, 0.2); label('film', 800, 560, 0.3);
  arrow([[980, 420], [1130, 420]], 0.36);
  fpStrip(1290, 420, 1.1, 0.4, 3, { cut: true }); label('edit', 1290, 560, 0.48);
  ground(680, 920, 701, 0.48); hero(800, 650, 36, 0.5);
});
lesson('B14-3', () => {   // Checking and fixing your video
  fpPage('lesson 3', ['show a friend, then fix it'], [[0, 'friend']]);
  fpFrame(500, 380, 520, 300, 0.02); L(closeP([[470, 340], [540, 380], [470, 420]]), 0.1, { w: 4, second: false, d: 0.06 });
  ground(880, 1300, 637, 0.18); hero(980, 550, 60, 0.2, { look: [-1, -0.3] }); person(1180, 580, 1.3, 0.28);
  fpSpeech(1300, 300, 300, 100, 'Too long here?', 0.38);
  fpCard3(500, 620, 300, 90, 0.48); label('fix 1 thing', 500, 632, 0.52, { size: 32 });
});
lesson('B14-4', () => {   // Exporting the final file
  fpPage('lesson 4', ['your first film, done!'], [[0, 'done']]);
  fpFile(520, 400, 2, 'my_film_final.mp4', 0.02); check(520, 390, 1.2, 0.26);
  const k = at(0.4, 0.4); if (k > 0) paperPlane(900 + 220 * k, 380 - 120 * k, -0.4, 2, 'pp');
  ground(1060, 1340, 669, 0.4); hero(1200, 570, 70, 0.4, { mood: 'wow', arms: [1.3, 1.3] });
  sparkle(1340, 380, 50, 0.55);
});
