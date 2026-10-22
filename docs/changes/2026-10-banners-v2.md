# Home banners v2

Branch: `feat/banners-v2` (based on `main` after PR #37)

## Summary
The home banners are the designer's new HTML/CSS version, made with ChatGPT from the five banner PNGs. It's the same layout as the images, built from:
- **Live text:** the small top line, the headline with its lime words and the description, all real HTML text in Anton and Inter.
- **SVG drawings:** each banner's illustration, the frame lines and crosshairs, the small squares and the lime underline swashes.

Nothing is an image, so search engines and screen readers read every word.
- The first banner's headline is the page's `<h1>`, and the other four are `<h2>`s.
- The carousel is unchanged: 5 seconds a slide, with the arrows, dots and pause, and it stays still for people who ask for reduced motion.
- **Phones:** below 760px the text sits above the drawing, inside a thin frame. The lime swash stays under the highlighted words.

## Changes from the designer's files
- Every class has an `hb-` prefix (`.hb-eyebrow`, `.hb-l` and so on), and the two dot patterns have `hb-` IDs, so nothing clashes with the site's own `.eyebrow`, `.panel` and others.
- Each banner's own rules use `.hb-b1` to `.hb-b5` instead of `:nth-of-type`.
- **Banner 4:** the headline's three lines overlapped, and the top line touched the headline. I loosened the line spacing and moved the lines (`--heading-leading` .83 to .92, size 7.55 to 7cqw).
- **Phones:** the desktop line breaks are hidden, so a space now follows each one. Without it, words ran together ("CAREER,MAPPED").

## Code
- `app/videography/hero-banners.tsx`: the five banners, converted from the designer's HTML.
- `app/videography/home.css`: the designer's CSS, converted, plus the fit into the carousel.
- `app/videography/start.tsx`: `HeroSlides` renders each banner with its headline tag.

## Testing
- The type check passes.
- Desktop at 1440 wide: all five banners compared with the PNGs.
- Phone at 390 wide: no sideways scroll, and the headlines read with spaces.
