# Changelog

All notable changes to this project will be documented in this file.

## [1.0.0] - 2026-07-05
### Added
- **Security**: Added robust authentication enforcement for admin routes via `middleware.ts`.
- **Security**: Centralized input validation and sanitization (`lib/security.ts`).
- **Security**: Added rate-limiting (In-Memory) to prevent API abuse, especially on Groq integrations.
- **Security**: Added HSTS, CSP, and CSRF protection in Next.js middleware.
- **Docker**: Hardened Dockerfile to use a non-root user (`nextjs`) and Multi-stage builds.
- **Legal**: Added `LICENSE` (BSL-1.1) and `NOTICE` files attributing ownership to Carlos Antonio de Oliveira Piquet.
- **Config**: Added `railway.toml` for production deployment.
- **Doc**: Added `SECURITY.md`, `CONTRIBUTING.md`, and updated `README.md`.
