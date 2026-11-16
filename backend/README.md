# OUSL Short Courses & CPD Portal - Backend API

REST API for the OUSL Short Courses website.
Stack: **Node.js, Express, MongoDB (Atlas) and Mongoose**. The React frontend lives in `../frontend`.

## Folder structure

```
backend/
├── src/
│   ├── config/        env.js (settings), db.js (MongoDB connection), permissions.js (roles)
│   ├── models/        User, Course, Application, Inquiry, Enrollment,
│   │                  Material, Payment, Announcement, Grade, Preference
│   ├── middleware/    auth.js (login checks), rateLimit.js, errorHandler.js
│   ├── routes/        auth, courses, applications, inquiries, student, resources,
│   │                  preferences, staff (public), admin, adminStaff
│   ├── lib/           helpers (serialize, text, asyncHandler, scope, profile, password)
│   ├── seed/          seed.js (courses + demo accounts)
│   └── index.js       server entry point
├── scripts/smoke-test.js
├── .env.example
└── package.json
```

## First-time setup (every team member)

1. Install Node.js 18 or newer.
2. Get the MongoDB Atlas connection string from the team leader (private message, never GitHub).
3. In the `backend` folder:

   ```powershell
   Copy-Item .env.example .env
   ```

4. Open `backend/.env` and fill in:
   - `MONGODB_URI` - the connection string from the team leader
   - `JWT_SECRET` - your own random string (at least 32 characters):
     `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
   - leave the other lines as they are
5. Install and start:

   ```powershell
   npm install
   npm run dev
   ```

6. Open http://localhost:5000/api/health - it should show `"database":"connected"`.

## Seeding the database (only ONE member, once)

The database is shared, so only one person runs this:

```powershell
npm run seed
```

It adds the 60 courses (read from `frontend/src/data/coursesData.js`) and the accounts below
(emails and passwords come from the `SEED_*` lines in `.env`), plus some demo enrollments,
materials, payments, announcements and grades. It is safe to run again.
`npm run seed -- --reset` also overwrites the courses with the frontend data.

| `.env` lines | Account |
|---|---|
| `SEED_SUPERADMIN_*` (required) | Super admin. The only way a super admin is ever created. |
| `SEED_ADMIN_*` (optional) | Demo admin |
| `SEED_INSTRUCTOR_*` (optional) | Demo instructor, assigned to two courses, public profile on |
| `SEED_STUDENT_*` (optional) | Demo student with sample enrollments |

## Roles and permissions

Everyone signs in with **email + password** at the same login. The role is stored on the account in the
database and read on every request, so it can never be chosen or faked by the browser. A demotion or
removal takes effect on the next request.

| Action | Super admin | Admin | Instructor |
|---|:---:|:---:|:---:|
| Add / edit / remove **admins**, change roles | yes | no | no |
| Add / edit / remove / reset **instructors** | yes | yes | no |
| Add or remove courses | yes | yes | no |
| Edit course details (title, category, faculty, fee, mode) | yes | yes | no |
| Edit course content (description, overview, objectives, curriculum, eligibility, duration, intake, images) | yes | yes | **assigned courses only** |
| Assign instructors to courses | yes | yes | no |
| Students, materials, announcements, grades | all | all | **assigned courses only** |
| View inquiries | yes | yes | no |
| Own profile and password | yes | yes | yes |

The permission list lives in one file: `src/config/permissions.js`. The login response and `GET /api/auth/me`
include the user's `permissions`, so the frontend can show only the menu items the role may use.
(Hiding a button is only cosmetic; the server enforces every rule.)

### Creating staff accounts

1. An admin or super admin adds a person in **Manage Staff** (`POST /api/admin/staff`).
2. The server generates a random **temporary password** and returns it **once**. Only a bcrypt hash is stored.
3. The person signs in with their email and the temporary password. Until they set a new one
   (`POST /api/auth/change-password`), the admin and student areas answer `403` with
   `code: "PASSWORD_CHANGE_REQUIRED"`.
4. A lost password is reset with `POST /api/admin/staff/:id/reset-password` (a new temporary password, shown once).

Rules: admins can only manage instructors; only the super admin manages admins; super admin accounts can
never be created, edited or deleted through the website; nobody can delete or re-role their own account;
registration always creates a `student`, whatever the browser sends.

## Running everything

| Terminal | Folder | Command | Opens |
|---|---|---|---|
| 1 | `backend` | `npm run dev` | API on http://localhost:5000 |
| 2 | `frontend` | `npm run dev` | Website on http://localhost:5173 |

The frontend sends `/api` requests to the backend through the Vite proxy.

## Checking that it works

With the backend running, in another terminal:

```powershell
npm run test:smoke
```

It signs in with the seeded accounts and checks the main endpoints.
(The login endpoint allows about 20 attempts per 15 minutes per IP address.)

## API overview

All routes start with `/api`. Responses are JSON: `{ success, message, ... }`.

| Area | Routes |
|---|---|
| Health | `GET /health` |
| Auth | `POST /auth/register`, `POST /auth/login`, `POST /auth/logout`, `GET /auth/me`, `POST /auth/change-password`, `POST /auth/forgot-password`, `POST /auth/reset-password` |
| Courses (public) | `GET /courses` (filters: `category`, `mode`, `q`, `sort`), `GET /courses/:slug` |
| Applications | `POST /applications`, `GET /applications/my` (login), `GET /applications/:ref` (owner or admin) |
| Inquiries | `POST /inquiries`, `GET /inquiries` (admin, super admin) |
| Staff directory (public) | `GET /staff`, `GET /staff/:id` (instructors with a public profile) |
| Student (login) | `GET /student/dashboard`, `/student/enrolled-courses`, `/student/payments`, `/student/materials` |
| Resources | `GET /resources`, `GET /resources/download/:id` |
| Preferences | `GET /preferences`, `POST /preferences` |
| Staff (instructor, admin, super admin; permissions apply) | `/admin/dashboard`, `/admin/courses` (+ `/:slug`, `/:slug/students`, `/:slug/instructors`), `/admin/students`, `/admin/materials`, `/admin/announcements`, `/admin/grades`, `/admin/profile`, `/admin/profile/change-password` |
| Staff management | `GET/POST /admin/staff`, `PUT/DELETE /admin/staff/:id`, `POST /admin/staff/:id/reset-password` |

## Security notes

- Passwords are hashed with bcrypt. Login tokens (JWT) are sent as an httpOnly cookie and as a Bearer token.
- Staff passwords are temporary until changed; reset tokens and passwords are only ever stored hashed.
- Five wrong passwords lock an account for 15 minutes. Requests are rate limited.
- All database access goes through Mongoose (no string-built queries).
- `.env` is never committed. The server refuses to start if `MONGODB_URI` or `JWT_SECRET` are missing or still placeholders.
- `DEV_RESET_TOKEN_IN_RESPONSE=true` is a **demo-only** switch: the forgot-password endpoint also returns the
  reset token so the demo reset page works without an email service. It is ignored when `NODE_ENV=production`.
  A real deployment needs an email service (for example Nodemailer) to send the token instead.

## Demo behaviours to be aware of

- Applications are marked "Verified" automatically (payments are not checked against a real bank).
- Admin "materials" store a name, size and link only; there is no file upload.
- `GET /resources/download/:id` returns a small placeholder PDF.
- The public course pages in the frontend read `coursesData.js`, while the admin course editor changes the
  database, so admin edits do not appear on the public pages unless the frontend is switched to `GET /api/courses`.
