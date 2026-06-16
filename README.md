<div align="center">

<!-- ═══════════════════════════════════════════════════════════════ -->
<!--                     ANIMATED HEADER BANNER                     -->
<!-- ═══════════════════════════════════════════════════════════════ -->

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:3DFFC0,50:00B4D8,100:0A0E1A&height=220&section=header&text=ARIA&fontSize=90&fontColor=ffffff&fontAlignY=38&desc=AI%20Secretary%20Assistant&descAlignY=58&descSize=22&descColor=3DFFC0&animation=twinkling" width="100%"/>

<!-- ═══════════════════════════════════════════════════════════════ -->
<!--                     ANIMATED TYPING LINE                       -->
<!-- ═══════════════════════════════════════════════════════════════ -->

<a href="https://git.io/typing-svg">
  <img src="https://readme-typing-svg.demolab.com?font=Syne&weight=700&size=22&duration=3000&pause=1000&color=3DFFC0&center=true&vCenter=true&multiline=false&width=600&lines=Your+Intelligent+AI+Secretary+%E2%9C%A6;Powered+by+OpenAI+%2B+LangChain;Integrated+with+n8n+Workflows;Built+with+React.js;Chat+%7C+Upload+%7C+Automate" alt="Typing SVG" />
</a>

<br/>

<!-- ═══════════════════════════════════════════════════════════════ -->
<!--                          BADGES ROW 1                          -->
<!-- ═══════════════════════════════════════════════════════════════ -->

<p>
<!-- React -->
<img src="https://img.shields.io/badge/React-18.2-61DAFB?style=for-the-badge&logo=react&logoColor=black&labelColor=0D1225" />

<!-- OpenAI -->
<img src="https://img.shields.io/badge/OpenAI-GPT--4-412991?style=for-the-badge&logo=openai&logoColor=white&labelColor=0D1225" />

<!-- LangChain (fixed: logo=langchain instead of emoji) -->
<img src="https://img.shields.io/badge/LangChain-v0.1-1C3C3C?style=for-the-badge&logo=langchain&logoColor=white&labelColor=0D1225" />

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

**ARIA** *(Adaptive Reasoning & Intelligent Assistant)* is a modern, full-stack AI Secretary chatbot that combines the power of **OpenAI's GPT models**, **LangChain's** orchestration framework, and **n8n's** no-code automation — all wrapped in a sleek **React.js** front-end.

Send messages, upload documents, and let ARIA handle the heavy lifting: drafting emails, summarizing files, scheduling tasks, and executing automated workflows — all in one seamless interface.

```
┌─────────────────────────────────────────────────────────────────────┐
│                                                                     │
│    User  ──►  React UI  ──►  n8n Webhook  ──►  LangChain Agent      │
│                                                        │            │
│                                                    OpenAI GPT       │
│                                                        │            │
│    User  ◄──  React UI  ◄──  n8n Webhook  ◄──  AI Response          │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

<!-- ═══════════════════════════════════════════════════════════════ -->
<!--                           FEATURES                             -->
<!-- ═══════════════════════════════════════════════════════════════ -->

## ⚡ Features

<table>
<tr>
<td width="50%">

### 🤖 AI-Powered Chat
- Conversational interface powered by **OpenAI GPT**
- Context-aware responses via **LangChain**
- Real-time typing indicator
- Persistent session memory

</td>
<td width="50%">

### 📎 File Intelligence
- Upload PDFs, DOCX, XLSX, images & more
- Drag-and-drop support
- File preview chips with type icons
- Base64 encoding for webhook delivery

</td>
</tr>
<tr>
<td width="50%">

### ⚙️ n8n Automation
- Webhook-triggered workflows
- No-code automation pipelines
- Extensible to 400+ integrations
- Email, calendar, Slack & more

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
| 🖥️ **Frontend** | React.js 18 | UI framework, component architecture |
| 🔄 **State** | useReducer + Context API | Global message & loading state |
| 🤖 **AI Model** | OpenAI GPT-4 | Language understanding & generation |
| 🦜 **Orchestration** | LangChain | Agent chaining, memory, tool use |
| ⚙️ **Automation** | n8n | Webhook workflows & integrations |
| 🌐 **Transport** | HTTP GET Webhook | Real-time message delivery |
| 🎨 **Styling** | CSS Custom Properties | Design tokens, animations |
| 🔤 **Fonts** | Syne + DM Sans | Display & body typography |

</div>

<!-- ═══════════════════════════════════════════════════════════════ -->
<!--                      WEBHOOK INTEGRATION                       -->
<!-- ═══════════════════════════════════════════════════════════════ -->

## 🔗 n8n Webhook Integration

ARIA communicates with your n8n instance via a **GET webhook**. Every message or file upload is sent as URL query parameters:

```
GET https://your-n8n-instance.app.n8n.cloud/webhook-test/{id}
  ?message=Hello+ARIA
  &sessionId=session_1234_abc
  &timestamp=2025-01-01T00:00:00.000Z
  &fileCount=1
  &file0_name=report.pdf
  &file0_type=application/pdf
  &file0_size=204800
  &file0_data=<base64>          ← only for files ≤ 1 MB
```

### n8n Response Formats Supported

ARIA auto-detects the reply from any of these n8n output shapes:

```json
{ "reply": "..."    }     ✓
{ "message": "..."  }     ✓
{ "response": "..." }     ✓
{ "output": "..."   }     ✓
{ "text": "..."     }     ✓
{ "answer": "..."   }     ✓
```

### Updating the Webhook URL

Edit `src/services/webhookService.js`:

```js
const WEBHOOK_URL = 'https://your-n8n-instance.app.n8n.cloud/webhook-test/your-id';
```

---

<!-- ═══════════════════════════════════════════════════════════════ -->
<!--                       N8N WORKFLOW SETUP                       -->
<!-- ═══════════════════════════════════════════════════════════════ -->

## ⚙️ n8n Workflow Setup

A recommended n8n workflow for ARIA:

```
[Webhook Trigger]
      │
      ▼
[LangChain Agent Node]
  ├── OpenAI Chat Model (GPT-4)
  ├── Memory Buffer (session-aware)
  └── Tools: Email, Calendar, Web Search
      │
      ▼
[Respond to Webhook]
  └── { "reply": "ARIA's response here" }
```

**Required n8n nodes:**
- `Webhook` (trigger) — GET method
- `LangChain Agent` — connected to OpenAI
- `OpenAI Chat Model` — `gpt-4` or `gpt-4o`
- `Window Buffer Memory` — keyed by `sessionId`
- `Respond to Webhook` — return `{ reply: "..." }`

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
- Files ≤ 1 MB are sent as base64 via the webhook
- Image files show thumbnail previews inline

---

<!-- ═══════════════════════════════════════════════════════════════ -->
<!--                      STATE MANAGEMENT                          -->
<!-- ═══════════════════════════════════════════════════════════════ -->

## 🧠 State Management

ARIA uses React's built-in `useReducer` + `Context API` — no external libraries needed.

```
ChatContext (Provider)
│
├── messages[]          ← full conversation history
│   └── { id, role, text, files, timestamp, status }
├── isLoading           ← webhook in-flight
├── error               ← last error message
└── sessionId           ← unique per browser session

Actions:
  ADD_MSG     → append new message
  UPDATE_MSG  → patch status (sending → sent)
  SET_LOADING → toggle spinner
  SET_ERROR   → capture webhook errors
  CLEAR_CHAT  → reset conversation
```

<!-- ═══════════════════════════════════════════════════════════════ -->
<!--                           ROADMAP                              -->
<!-- ═══════════════════════════════════════════════════════════════ -->

## 🗺️ Roadmap

- [x] Core chat interface
- [x] File upload with drag-and-drop
- [x] n8n GET webhook integration
- [x] Session-based memory
- [x] Animated UI with dark theme
- [ ] Voice input (Web Speech API)
- [ ] Chat history persistence (localStorage)
- [ ] Multi-session sidebar
- [ ] Streaming token responses (SSE)
- [ ] LangChain tool results display
- [ ] Mobile native app (React Native)

---

<!-- ═══════════════════════════════════════════════════════════════ -->
<!--                         CONTRIBUTING                           -->
<!-- ═══════════════════════════════════════════════════════════════ -->


<!-- ═══════════════════════════════════════════════════════════════ -->
<!--                           LICENSE                              -->
<!-- ═══════════════════════════════════════════════════════════════ -->

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

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
<img src="https://img.shields.io/badge/OpenAI-412991?style=flat-square&logo=openai&logoColor=white" />
&nbsp;
<img src="https://img.shields.io/badge/LangChain-1C3C3C?style=flat-square&logoColor=white" />

<br/><br/>

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:0A0E1A,50:00B4D8,100:3DFFC0&height=120&section=footer&animation=twinkling" width="100%"/>

</div>
