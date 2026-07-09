<div align="center">
  <img src="https://img.shields.io/badge/Status-Live-brightgreen.svg" alt="Live Status" />
  <img src="https://img.shields.io/badge/Stack-MERN%20%2B%20Python-blue.svg" alt="Tech Stack" />
  <img src="https://img.shields.io/badge/License-MIT-blue.svg" alt="License" />

  <h1>(Jarvis AI)</h1>
  <p>A full-stack, voice-activated AI assistant featuring a <strong>React UI</strong>, a <strong>Node.js/Express Backend</strong>, real-time <strong>WebSockets</strong>, and a custom <strong>Local Python NLP Engine</strong> for OS-level automation.</p>
  
  <h3>
    <a href="https://ai-assistant-lyart-eight.vercel.app"> View Live Demo Here</a>
  </h3>
</div>

---

## Overview
QuickGPT is not just a chat interface. It is a multi-service architecture designed to mimic a real "Jarvis" experience. It uses cloud AI (Gemini) for conversational intelligence, but pairs it with a **Local Python Agent** that connects via WebSockets to execute system commands, control media, launch apps, and speak via native Windows TTS.

##  Architecture (4 Microservices)

This project is broken down into four distinct, highly-decoupled services:

| Component | Tech Stack | Purpose |
|---|---|---|
| Frontend| React 19, Vite, Tailwind, Spline 3D | Chat UI, Voice dictates (Speech-to-Text), UI animations |
| REST API| Express 5, MongoDB, Mongoose | Authentication (JWT), Chat History, Stripe Payments, Gemini AI fallback |
| WebSocket Relay| Socket.IO, Express | Real-time bi-directional relay between the Frontend and the Local Agent |
| Local Agent | Python, Scikit-Learn NLP, PowerShell | Runs locally to detect intents, open apps, shut down PC, and talk back via native TTS |

---

## Core Features

- ** Always-on Voice Mode**: Uses Web Speech API for continuous dictation. Wake words ("Hey Jarvis") trigger background commands.
- ** Custom NLP Engine**: Uses `scikit-learn` and TF-IDF vectorization to detect intents (e.g. "open notepad", "what's the weather") locally before ever sending data to the cloud.
- ** Credit System & Stripe**: Integrated Stripe webhooks to manage user credits for text and image generations.
- ** Native Text-to-Speech**: The local Python agent utilizes Windows PowerShell `System.Speech` for zero-latency, offline voice synthesis.
- ** Secure Authentication**: JWT-based auth with MongoDB persistence.

---

## Live Links

- **Frontend App**: [https://ai-assistant-lyart-eight.vercel.app](https://ai-assistant-lyart-eight.vercel.app)
- **REST API (Render)**: `https://quickgpt-api.onrender.com`
- **WS Server (Render)**: `https://quickgpt-ws.onrender.com`

> **Note**: To use the OS-level commands (like "open notepad", "play music"), you must clone this repo and run the Python Agent (`agent/agent.py`) locally on your Windows machine while connected to the live web app!

---

## Running Locally

To run the full stack on your local machine:

**1. Clone the repository**
```bash
git clone https://github.com/sydwahid/AI-Assistant.git
cd AI-Assistant
```

**2. Setup Environment Variables**
Copy the `.env.example` files in both `server` and `ws-server` to `.env` and fill in your MongoDB URI, JWT Secret, and Gemini API keys.

**3. Install Dependencies & Start (Using the provided launcher)**
If you are on Windows, simply double-click:
- `Launch QuickGPT.bat` 
This will automatically open 4 terminal windows and start the Frontend, REST API, WS-Server, and the Python Agent simultaneously.

---

## Author

Developed by **Wahid**  
GitHub: [sydwahid](https://github.com/sydwahid)
