# Wimaan AI Voice Interview — Frontend

React app for conducting AI voice interviews. The user enters their name and selects a category/module, starts a call via the **VAPI** web SDK, speaks with an AI interviewer, and when the call ends the app submits the transcript to the backend for scoring and shows the result.

---

## File structure

```
frontend/
├── index.html              # Entry HTML; root div and script to main.jsx
├── package.json            # Dependencies: React, Vite, @vapi-ai/web, Tailwind
├── vite.config.js          # Vite + React + Tailwind; proxies /api → backend (localhost:3000)
├── eslint.config.js        # ESLint rules
├── public/                 # Static assets (e.g. vite.svg)
├── src/
│   ├── main.jsx            # React root: mounts <App /> into #root
│   ├── index.css           # Global styles (Tailwind imports)
│   ├── App.jsx             # Root component: screen (Setup vs Interview), calls useVapi + API
│   ├── components/         # UI components
│   │   ├── SetupForm.jsx   # Form: name, category, module → onStart(formData)
│   │   ├── InterviewRoom.jsx# Call UI: duration, mute, transcript, end/leave; results screen
│   │   └── TranscriptPanel.jsx  # Live transcript list (Assistant / User bubbles)
│   ├── hooks/
│   │   └── useVapi.js      # VAPI SDK: start/stop call, transcript state, submit on end
│   ├── services/
│   │   └── api.js         # Backend API: startInterview(), submitInterviewResult(), generateUserId()
│   └── assets/             # Images (e.g. react.svg)
└── README.md               # This file
```

---

## What each part does

| File / folder | Purpose |
|---------------|--------|
| **main.jsx** | Boots the app: loads `index.css`, renders `<App />` in strict mode. |
| **App.jsx** | Holds screen state (Setup vs Interview). Calls `startInterview(formData)` to get VAPI config, then `startCall(assistantConfig)`. Passes VAPI state (status, transcript, finalResult, etc.) and handlers (end call, leave) to `InterviewRoom` or shows `SetupForm`. Shows API errors in a toast. |
| **SetupForm.jsx** | Collects name, category, module. Validates, generates `userId` via `generateUserId()`, calls `onStart({ userId, name, category, module })`. |
| **InterviewRoom.jsx** | During call: top bar (duration, mute, end call, leave), main area, and `TranscriptPanel`. When call ended and `finalResult` exists: shows score (0–100), summary, and “Start New Interview”. When ended without result: shows “Interview Ended” and “Return to Home”. |
| **TranscriptPanel.jsx** | Renders the `transcript` array as chat bubbles (Assistant left, User right). Auto-scrolls to bottom when transcript updates. |
| **useVapi.js** | Custom hook that wraps the VAPI web SDK. Creates the VAPI client once, subscribes to `call-start`, `call-end`, `message` (transcript), `speech-start/end`, `error`. On start: generates `callId`, stores `assistantConfig.metadata` in refs, clears transcript. On each `message` with `type: 'transcript'`: appends to `transcript` state (and keeps a ref in sync). On `call-end`: sets status to ENDED; a `useEffect` then (after 400 ms) builds a single transcript string, calls `submitInterviewResult()` with `callId`, metadata, transcript, and sets `finalResult` from the response. Exposes: `status`, `transcript`, `finalResult`, `startCall`, `stopCall`, `toggleMute`, etc. |
| **api.js** | `startInterview({ userId, name, category, module })`: POSTs to `POST /interview/start`, returns `assistantConfig`. `submitInterviewResult({ callId, userId, category, module, transcript, endedReason })`: POSTs to `POST /interview/submit`, returns `{ score, summary }`. `generateUserId()`: returns a unique string for the session. Uses `VITE_API_URL` or `/api` (proxy in dev). |
| **vite.config.js** | React + Tailwind plugins; dev server proxies `/api` to `http://localhost:3000` so the frontend can call the backend without CORS when using the default `/api` base. |

---

## How it works (end-to-end flow)

1. **Setup**  
   User opens the app → sees `SetupForm`. They enter name, choose category and module, click Start.  
   `App` calls `startInterview(formData)` → backend returns VAPI assistant config (with system prompt, voice, metadata: userId, category, module).  
   `App` stores candidate info, switches to Interview screen, and calls `startCall(assistantConfig)`.

2. **Call**  
   `useVapi` passes the config to the VAPI SDK and starts the call. The SDK handles microphone, AI voice, and transcription.  
   Each utterance (user or assistant) arrives as a `message` with `type: 'transcript'`; the hook appends it to `transcript` state and keeps `transcriptRef` in sync.  
   `InterviewRoom` shows duration, mute, live transcript (`TranscriptPanel`), and End call / Leave.

3. **End of call**  
   User (or system) ends the call → VAPI fires `call-end` → hook sets status to `ENDED`.  
   A `useEffect` runs when status is ENDED: after 400 ms it builds one string from `transcriptRef` (e.g. `"Assistant: ...\nUser: ..."`), then POSTs to `POST /interview/submit` with `callId`, `userId`, `category`, `module`, `transcript`, `endedReason`.  
   Backend evaluates the transcript and returns `{ score, summary }`. The hook sets `finalResult` (and shows an error state if the request fails).

4. **Results**  
   `InterviewRoom` sees `finalResult` and shows the “Interview Complete!” screen with score (0–100), summary, and “Start New Interview”.  
   “Start New Interview” (or “Return to Home”) calls `onLeave` → `App` goes back to Setup and clears state.

So: the frontend **always** has the transcript in memory during the call; when the call ends it sends that transcript to the backend once. Scoring and storage happen in the backend; the frontend only displays the returned score and summary.

---

## Environment variables

Create a `.env` in the frontend root (or use `.env.local`). Vite exposes only variables prefixed with `VITE_`.

| Variable | Purpose |
|----------|--------|
| `VITE_VAPI_PUBLIC_KEY` | Required. Public API key for the VAPI web SDK (voice + transcription). |
| `VITE_API_URL` | Optional. Backend base URL (e.g. `http://localhost:3000`). If unset, the app uses `/api` and the Vite proxy forwards to `http://localhost:3000` in development. |

---

## Configuration

**Modules (e.g. Module 1, Module 2)**  
Edit the `MODULES` array in [src/components/SetupForm.jsx](src/components/SetupForm.jsx). Add entries like `{ value: '2', label: 'Module 2' }`. After adding a module, run knowledge ingestion for that module in the backend (e.g. `backend/ingestion.ipynb`) so the interviewer has content for it.

**Category URL slugs (e.g. /call-center, /sales)**  
Edit `CATEGORY_SLUG_MAP` in [src/components/InterviewFlow.jsx](src/components/InterviewFlow.jsx). Keys are the URL path (e.g. `'call-center'` → `/call-center`); values are the backend category id (e.g. `'call_center'`). To add a category: add a new key-value pair. To remove: delete the line. Invalid slugs redirect to `/call-center`. Current slugs: `call-center`, `sales`, `support`.

---

## Running locally

1. Install dependencies: `npm install`
2. Set `VITE_VAPI_PUBLIC_KEY` in `.env` (and optionally `VITE_API_URL` if the backend is not on port 3000).
3. Start the backend (see backend README) so `POST /interview/start` and `POST /interview/submit` are available.
4. Start the frontend: `npm run dev` — app is at `http://localhost:5173`.
5. Use “Start Your Interview” with name, category, and module. After the call ends, you should see the score and summary from the backend.

Build for production: `npm run build`. Preview build: `npm run preview`.

---

## Tech stack

- **React 19** — UI and state.
- **Vite 7** — dev server, build, and `/api` proxy.
- **Tailwind CSS 4** — styling.
- **@vapi-ai/web** — voice call and real-time transcript from VAPI.

The backend provides interview configuration and evaluation; see the backend README for API and scoring details.
