# Mentorship: coming soon

Branch: `feat/mentorship-coming-soon` (based on `feat/my-courses`)

## Summary
Mentorship will become its own short and long courses, with a fixed curriculum and timeframe, and will be built separately. Until then, plans offer only **Free** and **Self-paced**.

## What changed
- **A plan's page:**
  - *Get a mentor* is removed.
  - The top of the page has a **Mentorship · Coming soon** button. Clicking it says *"Mentorship is coming soon: short and long courses with a fixed curriculum and timeframe."*
  - Free learners also see **Upgrade to Self-paced** there.
- **How you learn:** only Free (₹0) and Self-paced (₹999 / year). The Mentor-led option is gone.
  - Plans that had Mentor-led chosen are asked again.
  - Anyone already enrolled with a mentor keeps full task access, the same as Self-paced.
  - A plan's mode can only be set to Free or Self-paced (`buildProgramme`).
- **Demo notice:** *"Checkout takes no money."* The made-up mentors are no longer mentioned.
- **Help:** updated to match the site as it is now:
  - My courses (up to three plans)
  - mentorship coming soon
  - AI that watches videos, which are sent to Google and deleted
  - task scoring without mentor reviews

The old mentor pages (`/mentors` and others) are no longer linked from anywhere. They stay in the code until the new mentorship courses replace them.

## Testing
- `node --test`: 99 passing. `npm run build`: all budgets pass.
- Browser:
  - the plan page shows the Mentorship · Coming soon button, and its message appears on click
  - no "Mentor-led", "Choose a mentor" or "Get a mentor" text is left on the page
