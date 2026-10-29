# Pathway page as a tile dashboard

The plan page (`/workspace/<plan id>`) was a hero with a photo, a stage strip and four closed drop-downs above a long module list. It is now one tile dashboard, with the same Framepath dark and lime look:

- **Top row:** a progress ring (modules done), hours done against total, dates with a time bar and an On track / N days behind chip, and a Next up tile with the Continue button.
- **Notices** (behind your dates, stage finished, suggested for you) sit under the top row.
- **Your level in each skill:** a bar per skill with the Beginner, Intermediate (40+) and Advanced (70+) marks, the score and the gain from AI reviews.
- **Your stages:** a stacked bar of hours per stage, with modules done, hours and weeks for each.
- **Your modules:** every module as a tile (stage colour, hours, Done or Task open or Task in Self-paced), the next one outlined.
- **What you'll be able to do:** the final project and one outcome per stage.
- Hours per week and start date open from "Change hours or start date" in the Dates tile. The Free / Self-paced choice, Rename, Report a problem and Delete are unchanged.

Phones: the small tiles go two across and the module tiles two across, with Next up first.

Files: `app/videography/dashboard.tsx`, `app/videography/dashboard.css`. Only this page; the level assessment and the other pages are unchanged.
