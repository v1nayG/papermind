# PaperMind

> Autonomous Multi-Agent AI Research Platform

[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=flat-square&logo=node.js)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=flat-square&logo=mongodb)](https://www.mongodb.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-06B6D4?style=flat-square&logo=tailwindcss)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](LICENSE)

---

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Features](#features)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Project Structure](#project-structure)
- [API Reference](#api-reference)

---

## Overview

PaperMind is a full-stack AI research platform that goes beyond a standard chatbot. Instead of relying on a single LLM's pre-trained knowledge, it orchestrates a **multi-agent pipeline** that actively searches the web, extracts and reads page content in real time, and synthesizes a deeply cited, professional-quality report — all in a single user interaction.

The research process is streamed live to the user via **Server-Sent Events (SSE)**, providing granular real-time progress updates across all four pipeline stages.

---

## Architecture

The system is built as a four-stage autonomous agent pipeline:

```
User Prompt
    │
    ▼
┌─────────────┐     Generates 4 targeted
│ Planner     │ ──► search queries from
│ Agent       │     the research topic
└─────────────┘
    │
    ▼
┌─────────────┐     Concurrently runs all queries
│ Search &    │ ──► via Serper API + parallel
│ Scrape      │     image search (5 images)
└─────────────┘
    │
    ▼
┌─────────────┐     Summarizes each scraped
│ Summarizer  │ ──► source via LLM (throttled
│ Agent       │     to 3 concurrent LLM calls)
└─────────────┘
    │
    ▼
┌─────────────┐     Synthesizes all summaries
│ Synthesizer │ ──► into a cited, illustrated
│ Agent       │     1000+ word final report
└─────────────┘
    │
    ▼
Streamed Report (SSE) → React Frontend
```

---

## Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| React 18 | UI framework |
| Vite | Build tool & dev server |
| Tailwind CSS v4 | Styling |
| React Router v7 | Client-side routing |
| React Markdown + remark-gfm | Markdown & table rendering |
| Lucide React | Icon system |
| Framer Motion | Animations |
| Space Grotesk / Sora | Typography (Google Fonts) |

### Backend
| Technology | Purpose |
|---|---|
| Node.js + Express | REST API & SSE server |
| MongoDB + Mongoose | Session & user data persistence |
| JSON Web Tokens (JWT) | Authentication & refresh token flow |
| Axios | HTTP client for external APIs |
| Cheerio / Custom Scraper | Web content extraction |
| OpenRouter API | LLM gateway (`gpt-oss-20b`) |
| Serper API | Google Search + Image Search |

---

## Features

- **Multi-Agent Pipeline** — Four specialized AI agents working in sequence: Planner, Searcher, Summarizer, and Synthesizer.
- **Concurrent Processing** — All search queries and scraping tasks are executed in parallel using `Promise.all`, minimizing latency.
- **URL Deduplication** — Duplicate search results are eliminated before scraping to prevent redundant LLM calls and reduce API costs.
- **Image Integration** — A concurrent image search (Serper Images API) fetches relevant photos that are embedded directly into the generated Markdown report.
- **Real-Time Streaming (SSE)** — Granular execution telemetry is streamed to the client via Server-Sent Events, keeping the user informed at every stage.
- **Source Conflict Detection** — The synthesizer agent is explicitly instructed to identify and flag contradictions between sources.
- **Inline Citations** — Every major claim in the report is backed by a `[n]` citation linked to the original source.
- **Export to PDF & Markdown** — Users can download the generated report in their preferred format.
- **JWT Authentication** — Secure user accounts with access tokens and a silent refresh bridge for seamless session management.
- **Session History** — All research sessions are persisted in MongoDB and accessible from the sidebar.

---

## Getting Started

### Prerequisites
- Node.js v18+
- MongoDB (local instance or MongoDB Atlas URI)
- [OpenRouter](https://openrouter.ai/) API key (free tier available)
- [Serper](https://serper.dev/) API key (free tier: 2,500 searches)

### Installation

**1. Clone the repository**
```bash
git clone https://github.com/v1nayG/papermind.git
cd papermind
```

**2. Install backend dependencies**
```bash
cd backend
npm install
```

**3. Install frontend dependencies**
```bash
cd ../frontend
npm install
```

**4. Configure environment variables**

Create a `.env` file inside the `backend/` directory (see [Environment Variables](#environment-variables)).

**5. Start the development servers**

In one terminal:
```bash
cd backend && npm run dev
```

In another terminal:
```bash
cd frontend && npm run dev
```

**6. Open the app**

Navigate to [http://localhost:5173](http://localhost:5173)

---

## Environment Variables

Create a file at `backend/.env` with the following variables:

```env
# Server
PORT=5000

# MongoDB
MONGO_URI=mongodb://localhost:27017/papermind

# JWT
JWT_SECRET=your_jwt_secret_key
JWT_REFRESH_SECRET=your_jwt_refresh_secret_key

# OpenRouter (LLM Gateway)
OPENROUTER_API_KEY=sk-or-v1-...

# Serper (Google Search API)
SERPER_API_KEY=your_serper_api_key
```

---

## Project Structure

```
papermind/
├── backend/
│   ├── agents/
│   │   ├── plannerAgent.js       # Generates search queries from topic
│   │   ├── summarizerAgent.js    # Summarizes individual scraped sources
│   │   └── synthesizerAgent.js   # Writes the final cited report
│   ├── controllers/
│   │   └── researchController.js # Orchestrates the full pipeline + SSE streaming
│   ├── middleware/
│   │   └── authMiddleware.js     # JWT verification
│   ├── models/
│   │   ├── User.js               # User schema
│   │   └── Session.js            # Research session schema
│   ├── routes/
│   │   ├── authRoutes.js
│   │   └── researchRoutes.js
│   ├── services/
│   │   ├── llmService.js         # OpenRouter API wrapper
│   │   ├── searchService.js      # Serper web + image search
│   │   └── scraperService.js     # Web content extraction
│   └── server.js
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── ProgressBar.jsx   # Real-time pipeline stage indicator
    │   │   ├── ReportView.jsx    # Markdown report renderer with sources
    │   │   ├── Sidebar.jsx       # Session history panel
    │   │   └── ui/               # Reusable UI primitives (Button, etc.)
    │   ├── context/
    │   │   └── AuthContext.jsx   # Global auth state + token refresh
    │   ├── pages/
    │   │   ├── HeroPage.tsx      # Landing page
    │   │   ├── AuthPage.jsx      # Login / Register
    │   │   └── ResearchPage.jsx  # Main research chat interface
    │   ├── services/
    │   │   └── api.js            # Axios API client
    │   └── index.css             # Tailwind theme + global styles
    └── index.html
```

---

## API Reference

### Authentication

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/register` | Register a new user |
| `POST` | `/api/auth/login` | Login and receive JWT tokens |
| `POST` | `/api/auth/refresh` | Refresh the access token |

### Research

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/research/start` | Start a research session (SSE stream) |
| `GET` | `/api/research/history` | Get all sessions for the current user |
| `GET` | `/api/research/session/:id` | Get a specific session by ID |
| `GET` | `/api/research/export/pdf/:id` | Export session report as PDF |
| `GET` | `/api/research/export/markdown/:id` | Export session report as Markdown |

---

## License

Distributed under the MIT License. See `LICENSE` for more information.
