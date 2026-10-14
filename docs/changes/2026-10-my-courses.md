# My courses: plans you make for yourself (Explore removed)

Branch: `feat/my-courses` (based on `feat/delete-plan`)

## Summary
Learners now only see the plans they've made for themselves: **up to 3 plans at a time, across all courses**. Today that's Videography; Animation, 3D and other courses will join the same list. The Explore catalogue is gone.

## What learners see
- **Nav:** My courses · My work · Community. *Journey* and *Explore* are gone.
- **My courses** (`/workspace`) is a tile for each plan, showing:
  - the course and level (*VIDEOGRAPHY · BEGINNER*)
  - the plan's style (*Wedding*)
  - a progress bar, the modules done, and the dates
  - *Continue →* to open the plan
  - **the last tile:**
    - *Make another plan* (opens the plan setup)
    - or, at the limit, *3 of 3 plans · Delete one from its page to make another*
- **A plan's page** (`/workspace/<plan id>`):
  - the breadcrumb *My courses / Videography · Wedding*
  - the level report, outcomes, dates, how you learn
  - its modules, grouped by stage
  - *Delete this plan*
  - opening a plan makes it the current one, so lessons, tasks and feedback follow its level and style
- **Making a plan:**
  - the full setup (interests, level check, time) creates a new plan and opens its page
  - with 3 plans, the setup says *"You have 3 plans. Delete one from its page to make another."*
- **Modules:**
  - module pages only open for levels in the learner's plans
  - any other level shows *"This module isn't in your plans"*, with links to My courses and *Make a plan*
  - opening a module from another of the learner's plans opens that plan first
  - breadcrumbs read *My courses / <plan>*
- **Old links:** `/explore` and the old per-level module lists now land on My courses. `/journey` and `/my-courses` do too.

## Plans and their work
- **Each plan follows one style:** its first interest.
- **Core modules are shared** between plans at the same level: the same module is the same work.
- **Each plan keeps its own style project** (B13 / I13 / A13). Opening a plan swaps that progress in and out (`state.planProgress`).
- **Deleting a plan:**
  - *Delete plan only* keeps hand-ins and progress
  - *Delete plan and work* removes that level's hand-ins and lesson progress, unless another plan uses the same level
  - after a delete, the most recent remaining plan opens
- **The older "previous learning" plan** can still be deleted from My courses when it exists and there are no plans.
- **Accounts from before this change** are upgraded the first time they load: their one plan gets an id and goes into the plan list.
- **The "styles as course tiles" of the 14 Oct round are replaced by these plans:** a learner who wants a second style makes a second plan.

## Code
- `app/videography/programme.ts`: `maxPlans`, `plansOf()`, `planTitle()`, `courseNames`, and `id` on a plan. The styles helpers are removed. An update keeps the plan's style.
- `app/api/state/route.ts`:
  - `setupPlans()` (also run on load for older accounts) and `openPlan()`
  - `programme_save` adds a plan (max 3)
  - new `plan_open`
  - `programme_update` keeps the plan id
  - `plan_delete` works per plan
  - the open plan is kept in step with `state.plans` after every action
- `app/videography/dashboard.tsx`: `MyCourses` (tiles) and `PlanPage`. The Explore list and the style tiles are removed.
- `app/videography/lesson.tsx`: the plan check, opening the matching plan, and breadcrumbs.
- `app/videography/start.tsx`: opens the new plan's page; stops at 3 plans.
- `app/framepath.tsx`, `app/foundation/navigation.ts`: the routes, nav and redirects.

## Testing
- `node --test`: 99 passing. The style tests are replaced with plan tests, and the nav test is updated.
- **Plans, end-to-end API run, 11 checks, all passing:**
  - **Making plans:**
    - a first plan is made and opened
    - a second plan (YouTube) shares the core modules but not Wedding's style project
    - reopening Wedding brings its project back
    - updates change the open plan and the list
    - a third plan is made; a fourth is refused
  - **Deleting plans:**
    - deleting a plan whose level another plan uses keeps the work
    - a deleted plan can't be opened
    - deleting the last plans clears the work and leaves no plan open
- **Earlier end-to-end runs, still passing:** delete plan (6) and community (22).
- **Browser:**
  - an account from before plans upgrades on load and its tile opens its page
  - the nav shows My courses · My work · Community
  - `/explore` lands on My courses
  - an Intermediate module says it isn't in the plans
  - module breadcrumbs read *My courses / Videography · Wedding*
- `npm run build`: all budgets pass.
