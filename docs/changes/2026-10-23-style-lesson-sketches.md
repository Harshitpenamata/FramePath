# Sketches for the style extra lessons (23 Oct 2026)

The 52 style extra lessons (16 Intermediate, 36 Advanced) now have their sketchbook clip and poster.

- **Names by style.** Two styles' extras can share a lesson number (I05's Wedding and Social media extras are both
  lesson 7), so their clips are named `<module>-<style>-<n>`: `I05-wedding-1`, `I05-social-media-1`,
  `A10-corporate-1`. Shared lessons keep `<module>-<n>`. `sketchId()` in `app/videography/lessons.ts` picks the name;
  the module page uses it.
- **Same style and props** as the other sketches; each page's tag says "wedding extra", "corporate extra" or
  "social extra" instead of a lesson number. Source: `pieces/lesson-sketches/src/scenes-style.js`.
- Clips: `public/sketches/`, 104 files, under 110 KB each.

Test: "style extra lessons have their own sketch" checks every style extra has a clip and poster, and that no two
share a name. All 111 tests pass.
