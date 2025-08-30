# ArchiTech - TikTok Tech Jam 2025

# Problem Statement Choosen 
(4) Building UI for the AI Era with Lynx
The rise of LLMs, agents, and AI systems is transforming how we interact with technology. From chatbots to AI-powered tools, a new wave of UI patterns is emerging to meet the demands of this AI Era.
This track invites you to use Lynx, the newly open-sourced cross-platform UI technologies that power TikTok, to build products or prototypes that explore how AI is reshaping UI, UX and app experiences. 

# Rspeedy Project

This is a **ReactLynx** project bootstrapped with `create-rspeedy`.

---

## 📌 Overview

**TikTok AI Content Copilot** helps creators keep up with trends, generate engaging captions, and maintain consistency.

Built with **Lynx (frontend)** and **FastAPI + SQLite (backend)**, it provides AI-powered caption suggestions, trend insights, and confirmation flows in a TikTok-style UI.

---

## 🚀 Getting Started (Frontend)

### Install dependencies
```bash
cd Lynx
npm install
```

### Run development server
```bash
npm run dev
```

Scan the QR code in the terminal with your LynxExplorer App to view the app.

You can start editing the page by modifying `src/App.tsx`. The page auto-updates as you edit the file.

---

## ⚙️ Backend Setup (Python FastAPI)

### 1. Install dependencies
```bash
cd Lynx/backend/creator-memory-service
pip install -r requirements.txt
```

### 2. Run backend server
```bash
uvicorn app.main:app --reload --port 7002
```

The backend will be running at:
👉 **http://127.0.0.1:7002**

### 3. API Documentation
Swagger API docs:
👉 **http://127.0.0.1:7002/docs#/default**

### 4. Insert Test Data
To seed test creators, preferences, and memories:

```bash
# Make sure you're in the creator-memory-service directory
cd Lynx/backend/creator-memory-service

# Run seeder
python -m app.seed_test_data
```

---

## 🎬 Backend Setup (Node.js Service)

This service handles video uploads and mock AI caption generation.

### 1. Install dependencies
```bash
cd Lynx/backend
npm install
```

### 2. Run backend server
```bash
node server.js
```

The Node.js backend will be running at:
👉 **http://localhost:3001**

---

## 📚 Features

- **TikTok-style UI** with Lynx for captions & preview cards
- **AI caption & hashtag suggestions** with mock/demo data
- **Personalized memory storage** (creators, captions, preferences)
- **Video upload & caption generator** (Node.js service with Express + Multer)
- **Analytics** with inline hashtag insights

---

## 🔌 APIs

### FastAPI (Python Backend)
- `GET /healthz` → health check
- `GET /docs` → interactive Swagger docs
- `GET /analytics/inline?creator_id=...` → inline analytics for creators
- `POST /personalize/suggestions` → caption/hashtag suggestions

### Node.js Service (Video Upload)
- `POST /api/upload-video` → upload a video file
- `POST /api/generate-captions` → generate AI captions (mock)
- `GET /api/video/:id` → fetch video info
- `GET /api/debug/videos` → list all uploaded videos

---

## 🛠 Tech Stack

### Frontend
- **Lynx / ReactLynx**
- **Tailwind CSS**
- **Axios**

### Backend (Python)
- **FastAPI**
- **Uvicorn**
- **SQLite**
- **SQLAlchemy**
- **Pydantic**
- **Python-Multipart**

### Backend (Node.js)
- **Express.js**
- **Multer**
- **CORS**
- **Path, FS**

---

## 🎨 Assets

- **Custom icons & mock illustrations** (TikTok-style UI)
- **Demo video files** stored in `/uploads`
- **Mock captions** with emojis & hashtags for testing
- **Typography:** Tailwind defaults + Google Fonts
