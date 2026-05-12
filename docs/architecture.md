# Architecture Overview

## System Design

GitConnect follows a **client-server architecture** with a **RESTful API** layer:

```
┌─────────────┐     ┌──────────────┐     ┌────────────┐
│   React SPA  │────▶│  Express API  │────▶│  MongoDB   │
│  (Vite + TS) │     │  (TypeScript) │     │ (Mongoose) │
│              │◀────│               │◀────│            │
├─────────────┤     ├──────────────┤     └────────────┘
│  Redux TK    │     │  Better Auth  │
│  RTK Query   │     │  Socket.IO   │
│  shadcn/ui   │     │  Pino Logger │
└─────────────┘     └──────────────┘
```

## Request Lifecycle

1. **Client** makes HTTP request via RTK Query hook
2. **Vite dev server** proxies `/api/*` to Express (port 4000)
3. **Express middleware pipeline** processes request:
   - `helmet` → security headers
   - `cors` → cross-origin validation
   - `json parser` → parse request body
   - `cookie-parser` → parse cookies
   - `rate-limiter` → check rate limits
   - `authenticate` → validate JWT (on protected routes)
   - `validate` → Zod schema validation
   - **Route handler** → process request
4. **Controller** delegates to **Service** layer
5. **Service** interacts with Mongoose models
6. **Response** sent back with standardized envelope

## Data Flow

### Auth Flow
```
Register → Email verification (Resend) → Login → JWT → Authenticated requests
```

### Post Creation
```
Editor → Markdown → API → Save to MongoDB → RTK Query cache invalidation → Feed update
```

### Real-time Notifications
```
Action (like/follow) → Service creates Notification → Socket.IO emit → Client receives → Badge update
```
