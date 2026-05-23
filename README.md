# ⚡ PaperMind — AI Research Agent

> Type any topic. Get a full research report in under 60 seconds.

PaperMind is a full-stack AI research agent that autonomously searches the web, reads sources, and synthesizes a structured research report — complete with citations, conflict detection, and export options.

---

## 🧠 How It Works

```
User Input → Planner Agent → Smart Search Queries
                                      ↓
                           Serper Web Search API
                                      ↓
                           Cheerio Source Scraper
                                      ↓
                    Summarizer Agent (per source, parallel)
                                      ↓
                         Synthesizer Agent (final report)
                                      ↓
               Report + Clickable Citations + Conflict Detection
```

**Three separate LLM calls. Each agent has one focused job.**

| Agent | Job |
|---|---|
| 🗂️ Planner | Takes the user's topic → generates 4 targeted search queries covering different angles |
| ✂️ Summarizer | Takes each scraped source → compresses it to fit context window |
| ✍️ Synthesizer | Takes all summaries → writes final report, cites sources, flags contradictions |

---

## ✅ Current Features (v1.0)

- **Topic input** with Report / Bullet summary mode toggle
- **Live 4-stage progress bar** (Searching → Reading → Summarizing → Synthesizing) via SSE streaming
- **Final report** rendered as formatted markdown
- **Clickable citations** linking back to original sources
- **Conflict detection** — highlights when sources contradict each other
- **JWT authentication** — register and login
- **Per-user research history** — all sessions saved to MongoDB
- **View past sessions** — click any history entry to reload the full report
- **Export to Markdown** — download your report as a `.md` file
- **Export to PDF** — download your report as a formatted `.pdf` file
- **Rate limiting** — prevents API abuse
- **Source deduplication** — same URL from multiple queries only scraped once

---

## 🚀 Future Roadmap (v2.0+)

### 🔬 Research Quality
- [ ] **Depth control** — Quick (4 sources) vs Deep (12+ sources) research modes
- [ ] **Re-research button** — Run the pipeline again with a fresh set of sources
- [ ] **Source quality scoring** — Rank sources by domain authority and relevance
- [ ] **Highlight most-used sources** — Show which sources contributed most to the final report
- [ ] **Follow-up questions** — Ask clarifying questions about the generated report
- [ ] **Research branching** — Expand a specific section with deeper research

### 🤖 Agent Improvements
- [ ] **Model selection per agent** — Let users choose which LLM powers each stage
- [ ] **Agent memory** — Reference earlier sessions for related topics
- [ ] **Multi-language support** — Research and report in any language
- [ ] **Academic mode** — Prioritize peer-reviewed papers and journal articles (via Semantic Scholar / ArXiv APIs)

### 🎨 UI / UX
- [ ] **Real-time source cards** — Show each source appearing live as it's scraped
- [ ] **Report editor** — Edit and annotate the generated report in-browser
- [ ] **Dark/light mode toggle**
- [ ] **Shareable report links** — Public URL for any completed research session
- [ ] **Folder/tag organization** — Group sessions by project or topic

### 📤 Export & Integrations
- [ ] **Export to Notion** — Push reports directly to a Notion page
- [ ] **Export to Google Docs**
- [ ] **Webhook support** — Trigger research via API call (headless mode)
- [ ] **Browser extension** — Research any page you're reading instantly

### ⚙️ Infrastructure
- [ ] **Background job queue** (Bull/BullMQ) — Run research pipelines async, notify when done
- [ ] **Redis caching** — Cache search results for repeated queries
- [ ] **User dashboard** — Usage stats, token consumption, session count
- [ ] **Team workspaces** — Share research history across a team
- [ ] **Subscription tiers** — Free (3 searches/day) vs Pro (unlimited)

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React + Vite |
| Styling | Vanilla CSS (custom design system) |
| Routing | React Router v6 |
| Backend | Node.js + Express |
| Database | MongoDB + Mongoose |
| Auth | JWT + bcryptjs |
| LLM Provider | OpenRouter API |
| Web Search | Serper API |
| Scraping | Axios + Cheerio |
| Streaming | SSE (Server-Sent Events) |
| PDF Export | PDFKit |
| Frontend Deploy | Vercel |
| Backend Deploy | Render |

---

## 📁 Project Structure

```
papermind/
├── backend/
│   ├── agents/
│   │   ├── plannerAgent.js       # Stage 1 — generates search queries
│   │   ├── summarizerAgent.js    # Stage 3 — compresses each source
│   │   └── synthesizerAgent.js   # Stage 4 — writes final report
│   ├── config/
│   │   └── db.js                 # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js     # Register + Login logic
│   │   ├── exportController.js   # PDF + Markdown export
│   │   └── researchController.js # Pipeline orchestrator + SSE
│   ├── middleware/
│   │   └── auth.js               # JWT verification middleware
│   ├── models/
│   │   ├── User.js               # User schema
│   │   └── Session.js            # Research session schema
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── exportRoutes.js
│   │   └── researchRoutes.js
│   ├── services/
│   │   ├── llmService.js         # OpenRouter API wrapper (used by all agents)
│   │   ├── scraperService.js     # Axios + Cheerio web scraper
│   │   └── searchService.js      # Serper search API wrapper
│   ├── .env                      # API keys and config (never commit this)
│   ├── .gitignore
│   ├── package.json
│   └── server.js                 # Express app entry point
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── Navbar.jsx
    │   │   ├── ProgressBar.jsx   # Live 4-stage pipeline progress
    │   │   └── ReportView.jsx    # Report + sources + conflicts + export
    │   ├── context/
    │   │   └── AuthContext.jsx   # Global auth state
    │   ├── pages/
    │   │   ├── LoginPage.jsx
    │   │   ├── RegisterPage.jsx
    │   │   ├── ResearchPage.jsx  # Main page — topic input + SSE stream
    │   │   └── HistoryPage.jsx   # Past sessions viewer
    │   ├── services/
    │   │   └── api.js            # All API calls centralized
    │   ├── App.jsx               # Router + layout
    │   ├── main.jsx
    │   └── index.css             # Full design system (CSS variables + components)
    ├── index.html
    └── package.json
```

---

## ⚙️ Local Setup

### Prerequisites
- Node.js v18+
- MongoDB running locally (`mongodb://localhost:27017`)
- OpenRouter API key → [openrouter.ai](https://openrouter.ai)
- Serper API key → [serper.dev](https://serper.dev)

### 1. Clone the repo
```bash
git clone https://github.com/yourusername/papermind.git
cd papermind
```

### 2. Setup Backend
```bash
cd backend
npm install
```

Create your `.env` file:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/papermind
JWT_SECRET=your_secret_key_here
OPENROUTER_API_KEY=your_openrouter_key_here
SERPER_API_KEY=your_serper_key_here
```

Start the backend:
```bash
npm run dev
```

### 3. Setup Frontend
```bash
cd ../frontend
npm install
npm run dev
```

Open **http://localhost:5173** — the app is live.

---

## 🔌 API Endpoints

### Auth
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Login, returns JWT |
| GET | `/api/auth/me` | Get current user (protected) |

### Research
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/research/start` | Start pipeline, streams SSE (protected) |
| GET | `/api/research/history` | Get user's past sessions (protected) |
| GET | `/api/research/session/:id` | Get a single session (protected) |

### Export
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/export/markdown/:sessionId` | Download report as `.md` (protected) |
| GET | `/api/export/pdf/:sessionId` | Download report as `.pdf` (protected) |

---

## 💡 What Makes This Resume-Worthy

1. **3-stage agent pipeline** — not a single API call. Planner → Summarizer → Synthesizer, each with its own focused prompt and responsibility.
2. **Context window management** — per-source summarization before synthesis. Same pattern used in production RAG systems.
3. **Conflict detection** — cross-source reasoning, not just retrieval.
4. **SSE real-time streaming** — backend pushes live progress to the frontend without WebSockets.
5. **Full production patterns** — JWT auth, rate limiting, MongoDB history, file exports.

---

## 📄 License

MIT — free to use, modify, and deploy.
