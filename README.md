# OUSL Short Courses & CPD Portal

A full-stack web application for the Open University of Sri Lanka (OUSL) Short Courses and Continuing Professional Development programmes. Students can browse and compare courses, apply online, and use a student portal. Staff can manage courses, students, materials, announcements and grades from an admin dashboard.

> Content (courses, faculties, regional centres) is based on the public OUSL website: <https://ou.ac.lk/>

---

## Repository Structure

```
ousl-short-courses/
├── frontend/     # React 18 + Vite + Tailwind CSS client
├── backend/      # Node.js / Express REST API
├── .gitignore
└── README.md
```

| Folder | Description | Dev URL |
|---|---|---|
| `frontend/` | Single-page app (public site, student portal, admin dashboard) | http://localhost:5173 |
| `backend/` | REST API (authentication, courses, students, grades, etc.) | http://localhost:5000 |

During development the Vite dev server proxies every `/api` request to the backend on port 5000, so no extra CORS setup is needed.

---

## Tech Stack

**Frontend**
- React 18, React Router 6
- Vite 5
- Tailwind CSS 3
- React Icons

**Backend**
- Node.js + Express
- See [`backend/README.md`](backend/README.md) for database and API details

---

## Features

**Public site**
- Home page with hero slider, statistics, featured courses, news and events
- Short courses directory with search, category, delivery-mode and sort filters
- Course detail pages with curriculum, fees, entry requirements and related courses
- Side-by-side course comparison tool (up to 3 courses)
- Multi-step online application form
- About, leadership, staff profiles, regional centres, library, resources, careers
- Fees, events, news, contact, privacy, terms and Right to Information pages
- Trilingual support (Sinhala, Tamil, English)

**Student area**
- Registration and login
- Student portal with enrolled courses, progress, materials and payment receipts
- Student support pages

**Admin dashboard** (`/admin/login`)
- Dashboard overview
- Manage courses, students, materials, announcements and grades
- Admin profile

---

## Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) v20 or higher
- npm
- Git

### 1. Clone the repository

```bash
git clone https://github.com/imalka78/ousl-short-courses.git
cd ousl-short-courses
```

### 2. Run the frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

Open http://localhost:5173

### 3. Run the backend

```bash
cd backend
cp .env.example .env     # then fill in your own values
npm install
npm run dev
```

The API runs on http://localhost:5000 (see `backend/README.md` for the exact scripts).

---

## Environment Variables

Never commit real `.env` files. Copy each `.env.example` to `.env` and edit it.

**`frontend/.env`**

| Variable | Description | Default |
|---|---|---|
| `VITE_API_URL` | Base URL for API requests | `/api` |

**`backend/.env`** — see `backend/.env.example`.

---

## Available Scripts (frontend)

| Command | What it does |
|---|---|
| `npm run dev` | Start the Vite dev server |
| `npm run build` | Create a production build in `dist/` |
| `npm run preview` | Preview the production build locally |

---

## Frontend Folder Overview

```
frontend/
├── public/            # Static images and PDF forms
├── src/
│   ├── components/    # Layout, shared UI, admin layout
│   ├── context/       # Auth and language providers
│   ├── data/          # Course and site data
│   ├── hooks/         # Custom hooks (useFetch)
│   ├── lib/           # API helper
│   ├── pages/         # Public, student and admin pages
│   ├── App.jsx        # Routes
│   └── main.jsx       # Entry point
├── index.html
├── tailwind.config.js
├── postcss.config.js
└── vite.config.js
```

---

## Author

**Imalka** — [@imalka78](https://github.com/imalka78)

Built as a project for the Bachelor of Software Engineering Honours programme at the Open University of Sri Lanka.

## License

This project is for educational purposes. OUSL names, logos and content belong to the Open University of Sri Lanka.
