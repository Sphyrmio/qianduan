name: openapi-sync
description: Pull Spring Boot OpenAPI (Swagger) docs from /v3/api-docs to a local file, cache it, and provide API contract introspection for frontend/backend design.
compatibility: opencode

---

# When to use
Use this skill when:
- A Spring Boot backend exposes OpenAPI at http://localhost:8080/v3/api-docs
- The user wants to download it to a local file (via curl) and use that file to inspect endpoints, request/response schemas, or generate clients/types.

# Default assumptions
- Backend base URL: http://localhost:8080
- OpenAPI endpoint: /v3/api-docs
- Output file:  docs/api/openapi.json (single repo)

# Commands to produce (copy-paste ready)
1) Basic download (overwrite):
   curl -sS 'http://localhost:8080/v3/api-docs' -o docs/api/openapi.json

2) With pretty format (requires jq):
   curl -sS 'http://localhost:8080/v3/api-docs' | jq '.' > docs/api/openapi.json

3) With custom headers (example):
   curl -sS -H 'Authorization: Bearer <TOKEN>' 'http://localhost:8080/v3/api-docs' -o docs/api/openapi.json

4) Save with timestamp and keep latest symlink (optional):
   ts=$(date +%Y%m%d-%H%M%S) && \
   curl -sS 'http://localhost:8080/v3/api-docs' -o docs/api/openapi-$ts.json && \
   cp docs/api/openapi-$ts.json docs/api/openapi.json

# Caching & diff strategy
- If `openapi.json` already exists:
  - Download into a temp file, compare, and only replace if changed:
    curl -sS 'http://localhost:8080/v3/api-docs' -o /tmp/openapi.new.json && \
    (cmp -s /tmp/openapi.new.json docs/api/openapi.json || mv /tmp/openapi.new.json docs/api/openapi.json)

- Provide a short change report if the spec changed:
  - Suggest `diff` or `jd` (json diff) if available.

# How to use the local file for design
When user asks about endpoints:
1) Read and summarize endpoints:
   - group by tag
   - list paths, methods, operationId
2) For a given endpoint:
   - required params
   - requestBody schema
   - response schemas and status codes
3) Output in a consistent "API Card" format:
   - METHOD PATH
   - Summary
   - Auth
   - Request
   - Responses
   - Notes

# Guardrails
- Do not assume the OpenAPI schema is stable; always base answers on the latest downloaded file.
- If the backend is not running or curl fails, report the failure and provide troubleshooting steps.
- Avoid generating huge SDK code unless explicitly requested.

# Optional enhancements (only on request)
- Generate TypeScript types/client via openapi-typescript / openapi-fetch
- Validate spec via swagger-cli