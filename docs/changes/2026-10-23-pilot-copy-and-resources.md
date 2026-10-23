# Pilot copy fixes; resources move into the lessons (23 Oct 2026)

From the UI/UX audit of 23 Oct 2026 (items 1-4) and the follow-up decisions.

## Resources now live inside each module
- The separate Resources page is retired. `/resources` (and old `/resources?q=` links) land on My courses; it is gone
  from the More menu.
- Every module's Watch tab ends with **Free resources to learn more**: free videos and guides from other creators,
  grouped by topic, each opening in a new tab. Anything the module's lessons already play is not listed again.
- Topics by module (the same at every level): 01-02 Story · 03 Ethics and consent, Interviewing · 04 Camera
  (exposure, lenses), Screen capture · 05 Camera (shot sizes, movement) · 06 Lighting · 07 Sound (recording),
  Interviewing · 08 Archiving · 09 Editing · 10 Sound · 11 Colour, white balance · 12 Delivery, Accessibility ·
  Working with people: Interviewing. Pathway and final projects have none.
- "Suggested for you" on a plan links to the module's free resources instead of the Resources page.
- Mapping: `app/videography/module-resources.ts`.

## Copy and small fixes
- **Membership page:** "Self-paced" everywhere instead of "Explore annual" / "Explore paths"; "During the pilot,
  no money is taken" instead of "Practice checkout only"; the AI usage panel only shows when signed in;
  "Pilot receipts".
- **Title and description:** "Framepath – where creators find their path" (was "Framepath — Learn for your real
  video task" and a description of the retired diagnostic).
- **Brand spelling:** "Framepath" everywhere on screen. The WhatsApp message templates keep their wording, because
  they must match the templates approved by Meta.
- **Home, phones:** the arrow in "Pick your craft" no longer sits on top of the paragraph.
- **Account settings:** the WhatsApp updates form is hidden while WhatsApp is parked (`showWhatsApp` in
  `app/other-pages.tsx`); the code stays.
