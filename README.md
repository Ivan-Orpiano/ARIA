<div align="center">

<!-- ═══════════════════════════════════════════════════════════════ -->
<!--                     ANIMATED HEADER BANNER                     -->
<!-- ═══════════════════════════════════════════════════════════════ -->

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:3DFFC0,50:00B4D8,100:0A0E1A&height=220&section=header&text=ARIA&fontSize=90&fontColor=ffffff&fontAlignY=38&desc=AI%20Secretary%20Assistant&descAlignY=58&descSize=22&descColor=3DFFC0&animation=twinkling" width="100%"/>

<!-- ═══════════════════════════════════════════════════════════════ -->
<!--                     ANIMATED TYPING LINE                       -->
<!-- ═══════════════════════════════════════════════════════════════ -->

<a href="https://git.io/typing-svg">
  <img src="https://readme-typing-svg.demolab.com?font=Syne&weight=700&size=22&duration=3000&pause=1000&color=3DFFC0&center=true&vCenter=true&multiline=false&width=600&lines=Your+Intelligent+AI+Secretary+%E2%9C%A6;Powered+by+Google+Gemini+%2B+FastAPI;Integrated+with+n8n+Workflows;Built+with+React.js;Chat+%7C+Upload+%7C+Automate" alt="Typing SVG" />
</a>

<br/>

<!-- ═══════════════════════════════════════════════════════════════ -->
<!--                          BADGES ROW                            -->
<!-- ═══════════════════════════════════════════════════════════════ -->

<p>
<!-- React -->
<img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black&labelColor=0D1225" />

<!-- Gemini -->
<img src="https://img.shields.io/badge/Google%20Gemini-2.5%20Flash-8E75B2?style=for-the-badge&logo=googlegemini&logoColor=white&labelColor=0D1225" />

<!-- FastAPI -->
<img src="https://img.shields.io/badge/FastAPI-Backend-009688?style=for-the-badge&logo=fastapi&logoColor=white&labelColor=0D1225" />

<!-- n8n -->
<img src="https://img.shields.io/badge/n8n-Workflow-EA4B71?style=for-the-badge&logo=n8n&logoColor=white&labelColor=0D1225" />
</p>

</div>

---

<!-- ═══════════════════════════════════════════════════════════════ -->
<!--                        WHAT IS ARIA?                           -->
<!-- ═══════════════════════════════════════════════════════════════ -->

<div align="center">

## ✦ What is ARIA?

</div>

**ARIA** *(Adaptive Reasoning & Intelligent Assistant)* is a modern, full-stack AI Secretary that combines **Google Gemini**, a **FastAPI** backend with a built-in **RAG pipeline**, and **n8n** no-code automation — all wrapped in a sleek **React.js** front-end.

Send messages, upload documents, and let ARIA handle the heavy lifting: drafting emails, summarizing files, answering questions grounded in your own documents, delivering daily briefings, and executing automated workflows — all in one seamless interface.

---

<!-- ═══════════════════════════════════════════════════════════════ -->
<!--                           FEATURES                             -->
<!-- ═══════════════════════════════════════════════════════════════ -->

## ⚡ Features

<table>
<tr>
<td width="50%">

### 🤖 AI-Powered Chat
- Conversational interface powered by **Google Gemini 2.5 Flash**
- Session-aware conversation memory
- Real-time typing indicator
- Graceful degradation when the LLM is unavailable

</td>
<td width="50%">

### 📚 RAG Knowledge Base
- Document ingestion with token-aware chunking
- **Chroma** persistent vector store (or in-memory)
- Hybrid retrieval: dense embeddings + lexical fusion (RRF)
- Gemini embeddings (`gemini-embedding-001`)

</td>
</tr>
<tr>
<td width="50%">

### 📎 File Intelligence
- Upload PDFs, DOCX, XLSX, images & more
- Drag-and-drop support
- File preview chips with type icons
- Up to 5 files per message, 20 MB each

</td>
<td width="50%">

### ⚙️ n8n Automation
- Webhook-triggered workflows
- Email delivery, document delivery & daily digests
- Extensible to 400+ integrations
- Five ready-made workflow exports included

</td>
</tr>
<tr>
<td width="50%">

### 🗞️ Daily Briefings
- Stock market snapshot (Yahoo Finance symbols)
- Local weather forecast (Open-Meteo)
- Sports league updates (TheSportsDB)
- Surfaced as welcome-screen suggestions

</td>
<td width="50%">

### 🎨 Modern UI/UX
- Dark neon design system
- Animated welcome screen
- Suggestion chips for quick starts
- Fully responsive (mobile + desktop)

</td>
</tr>
</table>

---

<!-- ═══════════════════════════════════════════════════════════════ -->
<!--                         TECH STACK                             -->
<!-- ═══════════════════════════════════════════════════════════════ -->

## 🛠️ Tech Stack

<div align="center">

| Layer | Technology | Purpose |
|:---:|:---:|:---|
| 🖥️ **Frontend** | React.js 19 + React Router 7 | UI framework, routing, component architecture |
| 🐍 **Backend** | FastAPI (Python) | REST API — chat, email & RAG endpoints |
| 🤖 **AI Model** | Google Gemini 2.5 Flash | Language understanding & generation |
| 🧬 **Embeddings** | Gemini Embedding 001 | Dense vectors for retrieval |
| 🗄️ **Vector Store** | ChromaDB | Persistent document knowledge base |
| ⚙️ **Automation** | n8n | Webhook workflows & integrations |
| 🔐 **Auth / Data** | Supabase | Client SDK for auth & storage |
| 🎨 **Styling** | CSS Custom Properties | Design tokens, animations |
| 🔤 **Fonts** | Syne + DM Sans | Display & body typography |

</div>

---

<!-- ═══════════════════════════════════════════════════════════════ -->
<!--                       PROJECT STRUCTURE                        -->
<!-- ═══════════════════════════════════════════════════════════════ -->

## 📁 Project Structure

```
AI-Secretary-Assistant/
├── src/                        # React front-end
│   ├── context/                # Chat & theme providers
│   ├── hooks/                  # useChats, useFileUpload, useAutoScroll
│   ├── services/               # Webhook & email services
│   └── utils/                  # File, date & message helpers
├── backend/                    # FastAPI back-end
│   ├── app/
│   │   ├── clients/            # Gemini API client
│   │   ├── core/               # Settings & configuration
│   │   ├── routers/            # /chat, /email, /rag endpoints
│   │   └── services/           # Chat, LLM, briefing & RAG pipeline
│   ├── scripts/                # Document ingestion & RAG evaluation
│   └── tests/                  # Pytest suite
└── n8n_automations/            # Exported n8n workflows (JSON)
```

---

<!-- ═══════════════════════════════════════════════════════════════ -->
<!--                       N8N AUTOMATIONS                          -->
<!-- ═══════════════════════════════════════════════════════════════ -->

## ⚙️ Included n8n Automations

<div align="center">

| Workflow | Description |
|:---|:---|
| 🤖 **AI Secretary Chatbot** | Gemini-powered LangChain agent with session memory behind a webhook |
| 📧 **Document Delivery Engine** | Detects attachments, downloads PDFs and delivers them via Gmail |
| 🧩 **Multi-Services Provider** | Multi-channel intake with AI classification, sentiment, CRM enrichment, RAG support responses & escalation |
| 🗞️ **AI Daily Global Updates** | Scheduled news digest (RSS, Hacker News, Reddit) curated by an AI editor and emailed as HTML |
| 💰 **Commission Engine** | Validates sales events and computes bonuses, tier progression & velocity tracking |

</div>

---

<!-- ═══════════════════════════════════════════════════════════════ -->
<!--                      FILE UPLOAD GUIDE                         -->
<!-- ═══════════════════════════════════════════════════════════════ -->

## 📎 Supported File Types

<div align="center">

| Category | Formats |
|:---:|:---|
| 📄 **Documents** | PDF, DOC, DOCX, TXT, RTF |
| 📊 **Spreadsheets** | XLS, XLSX, CSV |
| 📋 **Presentations** | PPT, PPTX |
| 🖼️ **Images** | JPG, PNG, GIF, WEBP, SVG |
| 📦 **Archives** | ZIP, RAR |
| ⚙️ **Code** | JSON, JS, HTML, CSS |

</div>

- **Max file size:** 20 MB per file
- **Max files per message:** 5
- Image files show thumbnail previews inline

---

<!-- ═══════════════════════════════════════════════════════════════ -->
<!--                        FOOTER BANNER                           -->
<!-- ═══════════════════════════════════════════════════════════════ -->

<div align="center">

<br/>

**Built with** &nbsp;
<img src="https://img.shields.io/badge/n8n-EA4B71?style=flat-square&logo=n8n&logoColor=white" />
&nbsp;
<img src="https://img.shields.io/badge/React-61DAFB?style=flat-square&logo=react&logoColor=black" />
&nbsp;
<img src="https://img.shields.io/badge/Google%20Gemini-8E75B2?style=flat-square&logo=googlegemini&logoColor=white" />
&nbsp;
<img src="https://img.shields.io/badge/FastAPI-009688?style=flat-square&logo=fastapi&logoColor=white" />

<br/><br/>

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:0A0E1A,50:00B4D8,100:3DFFC0&height=120&section=footer&animation=twinkling" width="100%"/>

</div>
