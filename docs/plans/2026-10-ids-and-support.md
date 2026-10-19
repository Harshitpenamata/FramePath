# IDs and support tickets

Written 19 Oct 2026.

**Why:** support needs to know who a learner is and which course, pathway, module and lesson they mean, without asking them.

## IDs

| ID | Example | Given | Changes? |
|---|---|---|---|
| User ID | `FP-10001` | The first time a learner's account loads | Never |
| Course ID | `VID-B-1001` | When a plan is made | Never. Not on rename, a move up a level, or deletion |
| Ticket | `T-1001` | When a learner reports a problem | Never |

- **Where the numbers come from:** counters in the database (`id_counters`). A number is handed out once and never reused, so two learners can't share an ID, even after an account is deleted.
- **Course ID format:**
  - `VID` is the course (Videography).
  - `B`, `I` or `A` is the level the plan *started* at.
  - The number is unique across all learners.
- **Course ID lookup:** `course_ids` maps every Course ID to its learner and plan, so support can look one up directly. A deleted plan keeps its row, marked `deleted_at`, so old tickets still point to it.
- **Plan names:** learners rename a plan from its page ("Rename"). The name is for them; the Course ID is for us.
- **Existing accounts:** they get a User ID, and each existing plan a Course ID, the next time they load the site.

Code:
- IDs: `app/ids.ts`
- Database tables: `db/schema.ts`
- Migration: `drizzle/0007_ids_and_support.sql`

## Support tickets

```
Learner clicks "Report a problem"
  (on a module page, a plan page, Help, or My account)
        │  chooses a category, writes what happened
        │  sees what will be attached: User ID · Course ID · plan · module · lesson · page
        ▼
POST /api/support
  ├─ works the context out again from the learner's own account (the page's version isn't trusted)
  ├─ limits: 5 tickets a day, 10 to 2,000 characters
  └─ saves the ticket in support_tickets with status "open"; replies with T-1001
        ▼
Admin → Support tickets  (GET/POST /api/admin/support)
  ├─ find by T-1001, FP-10001, VID-B-1001 or email
  ├─ shows: User ID, email, Course ID, course · pathway · plan name · level, module, lesson, page, device
  └─ set the status (open → in progress → resolved), write a reply the learner sees, keep a staff-only note
        ▼
My account → Help requests  (GET /api/support)
  └─ the learner's User ID and each ticket with its status and our reply
```

Each ticket records:
- User ID and Course ID
- course, pathway, plan name and level
- module and lesson
- the page address
- the category and message
- the browser and screen size

Admin → "Find a learner" also accepts a User ID or Course ID.

**Privacy:** deleting an account deletes its tickets and Course ID rows. The counters don't go back, so those IDs are never reused.

## Not built yet

- **No email or WhatsApp alerts.** Neither staff nor learners are alerted when a ticket is raised or answered; replies appear in My account. Alerts can be added once a sending service is chosen.
- **No attachments on tickets.** A learner can describe the problem in words only, for now.
