# AI reviews: house guide and a director's lens (24 Oct 2026)

To make reviews consistent and more like a working director's, every review now gets two things. Both live in
`app/videography/review-guide.ts` as plain text the team can edit.

- **reviewGuide:** the house dos and don'ts (start from the viewer; one real strength with its timestamp; one
  concrete change; evidence for every point; judge at the learner's level; explain craft words; a reference when it
  helps; no vague praise, no lists of everything wrong, no gear-pushing, no rewriting their idea). Added to Claude's
  instructions for every review.
- **directorLens:** for each of the 15 module types (all levels share them), which professional to review as and what
  they judge first, e.g. module 05: director of photography and editor, "does each shot have one clear subject and a
  reason to exist…". Sent to Claude with the assignment.
- **Gemini** (watches the videos) now also describes what a director would notice: what each shot is for, where the eye
  goes, motivated light, cuts on movement or beat, the strongest and weakest moment, plus the module's `watchFor`. It
  still describes and never scores.

Scores, checks, allowances and output format are unchanged. Test: every module has a lens; the guide has DO and DON'T.
Next: compare reviews before and after on real pilot hand-ins, then add mentor-written example reviews.
