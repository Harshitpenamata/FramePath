# Studio Grid refine and HTML home banners

Branch: `feat/grid-refine` (based on `main` after PR #34)

## Summary
**Studio Grid refine:**
- **Outlines show what matters.** The cream outline stays only on the main element of each screen:
  - the lesson card
  - the task form
  - empty states
  - dialogs
  - the "Make" block

  Panels, accordions, nudges, module rows, My work cards, craft cards and step cards become quiet dark surfaces with no border.
- **Stage strip.** It's now separate tiles:
  - finished stages are filled lime
  - the current stage has a lime outline

  On phones, each tile shows the number above the name, with the check or "Now" badge in the corner.
- **Labels.** Only the label at the top of each page stays in capitals. Section labels are in sentence case, for example:
  - "Your modules · Beginner"
  - "Lesson 1 of 5"
  - "Module 1"
  - "Coming up next"
- **Spacing instead of divider lines.** Lines were removed in:
  - the footer
  - check lists and task details
  - the lesson header and footer
  - stats rows
  - the phone nav

**Home banners are HTML now:**
- **Real text, not pictures.** The five banners were images with the words baked in. Now:
  - the intro line, headline and sub-line of each banner are real text, in Anton and Inter (both already self-hosted)
  - the drawings are the designer's flat SVGs
- **Headings for search engines.** The first banner's headline is the page's `<h1>`, and the other banners' headlines are `<h2>`s. The screen-reader-only heading is gone.
- **Server-rendered.** All five banners' text is in the HTML the server sends.
- **Phones.** On a phone, the text sits above the drawing.
- **Carousel.** Unchanged: it changes slide every 5 seconds and keeps the arrows, dots and pause. It stops for keyboard users and for people who turn on reduced motion.
- **Old images.** The `public/banners/*.webp` images were removed, since nothing uses them now.

## Code
- `app/studio-grid.css`: the "Studio Grid, refined" layer, with surfaces, outline hierarchy, sentence-case labels, no dividers and the phone stage tiles.
- `app/videography/hero-banners.tsx`: new. The banner text, the shared SVG symbols and each banner's drawing.
- `app/videography/start.tsx`: `HeroSlides` renders the HTML banners.
- `app/videography/home.css`: banner styles, with the class names prefixed `hb-` so they can't collide with the site's own `.panel` and `.eyebrow`.
- `dashboard.tsx`, `lesson.tsx`, `module-context.tsx`, `my-work.tsx`, `portfolio-page.tsx`, `reflect.tsx`: label text in sentence case.

## Testing
- The type check passes.
- Before and after screenshots at 1440 wide, of home, the plan page, a lesson, My work, Safety and My courses.
- Phone checks at 390 wide (plan page and home banners): no sideways scroll.
