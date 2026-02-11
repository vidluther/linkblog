# API Key Guard Design

**GitHub Issue:** #8 — Add API key guard for write endpoints
**Date:** 2026-02-11

## Approach

Secure by default using NestJS's global guard system. Every route is protected unless explicitly marked public with a `@Public()` decorator.

## Files

| File                            | Action | Purpose                                  |
| ------------------------------- | ------ | ---------------------------------------- |
| `src/auth/api-key.guard.ts`     | Create | Guard implementation                     |
| `src/auth/public.decorator.ts`  | Create | `@Public()` decorator to opt out of auth |
| `src/auth/auth.module.ts`       | Create | Registers guard globally via `APP_GUARD` |
| `src/app.module.ts`             | Modify | Import `AuthModule`                      |
| `src/links/links.controller.ts` | Modify | Add `@Public()` to GET routes            |
| `src/feed/feed.controller.ts`   | Modify | Add `@Public()` to feed route            |
| `src/app.controller.ts`         | Modify | Add `@Public()` to health/root route     |

## Guard Logic

```
ApiKeyGuard (CanActivate)
│
├─ Check Reflector for IS_PUBLIC metadata
│  └─ If true → return true (skip auth)
│
├─ Read x-api-key from request headers
│  └─ If missing → throw UnauthorizedException
│
├─ Compare against ConfigService.get('API_KEY')
│  └─ If mismatch → throw UnauthorizedException
│
└─ Match → return true
```

- Uses `timingSafeEqual` from Node's `crypto` module for the key comparison to prevent timing attacks.
- Guard registered globally via `APP_GUARD` provider in `AuthModule` — no per-controller wiring needed.

## Route Access

### Public (decorated with `@Public()`)

- `GET /` — health/root
- `GET /feed` — RSS feed
- `GET /links` — list all links
- `GET /links/:id` — get single link

### Protected (guarded by default)

- `POST /links` — create link
- `PATCH /links/:id` — update link
- `DELETE /links/:id` — delete link

## Header

- Header: `x-api-key`
- Value: must match `API_KEY` environment variable
- Response on failure: `401 Unauthorized`

## Design Decisions

1. **Global guard over per-route** — secure by default; new routes are protected unless explicitly opted out.
2. **`x-api-key` over `Authorization: Bearer`** — simpler, matches existing project conventions and Postman collection.
3. **GET `/links` is public** — consistent with the feed already exposing link data publicly.
4. **`timingSafeEqual`** — prevents timing side-channel attacks on key comparison.
