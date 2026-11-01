# Skill levels never go down

A skill's level was the plain average of the level check and the reviewed tasks in that skill, so one weaker hand-in pulled it below the starting score (Story and ideas showed 18, "-2"). That reads as the level check being wrong.

- A skill never drops below the level check.
- A reviewed task can only raise it: the level is the best running average so far, module by module.
- Each module counts its best review (most points), so a weaker redo of a module doesn't pull a skill down.

Weak reviews still matter: the plan page's "Suggested for you" still points at skills under 50 with lessons to rewatch.

Files: `app/videography/programme.ts` (`liveSkills`), `app/videography/dashboard.tsx`, `tests/videography.test.mjs`.
