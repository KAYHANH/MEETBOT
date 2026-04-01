# MeetBot

MeetBot is a full-stack meeting automation app built with React, Vite, Express, MongoDB, and Google APIs. It can run in two modes:

- Demo mode: no Google login or MongoDB required, ideal for GitHub reviewers
- Full mode: real Google OAuth, Gmail sending, Calendar events, and MongoDB persistence
- Attendance sync: capture Google Meet join and leave activity, plus participant session durations, when the live workspace is connected

## Safe GitHub Setup

- The repository should only include `.env.example`, never your real `.env`
- Rotate any Google client secret, MongoDB password, or other credential that was ever shared
- Reviewers can use demo mode and do not need your private credentials

## Quick Start: Demo Mode

```powershell
copy .env.example .env
npm install
npm run dev
```

Open `http://localhost:3000/auth` and click `View Demo`.

Demo mode uses local mock meetings, logs, attendance data, and settings so users can explore the product right after cloning the repo.

## Full Setup: Google + MongoDB

Update `.env` and set:

```env
DEMO_MODE=false
VITE_DEMO_MODE=false
MONGODB_URI=...
JWT_SECRET=...
TOKEN_ENCRYPTION_KEY=...
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/google/callback
```

Then run:

```powershell
npm install
npm run dev
```

If you already signed in before pulling the latest version, sign out and sign back in once so Google can grant the extra Meet read access used for attendance tracking.

## Features

- Google OAuth login
- Google Calendar event creation with Meet links
- Gmail invitation, reminder, and cancellation emails
- Meeting dashboard, logs, and settings
- Join and leave activity logs for Google Meet participants
- Attendance timeline on each meeting card showing who joined and how long they stayed
- Background reminder scheduler
- Demo mode with local mock data

## Tech Stack

- Frontend: React 19 + Vite
- Backend: Express
- Database: MongoDB + Mongoose
- Integrations: Google Calendar API, Gmail API, and Google Meet attendance sync

## Project Structure

```text
src/                 Frontend UI
server/              Express routes, models, services, jobs
server.ts            Unified dev server entrypoint
```

## Validation

```powershell
npm run lint
npm run build
```

## Notes

- Demo mode skips external dependencies so the UI can be reviewed safely from GitHub
- Full mode requires Google OAuth client configuration and a reachable MongoDB deployment
- Full mode attendance tracking depends on the Google account granting Meet read access during OAuth
- `.env` is ignored by git; keep secrets there and only commit `.env.example`
