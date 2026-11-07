# 🎓 Grantly: Rethinking the Scholarship Experience

Grantly turns the confusing scholarship hunt into one simple journey: **Discover → Understand → Track → Apply.**

## Problem
Students miss scholarships not because they are ineligible, but because:
- eligibility rules are scattered across portals and hard to interpret
- deadlines are easy to miss
- required documents are unclear until the last minute

## Solution
Enter your profile once. Grantly ranks scholarships, explains *why* you match (or don't), and helps you track every application to the finish line.

## Features
| Area | What it does |
|---|---|
| Smart matching | Match % plus ✓/✗ reasons for every criterion (level, field, category, gender, income, marks) |
| Opportunity summary | Total ₹ you may still claim and a "next best action" suggestion |
| Search, sort, filter | By name/provider, best match, amount, deadline, "only fully eligible" |
| Details view | About, eligibility breakdown, document list, apply link |
| Calendar reminder | Download an `.ics` file with an alert 3 days before the deadline |
| Tracker | Saved → Applying → Applied → Awarded/Rejected, with a per-scholarship document checklist and progress bar |
| Persistence | Profile and tracker saved locally (localStorage), no sign-up |

## UX and Accessibility
- Mobile-first responsive layout, light/dark mode (follows system, with manual toggle)
- Semantic HTML (`header`, `main`, `section`, `article`), skip link, labels linked to every input
- ARIA tabs with arrow-key navigation, native `<dialog>` with focus handling, `aria-live` for the summary and toasts
- Visible focus rings, 44px touch targets, AA-friendly colours, respects reduced-motion

## Project structure
```
grantly/
├── index.html      # markup and accessibility structure
├── css/style.css   # design tokens, layout, components
├── js/data.js      # sample scholarship dataset
├── js/app.js       # eligibility engine, renderers, events
└── README.md
```

## How to run
No build step or internet needed. Extract the folder and open `index.html` in any modern browser.

## Architecture notes
- **Data layer** (`data.js`) is separate from logic, so a real API can replace it with one change.
- **Eligibility engine** (`evaluate`) is a pure function: easy to test and extend with new criteria.
- **Event delegation** keeps handlers in one place (no inline `onclick`).
- **Storage wrapped in try/catch** so the app still works if storage is blocked.
- **Zero dependencies**, so it loads instantly.

## Limitations
- Scholarships are **sample data**, not real listings. Verify everything on the official portal.
- "Apply" links point to a placeholder URL.

## Future scope
- Live data from official portals/APIs
- AI assistant to explain eligibility in Hindi and regional languages
- SMS/WhatsApp reminders and push notifications
- Document autofill and secure document locker
- Alerts when new matching scholarships open
