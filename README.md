# Runit — Online Judge System

Runit is a modern **Online Judge System (OJS)** built with a type-safe and scalable architecture.  
It provides secure authentication, role-based access control, code submissions, and contest support.

---

## Features

### Authentication

- JWT-based login
- Email verification
- Forgot / reset password flow
- OTP via email (Redis-backed)

### Roles & RBAC

- `USER`
- `ADMIN`

### User

- Browse and view problems
- Run code
- Submit solutions and receive verdicts
- View submission history
- Contest mode with real-time scoreboard

### Admin

- Create, update, delete problems
- Manage test cases
- Create and manage contests
- View all submissions
- Manage users and roles

---

## Tech Stack

### Backend

- **NestJS** (Fastify adapter)
- **Drizzle ORM**
- **Zod** validation
- **JWT** authentication
- **RBAC guards and authorization middleware**

### Frontend

- **React**
- **TanStack Query & Router**
- **shadcn/ui**
- **TailwindCSS**

### Infrastructure

- **Docker**
- **PostgreSQL** (primary database)
- **Redis** (OTP storage & caching)
- **Piston Engine** (secure code execution sandbox)

---

## Verdicts

- `AC` – Accepted
- `WA` – Wrong Answer
- `TLE` – Time Limit Exceeded
- `RE` – Runtime Error
- `CE` – Compilation Error

---

## License

MIT
