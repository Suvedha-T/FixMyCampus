# 🏫 FixMyCampus – Campus Issue Reporting and Tracking System

A beginner-friendly, clean, and understandable full-stack web application designed for students and administrators to report, track, and resolve campus infrastructure and facility issues.

---

## 📖 Table of Contents
1. [Project Description](#-project-description)
2. [How the Architecture Works (In Simple Terms)](#-how-the-architecture-works-in-simple-terms)
3. [Features](#-features)
4. [Technology Stack](#-technology-stack)
5. [Folder Structure](#-folder-structure)
6. [Database Structure (PostgreSQL)](#-database-structure-postgresql)
7. [REST API Endpoints](#-rest-api-endpoints)
8. [Installation & Setup](#-installation--setup)
   - [Prerequisites](#prerequisites)
   - [Backend Setup](#backend-setup)
   - [Frontend Setup](#frontend-setup)
   - [PostgreSQL Database Setup](#postgresql-database-setup)
9. [Default Demo Accounts](#-default-demo-accounts)
10. [Running the Automated Tests](#-running-the-automated-tests)

---

## 🎯 Project Description

Colleges and universities frequently face maintenance issues—broken classroom projectors, leaking plumbing, wobbly benches, electrical failures, or network downtime. Often, students do not know who to contact, or reports get lost in informal chat groups and paper logs.

**FixMyCampus** solves this problem by giving students a centralized portal to report problems with photos and locations, while giving campus administrators the tools to verify issues, assign them to responsible departments (e.g., *Maintenance*, *IT Support*, *Housekeeping*), update their progress, and mark them as resolved.

---

## 🧩 How the Architecture Works (In Simple Terms)

FixMyCampus follows the classic **3-Tier Web Architecture**:

```text
  [ Student / Admin ]
          │  (Clicks buttons, types forms in browser)
          ▼
┌───────────────────────────────┐
│     React Frontend (Vite)     │  Running on http://localhost:5173
└──────────────┬────────────────┘
               │  REST API calls (HTTP fetch with JSON)
               ▼
┌───────────────────────────────┐
│  Node.js + Express.js Backend │  Running on http://localhost:5000
└──────────────┬────────────────┘
               │  SQL Queries (SELECT, INSERT, UPDATE)
               ▼
┌───────────────────────────────┐
│      PostgreSQL Database      │  users, issues, issue_updates
└───────────────────────────────┘
```

1. **Frontend (React)**: Runs inside your web browser. When you fill out a form (like reporting a broken fan), React collects your input, packages it into a JavaScript object, and uses the browser's native `fetch()` function to send an HTTP request to the backend.
2. **Backend (Node.js & Express)**: Listens for incoming HTTP requests. It checks your credentials (JWT token), validates that required fields are filled, and constructs safe, parameterized SQL queries.
3. **Database (PostgreSQL)**: Stores the records permanently in relational tables connected with primary and foreign keys. When the backend asks for data, PostgreSQL returns the matching rows.
4. **Response Loop**: Express receives the rows from PostgreSQL, converts them to JSON format, and sends them back to React. React updates its component state (`useState`), and your browser immediately re-renders the updated information on screen without refreshing the page!

> [!NOTE]
> **React NEVER connects directly to PostgreSQL.** All database queries must go through the Node.js/Express REST API. This keeps database passwords and logic secure on the server.

---

## ✨ Features

### 🎓 Student Features
* **Account Registration & Login**: Secure sign-up with password hashing (`bcryptjs`) and token-based authentication (`JWT`).
* **Student Dashboard**: Quick summary cards showing *Total Reports*, *Pending Reports*, and *Resolved Reports*, plus a table of recent submissions.
* **Report Campus Issue**: Simple form to submit problems with:
  * Title & Description
  * Category dropdown (*Electrical*, *Furniture*, *Plumbing*, *IT & Network*, *Cleanliness*, *Laboratory*, *Other*)
  * Specific campus location (e.g., "Block B, Room 204")
  * Optional photo attachment (with instant image preview)
* **My Reports**: Personal report log with status filter (*All*, *Reported*, *Verified*, *Assigned*, *In Progress*, *Resolved*).
* **Issue Details & History**: View detailed breakdown and a chronological timeline showing every staff comment and status change.
* **Profile Management**: Update your name or change your password.

### 🛡️ Administrator Features
* **Administrator Login**: Protected access for staff members.
* **Admin Dashboard**: Campus-wide metrics (*Total Issues*, *Reported/New*, *In Progress*, *Resolved*) and recent activity feed.
* **All Issues Directory**: Searchable, filterable list of every issue reported across the campus with reporter attribution.
* **Department Assignment**: Route issues to specific departments (*Maintenance*, *IT Support*, *Housekeeping*, *Electrical*, *Academic Affairs*, *Security*).
* **Status Updates & Comments**: Transition issues through their lifecycle:
  `Reported` ➔ `Verified` ➔ `Assigned` ➔ `In Progress` ➔ `Resolved`
* **Audit Trail**: Every administrative action automatically records a timestamped entry with staff notes in `issue_updates`.
* **User Management**: Review registered students and staff accounts.

---

## 🛠️ Technology Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend** | React 18 (JavaScript) | Component-based interactive user interface |
| **Tooling** | Vite | Ultra-fast local development server and bundler |
| **Styling** | Plain CSS (`App.css`) | Clean, simple, readable student-project styling |
| **HTTP Client** | Native `fetch()` | Beginner-friendly REST API communication |
| **Backend** | Node.js & Express.js | REST API server, routing, and controllers |
| **Authentication** | JSON Web Tokens (`jsonwebtoken`) & `bcryptjs` | Secure session tokens and password hashing |
| **Database** | PostgreSQL | Relational database with primary and foreign keys |
| **Database Client** | `pg` (with embedded fallback) | Reliable connection pool and SQL query execution |

---

## 📁 Folder Structure

```text
FixMyCampus/
├── backend/
│   ├── server.js              # Express app entrypoint & middleware configuration
│   ├── db.js                  # PostgreSQL connection module (with embedded fallback)
│   ├── schema.sql             # SQL table definitions (users, issues, issue_updates)
│   ├── seed.js                # Initial database creator and sample data seeder
│   ├── test-e2e.js            # Automated end-to-end testing script
│   ├── package.json           # Backend dependencies and scripts
│   ├── .env                   # Configuration file (PORT, JWT_SECRET, DATABASE_URL)
│   ├── middleware/
│   │   └── authMiddleware.js  # JWT verification & admin authorization guards
│   ├── routes/
│   │   ├── authRoutes.js      # Routes for register, login, me, profile
│   │   ├── issueRoutes.js     # Routes for issues, my-issues, stats
│   │   └── userRoutes.js      # Routes for admin user management
│   └── controllers/
│       ├── authController.js  # Logic for authentication & profiles
│       ├── issueController.js # Logic for reporting, filtering, updating issues
│       └── userController.js  # Logic for listing campus users
│
├── frontend/
│   ├── index.html             # Single-page application HTML entrypoint
│   ├── vite.config.js         # Vite build tool configuration
│   ├── package.json           # Frontend dependencies
│   └── src/
│       ├── main.jsx           # Mounts React into the DOM
│       ├── App.jsx            # Master coordinator, route guards & view switching
│       ├── App.css            # Clean, beginner-friendly CSS stylesheet
│       ├── services/
│       │   └── api.js         # Centralized fetch() helper for all REST endpoints
│       ├── components/
│       │   ├── Navbar.jsx     # Responsive role-aware top navigation
│       │   └── StatusBadge.jsx# Color-coded issue status badge
│       └── pages/
│           ├── Login.jsx      # Sign in page (with 1-click demo filler buttons)
│           ├── Register.jsx   # Student account creation page
│           ├── Profile.jsx    # User profile & password update page
│           ├── student/
│           │   ├── StudentDashboard.jsx # Student summary stats & recent reports
│           │   ├── ReportIssue.jsx      # Form to submit a new issue
│           │   ├── MyReports.jsx        # Table of issues submitted by student
│           │   └── IssueDetails.jsx     # Full report details & timeline
│           └── admin/
│               ├── AdminDashboard.jsx   # Campus-wide stats & overview
│               ├── AllIssues.jsx        # Complete searchable table of all issues
│               ├── AdminIssueDetails.jsx# Status updater & department assignment
│               └── UsersList.jsx        # Table of registered users
│
└── README.md                  # Project documentation
```

---

## 🗄️ Database Structure (PostgreSQL)

The database consists of three relational tables:

```text
  ┌─────────────────────────┐
  │          users          │
  ├─────────────────────────┤
  │ id (PK, SERIAL)         │◄──┐
  │ name VARCHAR(100)       │   │
  │ email VARCHAR(100)      │   │ 1. One user has many reported issues
  │ password VARCHAR(255)   │   │
  │ role VARCHAR(20)        │   │
  │ created_at TIMESTAMP    │   │
  └─────────────────────────┘   │
               │                │
               │ (user_id)      │
               ▼                │
  ┌─────────────────────────┐   │
  │         issues          │   │
  ├─────────────────────────┤   │
  │ id (PK, SERIAL)         │   │
  │ user_id (FK -> users)   ├───┘
  │ title VARCHAR(200)      │◄──┐
  │ description TEXT        │   │
  │ category VARCHAR(50)    │   │ 2. One issue has many update entries
  │ location VARCHAR(150)   │   │
  │ image TEXT              │   │
  │ status VARCHAR(50)      │   │
  │ department VARCHAR(100) │   │
  │ created_at TIMESTAMP    │   │
  │ updated_at TIMESTAMP    │   │
  └─────────────────────────┘   │
               │                │
               │ (issue_id)     │
               ▼                │
  ┌─────────────────────────┐   │
  │      issue_updates      │   │
  ├─────────────────────────┤   │
  │ id (PK, SERIAL)         │   │
  │ issue_id (FK -> issues) ├───┘
  │ admin_id (FK -> users)  │
  │ status VARCHAR(50)      │
  │ comment TEXT            │
  │ created_at TIMESTAMP    │
  └─────────────────────────┘
```

---

## 🔌 REST API Endpoints

### Authentication (`/api/auth`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | Register a new student account |
| `POST` | `/api/auth/login` | Public | Login with email & password; returns JWT token |
| `GET` | `/api/auth/me` | Authenticated | Retrieve current user profile |
| `PUT` | `/api/auth/profile` | Authenticated | Update user full name or password |

### Issues (`/api`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/issues` | Student | Report a new campus problem |
| `GET` | `/api/my-issues` | Student | Get all issues reported by the logged-in student |
| `GET` | `/api/issues` | Admin | Get all issues (supports `?status=` and `?category=`) |
| `GET` | `/api/issues/:id` | Student (own) / Admin | Get single issue details and resolution updates |
| `PUT` | `/api/issues/:id/status` | Admin | Change issue status and log admin comment |
| `PUT` | `/api/issues/:id/assign` | Admin | Assign issue to a department and log assignment note |

### Statistics & Users (`/api`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/stats/student` | Student | Summary counts (Total, Pending, Resolved, Recent) |
| `GET` | `/api/stats/admin` | Admin | Overall campus counts (Total, Reported, In Progress, Resolved) |
| `GET` | `/api/users` | Admin | List all registered students and staff |

---

## 🚀 Installation & Setup

### Prerequisites
* **Node.js** (v18 or newer)
* **npm** (comes with Node.js)

### 1. Backend Setup
Open a terminal in the project directory:

```bash
cd backend
npm install
```

Start the backend server:
```bash
npm start
```

The backend server will run on **`http://localhost:5000`**.
On startup, it automatically creates the PostgreSQL tables and populates default demo accounts.

### 2. Frontend Setup
Open a second terminal window:

```bash
cd frontend
npm install
npm run dev
```

Open your browser and navigate to **`http://localhost:5173`**.

---

## 🐘 PostgreSQL Database Setup

FixMyCampus is designed to be **100% plug-and-play**:

### Option A: Automatic Embedded PostgreSQL (Zero Configuration Needed!)
If you do not have PostgreSQL installed on your computer, **you do not need to install anything!**
The backend includes an embedded PostgreSQL engine (`@electric-sql/pglite`) that runs genuine PostgreSQL directly inside Node.js, storing data in `./backend/data`. It supports real PostgreSQL SQL queries, constraints, and data types automatically.

### Option B: Connecting to an External PostgreSQL Database
If you have PostgreSQL installed locally or use a cloud database (like Neon, Supabase, or Render):
1. Open `backend/.env`.
2. Set your `DATABASE_URL`:
   ```env
   DATABASE_URL=postgres://postgres:yourpassword@localhost:5432/fixmycampus
   ```
3. Restart the backend server with `npm start`. The server will automatically connect to your external PostgreSQL instance, execute `schema.sql`, and seed the default accounts!

---

## 🔑 Default Demo Accounts

For easy testing, two pre-configured accounts are provided:

| Role | Email | Password | Access Rights |
| :--- | :--- | :--- | :--- |
| **Student** | `student@campus.edu` | `student123` | Can report issues, track own reports, view dashboard |
| **Admin** | `admin@campus.edu` | `admin123` | Can view all issues, assign departments, update statuses, view users |

> [!TIP]
> The Login page features quick **"Fill Student"** and **"Fill Admin"** buttons to automatically fill in demo credentials with a single click!

---

## 🧪 Running the Automated Tests

An automated end-to-end verification script is included to test all endpoints and security policies:

```bash
cd backend
node test-e2e.js
```

This script verifies:
1. Health check & database connection
2. Student registration & authentication
3. Issue submission & student ownership
4. Security restrictions (blocking students from `/api/users` and other students' issues)
5. Admin issue directory & department assignment
6. Issue lifecycle updates (`Reported` ➔ `Assigned` ➔ `In Progress` ➔ `Resolved`)
7. Complete audit trail in `issue_updates`
