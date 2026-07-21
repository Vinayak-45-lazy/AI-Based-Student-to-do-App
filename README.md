# 🎓 StudyFlow AI : An AI-Powered Student Productivity Platform

A full-stack web application that helps students manage assignments, deadlines, and study time using **AI-driven prioritization and planning**.

---

## 📌 Project Overview

StudyFlow AI turns a student's messy task list into a clear, prioritized study plan.

Whenever a task is added:
* 📝 It's stored against the student's account
* 🤖 The AI Planner analyzes deadlines, priority, and estimated time
* 📅 A recommended study order is generated automatically
* 💬 An AI Study Assistant is available for techniques, revision plans, and productivity tips

👉 Goal: Reduce decision fatigue for students and make **"what should I study next?"** an instant, AI-answered question.

---

## 🧠 Key Features

* ⚙️ Full task management (create, edit, delete, status, priority, tags)
* 🤖 AI Smart Planner — auto-prioritizes tasks and estimates study time
* 💬 AI Study Assistant — chat-based help, study techniques, revision plans
* 📊 Analytics dashboard — productivity score, study hours, subject breakdown
* 📅 Calendar view for deadlines
* 📝 Notes section with task linking
* 🎙️ Voice input for quick task creation
* 🌗 Dark/Light mode, glassmorphism UI
* 📱 PWA support (installable, offline-ready shell)

---

## 🏗️ Architecture

```
Student → React Frontend (Vite)
        ↓
Express.js REST API
        ↓
Task / User / Notes Data → SQLite (via Sequelize)
        ↓
AI Planner Route → Groq LLM API
        ↓
        ├── AI available → Smart-ranked schedule
        └── AI unavailable → Local fallback scoring algorithm
        ↓
Response → Rendered Study Plan / Chat Reply
```

---

## 🛠️ Tech Stack

* **Frontend:** React (Vite), custom CSS (glassmorphism design)
* **Backend:** Node.js, Express.js
* **Database:** SQLite via Sequelize ORM
* **AI:** Groq API (LLaMA 3.3 70B) with local fallback scheduling
* **Auth:** JWT-based authentication
* **Hosting:** Render (backend) + Vercel (frontend)
* **Version Control:** Git + GitHub

---

## 📂 Project Structure

```
Gemini/
├── client/                 # React (Vite) frontend
│   ├── src/
│   │   ├── components/     # Header, Sidebar, Modal, VoiceInput
│   │   ├── pages/          # Dashboard, Tasks, Planner, AIAssistant, etc.
│   │   └── utils/api.js    # API client with offline fallback
│   └── public/             # PWA assets (manifest, service worker)
├── server/                 # Express backend
│   ├── config/database.js  # Sequelize/SQLite config
│   ├── middleware/auth.js  # JWT auth middleware
│   ├── models/              # User, Task, Note, StudySession
│   └── routes/               # auth, tasks, ai, notes, analytics, profile
└── README.md
```

---

## 🔄 How the AI Planner Works

### 1. Collect Active Tasks
* Fetches all tasks with status `pending` or `in_progress` for the logged-in user

### 2. Attempt AI Prioritization
* Sends task data (title, subject, priority, due date, estimated time) to the Groq API
* AI returns the optimal completion order based on urgency, priority, and momentum

### 3. Local Fallback
* If the AI call fails (rate limit, network, missing key), a local weighted-scoring formula ranks the tasks instead
* Ensures the feature **never fully breaks**, even without AI access

---

## 🌐 Live Application

* 🏠 Frontend: *https://ai-based-student-to-do-app.vercel.app*
* 🔧 Backend API: *https://ai-based-student-to-do-app.onrender.com*
* 📊 Health Check: *https://ai-based-student-to-do-app.onrender.com/api/health*

---

## 🚀 How to Run Locally

```bash
git clone https://github.com/Vinayak-45-lazy/AI-Based-Student-to-do-App.git
cd AI-Based-Student-to-do-App

# install dependencies
cd server && npm install
cd ../client && npm install

# add environment variables
# server/.env → PORT, JWT_SECRET, GROQ_API_KEY

# run both frontend and backend
cd ..
npm run dev
```

---

## 📌 Future Improvements

* Migrate from SQLite to a persistent hosted database (Postgres)
* Add Google Sign-In and Forgot Password flow
* Add PDF export for task lists
* Add real push notifications for deadline reminders
* Add drag-and-drop calendar rescheduling

---

## 👨‍💻 Author

**Vinayak**
Building AI-powered productivity tools

---

## ⭐ Why This Project Stands Out

* Combines practical task management with real LLM-powered decision-making
* Designed with graceful degradation — AI failures never break core functionality
* Full deployment pipeline from local development to live hosting (Render + Vercel)
* Clean separation of frontend, backend, and AI logic for easy extension

---

> 💡 This project shows how to design AI features that enhance an app without becoming a single point of failure — the app stays fully usable even when the AI layer is unavailable.
