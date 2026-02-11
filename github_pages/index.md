---
layout: home
title: Linkblog
---

# Linkblog

A personal bookmarking API built with **NestJS**, **TypeScript**, and **Supabase**. It stores articles with notes and publishes them as a public **RSS 2.0 feed** for the blogroll at [luther.io/blogroll](https://luther.io/blogroll).

## What It Does

- **Save links** with a title and summary via a simple REST API
- **Publish an RSS feed** that external sites can consume at build time
- **Protect writes** with a single API key — no user accounts needed

## Quick Links

- [Getting Started](getting-started) -- Set up the project locally
- [API Reference](api) -- Full endpoint documentation
- [Architecture](architecture) -- How the pieces fit together
- [Deployment](deployment) -- Ship to AWS App Runner
- [Implementation Plan](implementation-plan) -- Roadmap and issue tracker

## Tech Stack

| Layer       | Technology                                          |
| ----------- | --------------------------------------------------- |
| Runtime     | [Node.js](https://nodejs.org/) + TypeScript         |
| Framework   | [NestJS](https://nestjs.com/) 11.x                 |
| Database    | [Supabase](https://supabase.com/) (Postgres)        |
| Hosting     | AWS App Runner (Docker)                              |
| Feed Format | RSS 2.0                                              |
| Linting     | [oxlint](https://oxc.rs/)                           |

## Source Code

[vidluther/linkblog](https://github.com/vidluther/linkblog) on GitHub.
