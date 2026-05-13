# GitConnect — Master Learning Journal

> This document is the central learning resource for the GitConnect project. It documents every architectural decision, library choice, design pattern, and production practice implemented throughout this project. Use it as your guide to understanding how a production-grade MERN application is built.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Monorepo Architecture](#2-monorepo-architecture)
3. [Package Breakdown](#3-package-breakdown)
4. [Technology Choices & Rationale](#4-technology-choices--rationale)
5. [TypeScript Patterns](#5-typescript-patterns)
6. [Server Architecture](#6-server-architecture)
7. [Client Architecture](#7-client-architecture)
8. [API Design Conventions](#8-api-design-conventions)
9. [Error Handling Strategy](#9-error-handling-strategy)
10. [Database Design](#10-database-design)
11. [Authentication Flow](#11-authentication-flow)
12. [Production Practices](#12-production-practices)
13. [Development Workflow](#13-development-workflow)
14. [Glossary](#14-glossary)

---

## 1. Project Overview

GitConnect is a professional social platform for developers. Users can create profiles, share Markdown-formatted posts about development topics, follow other developers, engage in discussions through nested comments, send private messages, and request mentorship.

### Learning Objectives

This project teaches:

- **Monorepo management** with npm workspaces
- **TypeScript** in a full-stack context (shared types, strict mode, project references)
- **Express 5** production patterns (middleware pipeline, error handling, route organization)
- **Mongoose 9** schema design with relationships, indexes, and denormalization
- **React 19** with modern patterns (hooks, context, lazy loading)
- **Redux Toolkit + RTK Query** for state management with automatic caching
- **Custom JWT + bcryptjs** for authentication (email verification, JWT access/refresh tokens, sessions)
- **Tailwind CSS 4 + shadcn/ui** for professional UI
- **Socket.IO** for real-time notifications and messaging
- **Zod** for runtime validation shared between client and server
- **Production practices** (ESLint, Prettier, Husky, logging, rate limiting, security headers, error boundaries)

---

## 2. Monorepo Architecture

### Why a Monorepo?

In production, large projects use monorepos to share code between packages while keeping them independently buildable. This project uses **npm workspaces** (native to npm, no extra tooling) rather than tools like Nx or Turborepo to keep things simple but still follow the pattern.

### Workspace Structure

```
GitConnect/
├── packages/shared/        # Shared types, validation schemas (Zod)
├── server/                 # Express API
├── client/                 # React SPA
├── node_modules/           # Hoisted dependencies
└── package.json            # Root workspace config
```

### Why This Structure?

| Alternative                     | Trade-off                          | Our Choice |
| ------------------------------- | ---------------------------------- | ---------- |
| Flat (everything in one folder) | No sharing, duplication            | ❌         |
| Separate repos                  | Versioning hell, context switching | ❌         |
| Monorepo with workspaces        | Clean sharing, unified linting     | ✅         |

### npm Workspaces in Practice

- The root `package.json` has `"workspaces": ["packages/*", "server", "client"]`
- Running `npm install` at root installs ALL dependencies and hoists shared ones to root `node_modules/`
- The `@gitconnect/shared` package is referenced from both `server` and `client` via their `package.json` dependencies
- Cross-package imports use TypeScript paths (`@gitconnect/shared`) rather than relative paths

---

## 3. Package Breakdown

### 3.1 `@gitconnect/shared` (packages/shared/)

**Purpose**: Single source of truth for data types and validation rules used by both client and server.

```
shared/src/
├── types/              # TypeScript interfaces (User, Post, Comment, etc.)
│   ├── user.types.ts
│   ├── post.types.ts
│   ├── comment.types.ts
│   ├── activity.types.ts
│   ├── notification.types.ts
│   ├── message.types.ts
│   ├── report.types.ts
│   └── api.types.ts    # ApiResponse<T>, PaginatedResponse<T>
└── validation/         # Zod schemas for runtime validation
    ├── auth.schema.ts
    ├── user.schema.ts
    ├── post.schema.ts
    ├── comment.schema.ts
    └── pagination.schema.ts
```

**Key Pattern**: Zod schemas are defined once and used for:

1. Server-side request validation (in Express middleware)
2. Client-side form validation (same rules, same error messages)
3. TypeScript type inference via `z.infer<>`

### 3.2 `server` (Express API)

**Purpose**: REST API server with MongoDB, authentication, real-time features.

```
server/src/
├── config/             # App configuration
│   ├── env.ts          # Environment variable validation (Zod)
│   ├── database.ts     # MongoDB connection with retry
│   ├── cors.ts         # CORS configuration
│   └── logger.ts       # Pino structured logging
├── modules/            # Feature modules (empty until Milestone 2+)
├── shared/             # Cross-cutting concerns
│   ├── errors/         # Error class hierarchy
│   ├── middleware/      # Express middleware
│   ├── utils/          # Helpers
│   └── types/          # Express type augmentation
├── app.ts              # Express app factory
└── server.ts           # Entry point
```

### 3.3 `client` (React SPA)

**Purpose**: Single-page application with routing, state management, and UI components.

```
client/src/
├── features/           # Feature modules (empty until Milestone 2+)
├── components/         # Shared UI components
│   ├── ui/             # shadcn/ui components (added as needed)
│   ├── layout/         # App shell, navbar, sidebar
│   ├── common/         # Loader, ErrorBoundary, etc.
│   └── markdown/       # Editor and preview
├── hooks/              # Shared hooks
├── lib/                # Utilities, constants
├── store/              # Redux store + RTK Query base
├── pages/              # Route page components
├── App.tsx             # Root with router
└── main.tsx            # Entry point
```

---

## 4. Technology Choices & Rationale

### Node.js 20 LTS

**Why**: LTS, stable, excellent ES module support, built-in test runner. The engine requirement in `package.json` enforces this.

### Express 5

**Why**: Most popular Node.js framework. Express 5 adds async error handling improvements. In production companies, Express is everywhere — it's the "safe choice" that every Node developer knows.

**Alternatives considered**: Fastify (faster but smaller ecosystem), Hono (newer, less proven in production).

### TypeScript (strict mode)

**Why**: Non-negotiable in modern production apps. Strict mode (`strict: true`) enables:

- `noUncheckedIndexedAccess` — forces handling of potentially undefined object access
- `noImplicitOverride` — prevents accidental override of class methods
- `noUnusedLocals`/`noUnusedParameters` — keeps code clean

**Key TS patterns used** (see Section 5).

### MongoDB + Mongoose 9

**Why**: Document model fits social features naturally (embedded education/experience arrays). Mongoose provides schema validation, population (joins), middleware hooks, and discriminators for polymorphism.

**Key Mongoose patterns**: `refPath` for polymorphic associations (Activity feed), denormalized counts (likeCount), selective population.

### Custom JWT + bcryptjs

**Why**: Full control over the auth flow with no external auth framework dependency. bcryptjs handles password hashing (10 salt rounds), jsonwebtoken handles short-lived access tokens (15min) and long-lived refresh tokens (7d). Node `crypto` generates email verification and password reset tokens.

**Compared to Better Auth**: Initially evaluated Better Auth but found it lacked a stable Express adapter for the project's needs. The custom implementation is simpler, fully transparent, and provides the same core features — registration with email verification, login with JWT pair, password reset, and token-based session management.

### Redux Toolkit + RTK Query

**Why**: RTK Query eliminates manual loading/error/success state management. You define endpoints and get auto-generated hooks with caching, background refetching, optimistic updates, and tag-based invalidation.

**Pattern**: The base `api.ts` file creates the RTK Query instance with `fetchBaseQuery` configured for credentials and auth headers. Feature modules extend it with `injectEndpoints()`.

### Tailwind CSS 4 + shadcn/ui

**Why**: Tailwind's utility-first approach avoids CSS naming conflicts and keeps styles co-located with components. shadcn/ui provides production-quality React components that are fully customizable (copy-paste, not a dependency).

**Design direction**: Linear-inspired — muted neutral palette, clean typography (Inter), subtle shadows, minimal animations.

### Zod

**Why**: Runtime validation with TypeScript inference. `z.infer<typeof schema>` extracts the TypeScript type from a Zod schema, keeping validation logic and types in sync.

**Key feature**: Sharing schemas between client and server via the `@gitconnect/shared` package ensures consistent validation.

### Socket.IO

**Why**: Industry standard for WebSocket-based real-time communication. Handles fallback transports, rooms for scoped broadcasting, and authentication middleware.

### Pino

**Why**: Fastest structured JSON logger for Node.js. Used in production by many companies. Unlike `console.log`, it supports log levels, request IDs, and machine-parseable output.

### Multer + Sharp

**Why**: Multer handles multipart form uploads. Sharp processes/resizes images server-side before storage — essential for avatar optimization.

### Resend

**Why**: Modern email API with SDK for Node.js. Used for transactional emails (email verification, password reset, notifications). Simple API, high deliverability.

---

## 5. TypeScript Patterns

### 5.1 Strict Mode Configuration

```json
{
  "strict": true,
  "noUncheckedIndexedAccess": true,
  "noImplicitOverride": true,
  "noUnusedLocals": true,
  "noUnusedParameters": true
}
```

Every one of these flags prevents a category of bugs:

- `noUncheckedIndexedAccess`: `arr[0]` returns `T | undefined`, forcing you to handle the undefined case
- `noUnusedParameters`: Prefix unused params with `_` (`_req`, `_res`)

### 5.2 `type` vs `interface`

We use `interface` for object shapes that might be extended (consistent with `@typescript-eslint/consistent-type-definitions` rule). Use `type` for unions, intersections, and primitives.

### 5.3 Consistent Type Imports

```typescript
import type { Request, Response } from 'express';
```

Using `type` imports tells TypeScript and bundlers that this import is type-only and can be erased at runtime. This prevents circular dependency issues and reduces bundle size.

### 5.4 Generics for API Responses

```typescript
export interface ApiResponse<T> {
  success: true;
  data: T;
}
```

This ensures every API response is type-safe. The client knows exactly what shape `data` will be for each endpoint.

### 5.5 Zod Inference

```typescript
const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

// This is the SAME type — no duplication
type RegisterInput = z.infer<typeof registerSchema>;
```

### 5.6 Discriminated Unions for Errors

```typescript
type ApiResult<T> =
  | { success: true; data: T }
  | { success: false; error: { code: string; message: string } };
```

---

## 6. Server Architecture

### 6.1 Module Structure

Each feature lives in `server/src/modules/<feature>/` and exports:

- `*.model.ts` — Mongoose schema
- `*.controller.ts` — Route handlers (thin, delegates to service)
- `*.service.ts` — Business logic (testable)
- `*.routes.ts` — Express router definition
- `*.validation.ts` — Zod schemas specific to this module (extends shared)

This is the **Controller-Service-Repository** pattern. Controllers handle HTTP concerns (parsing request, sending response). Services handle business logic. Models handle data access.

### 6.2 Middleware Pipeline (order matters)

```
Request → Helmet → CORS → JSON Parser → Cookie Parser → Rate Limiter → Auth → Routes → Error Handler
```

Each middleware layer adds security or parsing before routes are hit. The error handler is LAST — it catches any error thrown from routes or middleware.

### 6.3 App Factory Pattern

The `createApp()` function returns a configured Express app. This is a **factory pattern** — it allows:

- Creating a fresh app for each test
- Avoiding global state
- Clean separation of configuration from startup

### 6.4 Async Handler Wrapper

```typescript
export function asyncHandler(fn: AsyncRequestHandler) {
  return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
}
```

Express 4 does not catch async errors. This wrapper ensures every rejected promise is forwarded to the error handler. Express 5 does this natively, but the wrapper adds explicitness.

---

## 7. Client Architecture

### 7.1 Vite + React

Vite is the modern alternative to Create React App (deprecated). It provides:

- Instant server start with native ESM
- Fast Hot Module Replacement (HMR)
- Optimized builds with Rollup
- First-class TypeScript and JSX support

### 7.2 Redux Toolkit + RTK Query

**Store setup**: `configureStore()` with the API middleware. Dev tools enabled in development only.

**RTK Query base**: The `api.ts` file creates the base API instance with:

- `fetchBaseQuery` configured for the API URL and credentials
- `prepareHeaders` to attach auth tokens
- `tagTypes` for cache invalidation

Feature modules extend this with `injectEndpoints()` to add their specific endpoints.

### 7.3 Routing

React Router v7 with nested routes:

- Public routes (Landing, Login, Register, Developers list, Public profiles, Posts)
- Protected routes (Feed, Messages, Settings, Notifications)
- Admin routes (separate `/admin/*`)

### 7.4 shadcn/ui Component Pattern

shadcn/ui components are copied into `client/src/components/ui/` and customized. Each component:

- Uses `cn()` utility for className merging (handles Tailwind conflicts)
- Is fully typed with TypeScript
- Supports the `asChild` pattern from Radix UI for composition
- Uses CSS variables for theming (supports dark mode)

---

## 8. API Design Conventions

### 8.1 Standardized Response Envelope

Every API response follows this structure:

```typescript
// Success
{ "success": true, "data": { ... }, "meta": { "page": 1, "limit": 20, "total": 100 } }

// Error
{ "success": false, "error": { "code": "VALIDATION_ERROR", "message": "...", "details": {...} } }
```

**Why**: Consistency makes client-side parsing trivial. The `success` boolean allows a single error handler on the client that checks `!response.success`.

### 8.2 HTTP Status Codes

| Code | When                       |
| ---- | -------------------------- |
| 200  | Success (GET, PATCH)       |
| 201  | Created (POST)             |
| 204  | No content (DELETE)        |
| 400  | Validation error           |
| 401  | Unauthenticated            |
| 403  | Unauthorized (wrong role)  |
| 404  | Resource not found         |
| 409  | Conflict (duplicate email) |
| 429  | Rate limited               |
| 500  | Server error               |

### 8.3 URL Structure

- Versioned: `/api/v1/<resource>`
- Plural nouns: `/api/v1/posts`, not `/api/v1/post`
- Nested for sub-resources: `/api/v1/posts/:postId/comments`
- Actions use POST: `/api/v1/posts/:id/like`, not `/api/v1/posts/:id/like/create`

### 8.4 Pagination

All list endpoints accept `?page=1&limit=20` and return pagination metadata in the `meta` field. `limit` caps at 100.

---

## 9. Error Handling Strategy

### 9.1 Error Class Hierarchy

```
Error
└── AppError (statusCode, code, isOperational)
    ├── NotFoundError (404)
    ├── UnauthorizedError (401)
    ├── ForbiddenError (403)
    └── ValidationError (400) — from Zod
```

**Operational errors** (expected): Returned to client with appropriate status code.
**Programmer errors** (unexpected): Logged with full stack trace, generic 500 returned to client (no leak of internals).

### 9.2 Global Error Handler

The `errorHandler` middleware:

1. Checks if error is `AppError` → returns structured JSON with status code
2. Otherwise → logs the error with Pino, returns 500 with generic message

### 9.3 Attempt vs Result Pattern

Functions that can fail return their result type rather than throwing:

- `parsePagination()` returns a safe default if parsing fails
- Zod validation returns structured error details on failure

---

## 10. Database Design

### 10.1 Mongoose Schema Principles

1. **Validation at schema level**: Required fields, enum constraints, string max lengths
2. **Indexes on queried fields**: Every field used in `find()`, `sort()`, or `lookup` gets an index
3. **Denormalized counts**: `likeCount`, `commentCount`, `followerCount` stored on the document — avoids expensive `count()` queries
4. **Selective population**: Only populate referenced fields when needed, not by default
5. **Timestamps**: Every model has `{ timestamps: true }` for `createdAt`/`updatedAt`

### 10.2 Polymorphic Associations (Activity Feed)

Mongoose doesn't have Rails' `polymorphic: true`, but `refPath` achieves the same:

```typescript
const activitySchema = new Schema({
  type: { type: String, enum: ['follow', 'post', 'comment', 'like', 'mentorship_request'] },
  targetModel: { type: String, enum: ['User', 'Post', 'Comment'] },
  target: { type: Schema.Types.ObjectId, refPath: 'targetModel' },
});
```

The `refPath` tells Mongoose: "Look at the `targetModel` field to know which collection `target` references."

### 10.3 Self-Referential Association (Followers)

```typescript
const userSchema = new Schema({
  following: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  followers: [{ type: Schema.Types.ObjectId, ref: 'User' }],
});
```

This is the MERN equivalent of Rails' `has_many :followers, through: :follows`.

### 10.4 Nested Comments

Comments use a `parent` field referencing another Comment:

- `parent: null` → top-level comment
- `parent: ObjectId` → reply
- `depth: number` → prevents nesting beyond 2 levels

---

## 11. Authentication Flow

The app uses a custom authentication system built with `bcryptjs`, `jsonwebtoken`, and Node.js `crypto`:

1. **Registration**: User submits email + password → bcryptjs hashes password → User created with email verification token (crypto.randomBytes) → Resend sends verification email → User clicks link → `emailVerified` set to true
2. **Login**: Email + password → bcryptjs.compare() → JWT access token (15min, signed with JWT_SECRET) + refresh token (7d, signed with JWT_REFRESH_SECRET) → refresh token stored in httpOnly cookie, access token returned in body
3. **Session**: On page load, client calls `/api/v1/auth/me` with Bearer token → token validated via jwt.verify → user data returned
4. **Password Reset**: Email → crypto-generated reset token (1 hour expiry) → stored on user document → Resend sends reset email → User submits new password → bcryptjs re-hashes
5. **Security**: Rate limiting on auth endpoints (10 req/15min), httpOnly cookies prevent XSS, access tokens short-lived to limit damage from theft, refresh tokens enable silent rotation

---

## 12. Production Practices

### 12.1 Code Quality

| Tool              | Purpose                                                               |
| ----------------- | --------------------------------------------------------------------- |
| ESLint            | Catch bugs & enforce style (`@typescript-eslint/strict-type-checked`) |
| Prettier          | Auto-format code (single quotes, trailing commas, 100 width)          |
| Husky             | Git hooks — runs `lint-staged` before every commit                    |
| lint-staged       | Only lint/format changed files (fast)                                 |
| TypeScript strict | Prevent entire categories of bugs at compile time                     |

### 12.2 Security

- **Helmet**: Sets security-related HTTP headers (XSS protection, content security policy, etc.)
- **CORS**: Whitelisted to client URL only
- **Rate limiting**: Global API limit + stricter auth endpoint limit
- **Input validation**: Every request body/query/params validated with Zod
- **No sensitive leaks**: Errors hide internals in production mode
- **httpOnly cookies**: Auth tokens not accessible to JavaScript
- **File upload validation**: Type checking + size limits with Multer

### 12.3 Logging

Pino is configured with:

- `level: 'info'` in production, `'debug'` in development
- Pretty printing in development (`pino-pretty`)
- Sensitive fields redacted (`req.headers.authorization`, `req.headers.cookie`)
- Structured JSON in production (ingestible by log aggregation tools)

### 12.4 Environment Variables

All env vars are validated at startup with Zod. If any are missing or invalid, the server prints clear error messages and exits — no silent failures.

### 12.5 Error Boundaries (Client)

React error boundaries catch rendering errors and show a fallback UI instead of a white screen. Each page can optionally have its own boundary.

---

## 13. Development Workflow

### Commands

```bash
npm run dev              # Start both server + client concurrently
npm run dev:server       # Server only (tsx watch)
npm run dev:client       # Client only (Vite)
npm run build            # Build all packages
npm run typecheck        # Type-check all packages
npm run lint             # ESLint all files
npm run format           # Prettier write all files
```

### Branch Strategy

- `main` — stable, deployable
- Feature branches: `feat/auth`, `feat/posts`, etc.

### Commit Convention

We use [conventional commits](https://www.conventionalcommits.org/):

- `feat:` — new feature
- `fix:` — bug fix
- `chore:` — tooling, dependencies
- `docs:` — documentation
- `refactor:` — code restructuring

---

## 14. Glossary

| Term                        | Definition                                                                       |
| --------------------------- | -------------------------------------------------------------------------------- |
| **Monorepo**                | Single repository containing multiple packages/projects                          |
| **Workspace**               | npm workspaces — linked packages in a monorepo                                   |
| **RTK Query**               | Redux Toolkit's data fetching and caching layer                                  |
| **Zod**                     | TypeScript-first schema validation library                                       |
| **shadcn/ui**               | Copy-paste React component library (not a dependency)                            |
| **JWT**                     | JSON Web Token — stateless auth token format                                     |
| **Polymorphic association** | A reference that can point to different model types                              |
| **Denormalization**         | Storing redundant data (like likeCount) for query performance                    |
| **Population**              | Mongoose's equivalent of SQL JOIN — replaces ObjectId refs with actual documents |
| **Helmet**                  | Express middleware that sets secure HTTP headers                                 |
| **Pino**                    | Fast structured JSON logger for Node.js                                          |
| **Resend**                  | Email API service for transactional emails                                       |
| **Middleware pipeline**     | Ordered chain of functions that process HTTP requests in Express                 |
