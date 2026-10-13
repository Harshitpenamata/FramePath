// =====================================================================
//  TIMELINE: one LESSON_T-second era per lesson, in the order scenes.js declares them.
// =====================================================================
const DURATION = LESSONS.length * LESSON_T;
const NFRAMES = Math.round(DURATION * FPS);
const LOOP_T = NFRAMES / FPS;
const ERA_LIST = LESSONS.map(([id, fn], i) => [i * LESSON_T, (i + 1) * LESSON_T, () => fn()]);
const SHOTS = LESSONS.map(([id], i) => [id, i, i * LESSON_T, (i + 1) * LESSON_T, 'lesson ' + id]);
const TIMELINE = {
  width: W, height: H, fps: FPS, bpm: BPM, duration: DURATION, frames: NFRAMES, loop: LOOP_T, safe: SAFE,
  format: 'catalogue',
  shots: SHOTS.map(([key, era, t0, t1, title], i) => ({ id: i + 1, key, era, t0, t1, title })),
  cuts: LESSONS.slice(1).map((_, i) => (i + 1) * LESSON_T), morphs: [], cues: {},
  acts: [{ name: 'lessons', role: 'build', t0: 0, t1: DURATION }],
  board: LESSONS.map(([id], i) => ({ t: (i + 1) * LESSON_T - 0.1, title: id, sound: '', next: '' })),
  lessonT: LESSON_T,
  lessons: LESSONS.map(([id]) => id),
  narration: [],
};
window.TIMELINE = TIMELINE;
