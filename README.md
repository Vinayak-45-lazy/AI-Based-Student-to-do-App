# ✨ StudyFlow AI - Student To-Do Web Application

StudyFlow AI is a modern, responsive, and glassmorphic student productivity dashboard. It helps students manage assignments, track focus hours via Pomodoro blocks, visualize progress with interactive SVG charts, reschedule tasks on a calendar, and consult a built-in AI Study Coach.

---

## 🚀 Quick Start Guide

### 1. Install Dependencies
Run the install script from the project root directory:
```bash
npm run install:all
```

### 2. Configure environment variables (Optional)
Open the environment file at [server/.env](file:///c:/Users/Vinayak/Desktop/Gemini/server/.env) and insert your Google Gemini API key to enable real AI scheduling and coach chat:
```env
GEMINI_API_KEY=YOUR_GEMINI_API_KEY
```
*Note: If no API key is provided, the application will automatically switch to a high-fidelity local rules-based fallback engine so you can still test all AI planner and coach features offline.*

### 3. Start Development Servers
Run the concurrent script at the root:
```bash
npm run dev
```
This launches the backend API on [http://localhost:5000](http://localhost:5000) and the Vite/React frontend on [http://localhost:5173](http://localhost:5173).

### 4. Build for Production
To build the static assets which the Express server serves in production mode:
```bash
npm run build
```

---

## 📂 Project Architecture

```
studyflow-ai/
├── package.json                 # Root monorepo workspace runner script
├── README.md                    # This document
├── server/                      # Node.js + Express Backend
│   ├── server.js                # App entry point
│   ├── config/
│   │   └── database.js          # SQLite Sequelize configuration
│   ├── models/                  # Sequelize models
│   │   ├── User.js              # Student details & settings
│   │   ├── Task.js              # Assignment cards
│   │   ├── Note.js              # Lecture notes linked to tasks
│   │   └── StudySession.js      # Pomodoro focus logger
│   └── routes/                  # Express controllers (/api)
│       ├── auth.js              # Sign up, sign in & mock Google OAuth
│       ├── tasks.js             # Task CRUD and voice command parsing
│       ├── notes.js             # Notes CRUD
│       ├── ai.js                # Smart scheduler & chat assistant
│       ├── analytics.js         # Progress stats and focus session logger
│       └── profile.js           # Student preferences updates
└── client/                      # Vite + React Frontend SPA
    ├── public/
    │   ├── manifest.json        # PWA application definitions
    │   └── sw.js                # Offline caching service worker
    └── src/
        ├── main.jsx             # React bootstrapper & SW registerer
        ├── App.jsx              # Application router, state provider & visual shell
        ├── index.css            # Base stylesheet (glassmorphism rules, themes)
        ├── components/          # Reusable components (Sidebar, Header, VoiceInput, Modal)
        ├── utils/
        │   └── api.js           # API wrapper with built-in LocalStorage offline fallback
        └── pages/               # Application sub-pages
            ├── Landing.jsx      # SaaS welcome screen
            ├── Auth.jsx         # Access panels (Login, Register, Forgot)
            ├── Dashboard.jsx    # Pomodoro timer, progress ring & warnings
            ├── Tasks.jsx        # Grid tasks board with PDF agenda compiler
            ├── Calendar.jsx     # Month/Week grids with drag-and-drop rescheduling
            ├── AIAssistant.jsx  # Chat console with study preset instructions
            ├── Analytics.jsx    # SVG bar trends and subject distribution donuts
            ├── Notes.jsx        # WYSIWYG note editor linked to task cards
            └── Profile.jsx      # Goals settings, theme toggles & backups
```

---

## 🛠️ Key Technical Features

1. **Vanilla CSS Glassmorphic Aesthetic:** The visual theme utilizes translucent borders, backdrop filters, glowing shadows, floating neon backgrounds, and transitions for theme toggling (Dark $\leftrightarrow$ Light).
2. **Dual Client-Server Mode:** If the backend Express database server is not running or unreachable, the frontend SPA silently fallbacks to an offline emulated storage layer (`localStorage`), making the app fully interactive immediately.
3. **HTML5 Drag & Drop Calendar:** You can reschedule homework visually by dragging task nodes between days on the monthly/weekly grid.
4. **NLP Voice Input Parser:** Students can speak to create tasks (e.g. *"Add coding task due tomorrow at 9 PM"*). The engine auto-parses the subject, date, priority, and title.
5. **Interactive Pomodoro Clock:** Completed Pomodoro intervals play an audio alert and automatically increment study metrics.
