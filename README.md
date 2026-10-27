# Final Year Project (FYP) Management System
### Intelligent Coordination Portal with AI Semantic Similarity & Plagiarism Prevention

A production-grade, full-stack microservices platform designed for University FYP Offices, Faculty Supervisors, and Students. Features real-time AI-powered semantic similarity checking using PyTorch Sentence-Transformers, automated workflow approvals, document management, milestone tracking, and administrative analytics.

---

## Architecture Overview

The system is built as a modular 3-tier microservice architecture:

```
┌─────────────────────────────────────────────────────────────────┐
│              Frontend Application (Port 5173)                   │
│   Vite + React 18 + Tailwind CSS + Lucide Icons + React Router  │
└────────────────────────────────┬────────────────────────────────┘
                                 │ HTTP / JWT Bearer
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│               Backend REST API Server (Port 5000)               │
│    Node.js + Express + Mongoose + Multer + Express-Rate-Limit   │
└───────────────┬─────────────────────────────────┬───────────────┘
                │                                 │ Internal JSON
                │ MongoDB Driver                  ▼
                ▼                ┌────────────────────────────────┐
┌──────────────────────────────┐ │   AI Semantic Microservice     │
│   MongoDB Database           │ │         (Port 8000)            │
│      (Port 27017)            │ │ FastAPI + Uvicorn + PyTorch    │
│  Users, Proposals, Projects, │ │ Sentence-Transformers          │
│  Milestones, Past FYP Corpus │ │ (all-MiniLM-L6-v2)             │
└──────────────────────────────┘ └────────────────────────────────┘
```

---

## Key Features

### 1. Student Portal (`/student`)
- **Interactive Proposal Submission**: Rich form capturing project title, domain, tools, abstract, and student team members.
- **Pre-Submission AI Similarity Check**: Live semantic similarity pre-check displaying match percentages, warning indicators, and top similar projects before final submission.
- **Project Status & Roadmap**: Visual progress tracker showing milestone states (`pending`, `submitted`, `evaluated`), awarded marks, and supervisor feedback.
- **Milestone Deliverables Upload**: Multi-file uploader for Proposal, SRS, Midterm Report, and Final Thesis documents (`.pdf`, `.docx`).
- **Weekly Progress Logging**: Self-reporting tool for student teams to submit weekly development logs to supervisors.
- **Historical FYPs Search**: Searchable repository of past projects with year, domain, and keyword filters.

### 2. Supervisor Portal (`/supervisor`)
- **Supervision Dashboard**: Real-time stats on assigned students, pending proposal reviews, active projects, and completion rates.
- **Assigned Students Directory**: Detailed contact cards for all supervised students.
- **Proposal Review & Decisions**: Modal-based review interface allowing supervisors to approve, reject, or request changes with actionable remarks.
- **Weekly Progress Tracking**: Feed of submitted student progress logs with inline supervisor feedback submission.
- **Milestone Grading & Evaluation**: Dynamic grading interface supporting all milestones (`proposal_defense`, `srs`, `mid_evaluation`, `final_defense`, `final_thesis`) with automatic GPA/grade conversion.

### 3. Administrator Portal (`/admin`)
- **System Analytics & Charts**: Real-time statistical summaries and visual metrics for proposals, projects, and users.
- **Student & Supervisor Management**: User directories with search, role filters, active status toggling, and department tagging.
- **Supervisor Allocation Matrix**: Tabbed interface to assign faculty supervisors to students or proposals in one click.
- **Project Coordination**: Master oversight of all active university projects with milestone advancement capabilities.
- **Past FYPs Corpus & CSV Bulk Import**: Complete CRUD management for the AI training corpus, plus bulk CSV upload parser.

---

## AI Semantic Similarity Engine

- **Model**: `all-MiniLM-L6-v2` (Sentence-Transformers via PyTorch)
- **Embedding Dimensionality**: 384-dimensional dense semantic vectors
- **Similarity Metric**: Cosine similarity scaled to 0–100%
- **Threshold**: Warning triggered when similarity exceeds **70.0%**
- **Performance**: In-memory caching with SHA256 abstract hashing for instant repeat evaluations

---

## Security & Hardening

1. **Authentication & RBAC**:
   - Industry-standard JWT (JSON Web Tokens) with 7-day expiration.
   - Granular Role-Based Access Control middleware (`admin`, `supervisor`, `student`).
   - Passwords hashed using `bcryptjs` with salt work factor 10.
2. **Rate Limiting**:
   - Global rate limiter on `/api`: max 500 requests per 15 minutes per IP.
   - Strict rate limiter on `/api/auth/login` and `/api/auth/register`: max 60 requests per 15 minutes per IP.
3. **File Upload Security**:
   - File extensions and MIME types strictly whitelisted (`.pdf`, `.docx`, `.doc`).
   - File size restricted to 10 MB per document.
   - Storage filenames sanitized with unique timestamp prefixes to prevent directory traversal and collision attacks.
   - CSV imports processed entirely in-memory (5 MB buffer limit).
4. **CORS & HTTP Headers**:
   - Helmet HTTP header protection.
   - Strict CORS origin whitelisting supporting development and production hostnames.

---

## Prerequisites

- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **Python**: v3.10 or higher
- **MongoDB**: Local MongoDB instance (or `mongodb-memory-server`) running on port 27017
- **Google Chrome**: For running automated Puppeteer end-to-end browser tests

---

## Environment Variables

### 1. Backend (`backend/.env`)
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://127.0.0.1:27017/fyp_management
JWT_SECRET=supersecret_fyp_jwt_key_2026_antigravity
JWT_EXPIRE=7d
CORS_ORIGIN=http://localhost:5173
AI_SERVICE_URL=http://localhost:8000
```

### 2. AI Microservice (`ai-service/.env`)
```env
PORT=8000
HOST=0.0.0.0
MODEL_NAME=all-MiniLM-L6-v2
SIMILARITY_THRESHOLD=70.0
```

### 3. Frontend (`frontend/.env`)
```env
VITE_API_URL=http://localhost:5000/api
VITE_AI_URL=http://localhost:8000
```

---

## How to Run

### Method 1: Zero-Click 1-Click Launch (Recommended)
Simply double-click the `start.bat` script in the root directory:
```batch
start.bat
```
This batch script automatically:
1. Validates the environment and prerequisites.
2. Launches MongoDB Memory Server on `127.0.0.1:27017`.
3. Seeds initial demo accounts and past FYP archives.
4. Starts the Python FastAPI AI Microservice on `127.0.0.1:8000`.
5. Starts the Express Backend API on `127.0.0.1:5000`.
6. Starts the Vite Frontend Dev Server on `127.0.0.1:5173`.
7. Automatically launches your default browser directly into the web application.

---

### Method 2: Manual Terminal Startup

#### Terminal 1: MongoDB
```bash
mongod --port 27017 --dbpath ./data/db
```

#### Terminal 2: AI Microservice (Python FastAPI)
```bash
cd ai-service
# Create and activate virtual environment
python -m venv .venv
.venv\Scripts\activate   # Windows
# source .venv/bin/activate  # macOS/Linux

# Install dependencies
pip install -r requirements.txt

# Start FastAPI server
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

#### Terminal 3: Express Backend API Server
```bash
cd backend
npm install
node server.js
```

#### Terminal 4: React Frontend Client
```bash
cd frontend
npm install
npm run dev -- --host 127.0.0.1 --port 5173
```

---

## Pre-Configured Demo Accounts

All demo accounts share the default password: **`Password@123`**

| Role | Name | Email | Default Password |
|---|---|---|---|
| **Admin / Coordinator** | FYP Office Coordinator | `admin@university.edu` | `Password@123` |
| **Supervisor (Faculty)** | Dr. Khursheed Ahmed | `dr.khursheed@university.edu` | `Password@123` |
| **Student** | Ali Ahmed | `student@university.edu` | `Password@123` |

*(Quick test credentials can also be filled with one click from the Login page.)*

---

## API Endpoints Reference

### Authentication (`/api/auth`)
- `POST /api/auth/register` - Student registration
- `POST /api/auth/login` - User login & JWT generation
- `GET /api/auth/me` - Current authenticated user profile
- `POST /api/auth/logout` - User logout

### Student (`/api/student`)
- `POST /api/student/proposals/check-similarity` - Live AI similarity test
- `POST /api/student/proposals` - Submit project proposal
- `GET /api/student/my-project` - Current project status & milestone roadmap
- `GET /api/student/supervisors` - List available faculty supervisors
- `GET /api/student/previous-fyps` - Search past project archives
- `POST /api/student/documents` - Upload milestone document
- `GET /api/student/documents` - List student's uploaded documents
- `GET /api/student/documents/:id/download` - Secure deliverable download
- `POST /api/student/progress-updates` - Submit weekly team progress

### Supervisor (`/api/supervisor`)
- `GET /api/supervisor/dashboard` - Supervision analytics & metrics
- `GET /api/supervisor/students` - Assigned students roster
- `GET /api/supervisor/proposals` - Submitted student proposals
- `PUT /api/supervisor/proposals/:id/review` - Approve or reject proposal
- `GET /api/supervisor/projects` - Supervised active projects
- `POST /api/supervisor/marks` - Grade milestone with feedback & grade conversion
- `GET /api/supervisor/progress` - Student weekly logs feed
- `POST /api/supervisor/feedback` - Submit supervisor feedback

### Administrator (`/api/admin`)
- `GET /api/admin/stats` - University-wide analytics & stats
- `GET /api/admin/users` - User directory with filters & pagination
- `PUT /api/admin/users/:id/status` - Toggle user active status
- `PUT /api/admin/assign-supervisor/student` - Allocate supervisor to student
- `PUT /api/admin/assign-supervisor/proposal` - Allocate supervisor to proposal
- `GET /api/admin/projects` - Master project oversight
- `GET /api/admin/previous-fyps` - Past FYP corpus list with pagination
- `POST /api/admin/previous-fyps` - Add past FYP to corpus
- `PUT /api/admin/previous-fyps/:id` - Update past FYP
- `DELETE /api/admin/previous-fyps/:id` - Remove past FYP from corpus
- `POST /api/admin/previous-fyps/bulk-import` - Bulk CSV import parser

### AI Microservice (`/`)
- `GET /health` - Microservice health check & loaded model info
- `POST /check-similarity` - Sentence-Transformers cosine similarity calculation

---

## Automated Testing

### 1. Integration Test Suite
```bash
cd backend
npm test
```
Executes comprehensive integration tests across all controllers and API routes.

### 2. Browser End-to-End (E2E) Automation Test
```bash
cd backend
node e2e_browser_test.js
```
Automates the full multi-role user workflow via Puppeteer in headless Chrome, capturing 9 screenshots across all lifecycle stages.
