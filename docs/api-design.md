# API Design

## Base URL

All API endpoints are versioned under `/api/v1/`.

## Authentication

- Most endpoints require a valid JWT in the `Authorization` header or httpOnly cookie
- Auth endpoints are rate-limited separately (10 requests per 15 minutes)
- Public endpoints (developer list, public profiles, public posts) do not require auth

## Standard Response Format

### Success
```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

### Error
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Request validation failed",
    "details": {
      "email": ["Invalid email address"],
      "password": ["Password must be at least 8 characters"]
    }
  }
}
```

## Error Codes

| Code | HTTP Status | Meaning |
|------|-------------|---------|
| `NOT_FOUND` | 404 | Resource doesn't exist |
| `UNAUTHORIZED` | 401 | Not authenticated |
| `FORBIDDEN` | 403 | Not authorized |
| `VALIDATION_ERROR` | 400 | Zod validation failed |
| `RATE_LIMIT` | 429 | Too many requests |
| `CONFLICT` | 409 | Duplicate resource |
| `INTERNAL_ERROR` | 500 | Unexpected server error |

## Pagination

All list endpoints support pagination via query parameters:
- `?page=1&limit=20` (default: page=1, limit=20)
- Maximum limit: 100
- Response includes `meta` object with pagination metadata

## Naming Conventions

- **Plural nouns**: `/posts`, `/users`
- **Sub-resources**: `/posts/:postId/comments`
- **Actions**: `POST /posts/:id/like` (not `/posts/:id/like/create`)
- **CamelCase**: JSON property names use camelCase
