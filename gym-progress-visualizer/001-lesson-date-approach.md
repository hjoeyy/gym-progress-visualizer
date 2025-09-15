## Goal
Choose a simple, safe, and international-friendly way to handle dates in the app.

## Recommended approach (beginner-friendly)
1) Capture dates with a native date picker
- Use `<input type="date">`. Browsers show a calendar UI and always submit a locale-agnostic ISO string `YYYY-MM-DD`.

2) Store dates as ISO strings
- Persist dates exactly as `YYYY-MM-DD` in `localStorage` and in your JS objects.
- This avoids MM/DD vs DD/MM confusion and makes sorting/comparing reliable.

3) Convert to Date only for arithmetic
- When you need to compare or do week/month math, create a `Date` like:
  - `new Date(iso + 'T00:00:00Z')` to normalize at UTC midnight, or
  - `new Date(iso)` and immediately zero-out time with `setHours(0,0,0,0)`.
- Keep all comparisons using these normalized `Date` objects.

4) Format for display using Intl
- Use `Intl.DateTimeFormat` to show dates in the user’s locale without changing stored values.
- Example: `new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(date)`.

## Why this approach
- Avoids manual typing errors and regional formatting issues.
- ISO is easy to sort and compare.
- No heavy library needed; `Date` + `Intl` is enough for this app.

## Minimal code changes you’ll make next
- Change the workout date input to `type="date"`.
- Store `workout.date` as `YYYY-MM-DD` (ISO), not `MM/DD/YYYY`.
- Update `parseWorkoutDate` to accept ISO.
- Use `Intl.DateTimeFormat` when rendering dates to the table/UI.

## Notes on safety
- Always normalize time to midnight to avoid off-by-one errors across time zones.
- Keep internal storage as ISO; only format at the edges (UI and charts). 

After you’re comfortable with this, we’ll refactor the code step-by-step.

