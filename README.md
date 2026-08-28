# uniCare

**University Medical Center Digital Management and AI-Assisted Healthcare Information System**

A secure, role-based web portal that turns the manual operations of a university medical center —
medical registration, appointments, queues, consultations, prescriptions, pharmacy, laboratory,
dental, vaccination, medical reports, and emergency cases — into an integrated digital workflow.

Its distinguishing feature is an **AI-assisted document-processing module**: students upload
hospital-verified medical documents, OCR and NLP extract the relevant fields, the student reviews
them, and authorized medical staff verify before anything becomes part of the official record. AI
never diagnoses, prescribes, or approves a record on its own.

## Technology stack

| Layer | Technology |
| --- | --- |
| Frontend | React 19 + TypeScript (Vite) |
| UI | Tailwind CSS v4 + shadcn/ui |
| Backend | ASP.NET Core Web API, C#, .NET 10 |
| ORM | Entity Framework Core 10 |
| Database | Neon PostgreSQL (cloud-hosted) |
| API docs | OpenAPI + Scalar |
| AI/OCR | OCR + AI/NLP, as a module inside the API |
| Version control | Git + GitHub |

The AI/OCR component is deliberately kept **inside the .NET API** rather than split into a separate
Python service, to keep the system simple to build, run, and deploy.

## Project structure

```
uniCare/
├── frontend/            React + TypeScript + Tailwind + shadcn/ui
├── backend/
│   ├── UniCare.slnx     Solution file
│   └── UniCare.Api/     ASP.NET Core Web API (.NET 10)
├── database/            ER diagrams and schema documentation
├── docs/                SRS, diagrams, reports
└── README.md
```

## Prerequisites

- [.NET SDK 10](https://dotnet.microsoft.com/download) — `dotnet --version` should print `10.x`
- [Node.js 20+](https://nodejs.org) — `node --version`
- A [Neon](https://neon.tech) PostgreSQL database

If `dotnet` is not on your PATH, install it without admin rights:

```bash
curl -fsSL https://dot.net/v1/dotnet-install.sh | bash -s -- --channel 10.0
echo 'export DOTNET_ROOT="$HOME/.dotnet"' >> ~/.zshrc
echo 'export PATH="$DOTNET_ROOT:$DOTNET_ROOT/tools:$PATH"' >> ~/.zshrc
```

## Getting started

**1. Configure the database.** Copy the template and paste your Neon connection string:

```bash
cp backend/UniCare.Api/.env.example backend/UniCare.Api/.env
```

Then edit `.env` and set `DATABASE_URL` to the string from the Neon console
(**Dashboard → Connect**). Paste it verbatim in URI form — the API converts it to the format
Npgsql expects. **`.env` is gitignored; never commit a connection string.**

**2. Run the backend** (terminal 1):

```bash
cd backend
dotnet run --project UniCare.Api --launch-profile http
```

- API: <http://localhost:5054>
- Health check: <http://localhost:5054/api/health>
- API reference: <http://localhost:5054/scalar/v1>

**3. Run the frontend** (terminal 2):

```bash
cd frontend
npm install
npm run dev
```

- App: <http://localhost:5173>

The Vite dev server proxies `/api` to the backend on port 5054, so the browser only ever talks to
one origin and CORS is not involved in development. The home page shows the live status of all
three tiers — if the database badge reads **Connected**, your setup is working.

## Useful commands

| Command | Where | Purpose |
| --- | --- | --- |
| `dotnet build` | `backend/` | Build the solution |
| `dotnet ef migrations add <Name>` | `backend/UniCare.Api/` | Create a migration |
| `dotnet ef database update` | `backend/UniCare.Api/` | Apply migrations to Neon |
| `npm run dev` | `frontend/` | Start the dev server |
| `npm run build` | `frontend/` | Type-check and build for production |
| `npm run lint` | `frontend/` | Lint the frontend |

## Project status

The runnable skeleton is in place: authentication-free API, one health endpoint, and a verified
`React → .NET 10 → Neon PostgreSQL` path.

Next up, in order:

1. Entity Framework Core entities and the initial migration (User, Role, Student, MedicalProfile,
   Appointment, Prescription, and the rest of the domain model)
2. ASP.NET Core Identity + JWT authentication, and role-based access control across the eight
   roles (Student, Admin/Receptionist, Nurse, Doctor, Dentist, Laboratory, Pharmacy, System Admin)
3. Student medical registration and document upload
4. The AI/OCR extraction module
5. Appointments, queue management, and the clinical workflows
