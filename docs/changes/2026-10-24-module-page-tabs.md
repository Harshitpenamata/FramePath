# Module page: lesson tabs, less scrolling (24 Oct 2026)

From the walkthrough video of 24 Oct. The aim: the lesson's player, its videos, the description and the start of the
questions all in the first screen.

- **Toolbar:** "Where this fits in making a video" moves to the left, Watch / Make / Reflect to the right. Smaller title.
- **Lesson tabs:** the lessons are browser-style tabs (01 02 03 04) beside the player. The open tab lists that
  lesson's videos (01 02 03, like a video site's list); "About this video" is a dropdown with the creator and what to
  watch for. Arrow keys move between tabs. This replaces the lesson dropdown and the video strip under the player.
- **Under the player:** the lesson's idea and Think it through, like a video's description; the Next lesson button
  under the player is removed (the one at the end of the lesson stays).
- **Player size:** on desktop the left column is as wide as the player, sized by the window's height, so the lesson
  card starts in the first screen; the sidebar takes the rest.
- **Scroll arrow:** a green arrow bottom right scrolls down; at the bottom it becomes "Back to top".
- **Make tab:** lesson 1's sketch replaces the photo.
- **Plan badge:** Free, Self-paced or Membership shows beside My account in the header (removed from the module page).

Checked locally at 1920×1080, 1672×941, 1440×900, 1366×768, 1280×720 and 390×844: no sideways scroll; tabs, arrow
keys, video list, description dropdown and the scroll arrow all work. On phones the order is player, lesson title,
tabs and videos, then the idea and questions.

## Second walkthrough (24 Oct 2026)
- More space in the title area and between the title and the stage strip; looser line spacing in the lesson card.
- The open lesson tab shows the lesson's name; the others show their number.
- Under the player: the open video's or guide's title, creator and what to watch or read for, then the lesson's
  idea. The "About this video" dropdown is gone.
- Guides (web pages) are listed with the videos and open in the player area, not in a pop-up or a new tab, with an
  "Open on <site>" link under the player. A site that refuses to be shown inside another site gets a card in the
  player with an "Open on <site>" button (a new tab is the only way to show those).
- Checked: the 26 guide links used in lessons; four sites load inside the player. adobe.com (12 links) blocks
  automated browsers, so it could not be checked here; if it refuses to be shown inside for learners too, add it to
  `noFrameHosts` in `module-context.tsx` and those guides switch to the "Open on adobe.com" card.
