# Web polish from a Hallmark audit (desktop only)

A Hallmark audit of the pilot pages (home, My courses, a plan, a module's Watch, Make and Reflect). The pilot is web only, so phone-only findings (sideways scroll at 320px, Yes/No buttons wrapping, a 19px checkbox) are left for later. Fixed:

- **Form fields:** text boxes and dropdowns had edges at 2.5:1 against the dark panels; they now use a `--field-edge` token at about 4:1, so a field reads as a field.
- **Module title:** uppercase with line height 0.98, so wrapped lines could touch; now 1.02.
- **Showcase grid:** an image column without a shrink limit (`1fr` to `minmax(0,1fr)`).
- **Scroll arrow:** the bouncing arrow now pauses on hover and keyboard focus.
- **No sideways overflow:** `overflow-x: clip` on html and body (clip, not hidden, so sticky headers still work).

Checked and left as they are:
- **Display headings at line height 0.9:** Framepath's look; no collision seen on desktop.
- **Uppercase labels, eyebrows and "·" meta lines:** the brand, not a bug.
- **Home carousel "hidden until the script runs":** the server renders the first slide visible.
- **An unmuted autoplay video:** in an old lesson screen the pilot doesn't use.

Hallmark's re-run: every link (49), field (9), handler (143) and heading (11) kept; the targeted findings cleared. `.hallmark/` (audit screenshots) is now in `.gitignore`.
