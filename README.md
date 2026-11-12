# GoalPath — visual goal and task planner

A standalone, iPhone-friendly Progressive Web App (PWA) inspired by a goal → connected tasks process diagram. It runs on **GitHub Pages with no paid hosting, server, npm, or build step**.

## Features

- **Goals:** create and edit multiple colour-coded goals, see progress and counts.
- **Visual plan:** vertical connector, circular task nodes, `+` buttons for inserting tasks at any point, and two-finger pinch / `+` and `−` zoom. Zooming out hides details for an overview; zooming in reveals descriptions.
- **Task cards:** title, description, To do / In progress / Blocked / Done, priority, optional due date, checklists, reorder earlier/later, and delete.
- **Focus:** overdue, due today, next 7 days, and undated tasks from every goal.
- **Calendar:** month view combining due dates and scheduled appointments from all goals, with per-goal filter.
- **Calendar export:** generates an `.ics` calendar event for iPhone/Apple Calendar; launches a pre-filled Outlook on the web event editor.
- **PWA:** install on an iPhone Home Screen; static files are cached for offline use.
- **Data:** automatically saves to that browser's `localStorage`; export/import full JSON backups.
- **Appearance:** dark or light.

## Publish on GitHub Pages (no command line required)

1. Sign in to GitHub and create a new public repository, e.g. `goalpath`.
2. In that repository choose **Add file → Upload files**.
3. Upload the **contents** of the `GoalPath_GitHub_Pages` folder to the repository root. This includes `index.html`, `styles.css`, `app.js`, `manifest.webmanifest`, `sw.js`, and the `assets` folder with two icon files. Commit them.
4. Go to **Settings → Pages**. Under **Build and deployment**, choose **Deploy from a branch**. Set branch to `main`, folder to `/ (root)`, and save.
5. Open the Pages URL GitHub provides, normally `https://YOUR-USERNAME.github.io/goalpath/`.
6. On the iPhone, open this URL in **Safari → Share → Add to Home Screen**.

Because all CSS/JavaScript/manifest/service-worker links are relative, the exact same files work at a repository subpath or root-level custom domain. GitHub Pages automatically uses HTTPS.

> **Important:** GitHub Pages is a public static website. The *code* is public when hosted in a public repo; your entered tasks are **not** committed to GitHub. They remain inside the local storage of the browser/device where you create them. They are not synced across the iPhone, iPad, or a laptop. Use Settings → Export backup regularly. Browser storage may be cleared by the OS or by you.

## Calendar appointments

1. Open a task card. You can set a **due date**, independently of an appointment.
2. Under **Calendar appointment**, choose a start date/time and duration. If the task has a due date, use **Use due date at 9:00 am** as a quick starting point.
3. **Apple / iPhone calendar (.ics)** creates a standards-based calendar file; open or share the file to your desired calendar. The exact iOS handling of `.ics` downloads depends on Safari/iOS and the available calendar apps. If the downloaded file does not offer a direct add-to-calendar flow, send/open the `.ics` file in a calendar-compatible app or email client.
4. **Create in Outlook calendar** opens the Microsoft Outlook web calendar event editor with title, start/end times and task notes pre-filled. Sign in and save the event there.

These are **one-time exports**, not live synchronisation. If you later reschedule the task, update the corresponding calendar event manually (or export again and avoid duplicates). If your Outlook calendar is already displayed in Apple Calendar via a connected account, you may only need to add the appointment to Outlook once.

## Data management

- The app starts with **two editable example goals** so you can immediately explore it. You may edit or delete them.
- `Settings → Export backup` downloads all goals, tasks, dates and checklists to a JSON file.
- `Settings → Import backup` replaces all data on that device. Export before importing if the current data matters.
- `Settings → Delete all data` clears just this device's GoalPath plans.
- Data is versioned as `goalpath.data.v1` in browser `localStorage`.

## Local testing

Run `python3 -m http.server 8000` inside this directory, then open `http://localhost:8000` in a browser. HTTPS is needed for service-worker/PWA installation when deployed, but localhost also works for development.

## Future enhancements

For multi-device sync and true calendar updates, add a hosted backend such as Supabase/Firebase and a secure Outlook Microsoft Graph OAuth integration (with delegated calendar permissions). Apple Calendar direct writes would need a native iOS bridge; `.ics` is the broadly compatible website-based approach. Potential product improvements include dependent/parallel branches, drag-reorder, task attachments, recurring tasks, and reminders.

## Project files

| File | Purpose |
|---|---|
| `index.html` | Accessible app shell and bottom navigation |
| `styles.css` | Responsive iPhone-first design |
| `app.js` | Goals, task plan, task cards, calendar, storage, exports |
| `manifest.webmanifest` | iPhone/PWA install metadata |
| `sw.js` | Offline cache for static app files |
| `assets/icon-192.png`, `assets/icon-512.png` | App icons |

No third-party JavaScript dependencies, analytics, trackers, accounts or external database are required. The only external page opened by the application is Outlook when you explicitly choose that calendar action.
