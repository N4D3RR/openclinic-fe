# OpenClinic — Frontend

React SPA for OpenClinic, a dental practice management system built as an EPICODE bootcamp capstone project.

> The backend repository is available at [OpenClinic-Backend](https://github.com/N4D3RR/openclinic-be)

---

## Screenshots

![Dashboard](docs/dashboard.png)
![Odontogram](docs/odontogram.png)
![Payments](docs/payments.png)

---

## Live Demo

**[openclinic-fe.vercel.app](https://openclinic-fe.vercel.app)**

### Demo Credentials

| Role      | Email                        | Password   |
| --------- | ---------------------------- | ---------- |
| Admin     | admin@openclinic.it          | Admin1234  |
| Dentist   | marco.bianchi@openclinic.it  | Password1! |
| Hygienist | sara.conti@openclinic.it     | Password1! |
| Secretary | giulia.moretti@openclinic.it | Password1! |

> Each role has different permissions — try logging in with different accounts to see how the interface adapts. The database is pre-seeded with realistic demo data.

---

## Tech Stack

|            |                                                 |
| ---------- | ----------------------------------------------- |
| Framework  | React 18 + Vite                                 |
| UI Library | React-Bootstrap 2                               |
| Styling    | SCSS + Bootstrap variable overrides             |
| Calendar   | FullCalendar (TimeGrid + DayGrid + Interaction) |
| Charts     | Recharts                                        |
| Routing    | React Router v6                                 |
| Icons      | react-icons/bs                                  |
| Font       | DM Sans (Google Fonts)                          |

---

## Features

### Pages

| Route                  | Page                  | Description                                                                                     |
| ---------------------- | --------------------- | ----------------------------------------------------------------------------------------------- |
| `/`                    | Dashboard             | KPI cards, revenue area chart, weekly appointments bar chart, today's schedule, recent patients |
| `/patients`            | Patients              | Searchable paginated table, create/edit modal                                                   |
| `/patients/:id`        | Patient Detail        | Tabs: Odontogram, Registry, Appointments, Clinical Records, Treatment Plans, Quotes, Payments   |
| `/appointments`        | Appointments          | FullCalendar with drag & drop, resize, color by status; toggle to list view with filters        |
| `/quotes`              | Quotes                | Paginated table with status filter                                                              |
| `/quotes/:id`          | Quote Detail          | Items management, status change, PDF export                                                     |
| `/treatment-plans/:id` | Treatment Plan Detail | Linked appointments, clinical notes, status                                                     |
| `/payments`            | Payments & Report     | KPI cards, monthly revenue chart, date/status filters, invoice PDF download                     |
| `/procedures`          | Procedures            | Catalog CRUD                                                                                    |
| `/users`               | Users                 | User management (Admin only)                                                                    |

### Key components

**Odontogram** — interactive FDI chart with per-tooth treatment history, procedure picker, and direct quote creation from selected teeth (multi-tooth cart).

**AI Assistant** — sidebar chatbot powered by OpenRouter, context-aware (today's appointments, total patients), with conversation history.

**AppointmentsPage** — FullCalendar with:

- Drag & drop (updates dateTime via PUT)
- Resize (updates duration via PUT)
- `info.revert()` on backend failure
- Timezone fix: `toISOString()` offset correction for local time
- Toggle between calendar and list view

**PaymentsPage** — financial report with live KPIs from backend, AreaChart (monthly revenue), month-over-month comparison card.

---

## Project Structure

```
src/
├── context/
│   └── AuthContext.jsx        # JWT storage, user state, role helpers
├── services/
│   └── api.js                 # Centralized fetch wrapper (get, post, put, delete, upload, getBlob)
├── pages/                     # One file per route
├── components/
│   ├── layout/                # Sidebar, TopBar, AppLayout (Outlet)
│   ├── appointments/          # AppointmentForm, AppointmentsTab, AppointmentListView
│   ├── patients/              # PatientForm, PatientTable
│   ├── quotes/                # QuoteForm, QuoteItemForm, QuotesTab
│   ├── payments/              # PaymentForm, PaymentTable, PaymentsTab
│   ├── odontogram/            # Odontogram, OdontogramQuoteModal
│   ├── treatment-plan/        # TreatmentPlansTab, TreatmentForm
│   ├── clinicalRecord/        # ClinicalRecordsTab, ClinicalRecordForm
│   ├── users/                 # UserForm
│   ├── ai/                    # AiAssistant
│   └── common/                # StatusBadge
└── styles/
    └── App.scss               # Bootstrap variable overrides + global styles
```

---

## Design System — "Clinical Modern"

| Token              | Value     |
| ------------------ | --------- |
| Sidebar background | `#1B2A3D` |
| Primary (teal)     | `#2A9D8F` |
| Page background    | `#F4F6F9` |
| Font               | DM Sans   |

Status colors follow a consistent palette across `StatusBadge`, calendar events, and KPI cards.

---

## Code Conventions

- **Component definitions**: `const X = function() {}` (no arrow functions)
- **Async**: `.then().catch().finally()` chains (no async/await)
- **UI**: React-Bootstrap components exclusively
- **State**: `useState` + `useEffect` per component; no Redux
- **Auth**: Context API only
- **Forms**: `emptyForm` objects declared outside components to avoid recreation on render

---

## Setup

### Prerequisites

- Node.js 18+
- The backend running on `http://localhost:3004`

### 1. Configure environment

Create `.env.local` in the project root:

```
VITE_API_URL=http://localhost:3004
```

### 2. Install and run

```bash
npm install
npm run dev
```

The app will be available at `http://localhost:5173`.

### Default credentials

Use the admin account seeded by the backend (configured via `ADMIN_DEFAULT_EMAIL` and `ADMIN_DEFAULT_PASSWORD` environment variables).

---

## Authentication Flow

1. User logs in via `POST /auth/login`
2. Backend returns `accessToken` (JWT)
3. Token stored in `localStorage`
4. `AuthContext` verifies token validity on app load via `GET /api/users/me`
5. All API calls include `Authorization: Bearer <token>` header via `api.js`
6. On 401, `api.js` clears storage and redirects to `/login`

---

## Author

Nader Deghaili — EPICODE Capstone Project 2026
