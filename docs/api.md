---
layout: default
title: API Reference
---

# API Reference

Base URL: `http://localhost:3000` (local) or your deployed App Runner URL.

> **Tip:** A ready-to-use Postman collection is available in `postman/collection.json` with pre-built requests, test scripts, and a CRUD workflow runner. See [Getting Started](getting-started#using-postman) for setup.

## Authentication

Write endpoints (`POST`, `PATCH`, `DELETE`) require an API key passed as a request header:

```
x-api-key: your-api-key
```

The key is compared against the `API_KEY` environment variable. Requests with a missing or incorrect key receive a `401 Unauthorized` response.

Read endpoints (`GET /links`, `GET /links/:id`) are also protected by the API key.

The RSS feed (`GET /feed`) and health check (`GET /health`) are **public**.

---

## Endpoints

### `GET /health`

Health check for load balancers and uptime monitors.

**Auth:** None

```bash
curl http://localhost:3000/health
```

**Response:** `200 OK`

---

### `POST /links`

Create a new link.

**Auth:** `x-api-key` header required

**Request body:**

```json
{
  "url": "https://example.com/article",
  "title": "Interesting Article",
  "summary": "A short note about why this is worth reading."
}
```

| Field     | Type   | Required | Description                     |
| --------- | ------ | -------- | ------------------------------- |
| `url`     | string | yes      | The URL being bookmarked        |
| `title`   | string | yes      | Display title for the link      |
| `summary` | string | no       | Your notes or a brief summary   |

**Example:**

```bash
curl -X POST http://localhost:3000/links \
  -H "Content-Type: application/json" \
  -H "x-api-key: your-api-key" \
  -d '{"url":"https://example.com","title":"Example","summary":"A test link"}'
```

**Response:** `201 Created`

```json
{
  "id": 1,
  "url": "https://example.com",
  "title": "Example",
  "summary": "A test link",
  "created_at": "2026-02-08T05:24:36+00:00",
  "updated_at": "2026-02-08T05:24:36+00:00"
}
```

---

### `GET /links`

List all links, sorted by newest first.

**Auth:** `x-api-key` header required

```bash
curl -H "x-api-key: your-api-key" http://localhost:3000/links
```

**Response:** `200 OK`

```json
[
  {
    "id": 2,
    "url": "https://example.com/newer",
    "title": "Newer Article",
    "summary": "...",
    "created_at": "2026-02-09T12:00:00+00:00",
    "updated_at": "2026-02-09T12:00:00+00:00"
  },
  {
    "id": 1,
    "url": "https://example.com/older",
    "title": "Older Article",
    "summary": "...",
    "created_at": "2026-02-08T05:24:36+00:00",
    "updated_at": "2026-02-08T05:24:36+00:00"
  }
]
```

---

### `GET /links/:id`

Get a single link by ID.

**Auth:** `x-api-key` header required

```bash
curl -H "x-api-key: your-api-key" http://localhost:3000/links/1
```

**Response:** `200 OK`

```json
{
  "id": 1,
  "url": "https://example.com",
  "title": "Example",
  "summary": "A test link",
  "created_at": "2026-02-08T05:24:36+00:00",
  "updated_at": "2026-02-08T05:24:36+00:00"
}
```

**Error:** `404 Not Found` if the link does not exist.

---

### `PATCH /links/:id`

Update an existing link.

**Auth:** `x-api-key` header required

**Request body** (all fields optional):

```json
{
  "title": "Updated Title",
  "summary": "Updated notes"
}
```

| Field     | Type   | Required | Description            |
| --------- | ------ | -------- | ---------------------- |
| `url`     | string | no       | Updated URL            |
| `title`   | string | no       | Updated title          |
| `summary` | string | no       | Updated summary/notes  |

**Example:**

```bash
curl -X PATCH http://localhost:3000/links/1 \
  -H "Content-Type: application/json" \
  -H "x-api-key: your-api-key" \
  -d '{"title":"Better Title"}'
```

**Response:** `200 OK` with the updated link object.

**Error:** `404 Not Found` if the link does not exist.

---

### `DELETE /links/:id`

Delete a link.

**Auth:** `x-api-key` header required

```bash
curl -X DELETE http://localhost:3000/links/1 \
  -H "x-api-key: your-api-key"
```

**Response:** `204 No Content`

**Error:** `404 Not Found` if the link does not exist.

---

### `GET /feed`

Public RSS 2.0 feed of all links, newest first.

**Auth:** None

```bash
curl http://localhost:3000/feed
```

**Response:** `200 OK` with `Content-Type: application/rss+xml`

```xml
<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Linkblog</title>
    <link>https://luther.io/blogroll</link>
    <description>Links worth reading</description>
    <item>
      <title>Interesting Article</title>
      <link>https://example.com/article</link>
      <description>A short note about why this is worth reading.</description>
      <pubDate>Sat, 08 Feb 2026 05:24:36 GMT</pubDate>
      <guid>https://example.com/article</guid>
    </item>
  </channel>
</rss>
```

---

## Error Responses

All errors follow a consistent format:

```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

| Status Code | Meaning               |
| ----------- | --------------------- |
| `400`       | Bad Request (invalid body) |
| `401`       | Unauthorized (missing/bad API key) |
| `404`       | Not Found             |
| `500`       | Internal Server Error  |

---

## Data Model

The `links` table in Supabase:

| Column       | Type          | Description                    |
| ------------ | ------------- | ------------------------------ |
| `id`         | integer (PK)  | Auto-assigned identifier       |
| `url`        | text          | The bookmarked URL             |
| `title`      | text          | Display title                  |
| `summary`    | text          | Notes or brief description     |
| `created_at` | timestamptz   | When the link was saved        |
| `updated_at` | timestamptz   | When the link was last changed |

---

Next: [Architecture](architecture)
