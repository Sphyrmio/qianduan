name: lite-admin-arch-guard
description: Guardrails for a Vite + TS + Vanilla lightweight admin architecture (router/auth/rbac/http/ui split), enforcing permission-driven routing/menu and clean layering.
compatibility: opencode

---

# Scope
This skill applies when building or refactoring a lightweight admin front-end with:
- Vite + TypeScript
- Vanilla/Minimal helper (no Vue/React)
- Shoelace (Web Components) for UI pieces
- UnoCSS for styling
- Navigo (or simple router wrapper)

# Architecture Rules (Non-negotiable)
1) Put "app capabilities" under `src/core/` (router/auth/rbac/http/ui).
2) Pages under `src/pages/` must be thin: event binding + calling API + rendering.
3) Permission-driven UI:
   - backend provides `perms` list via session endpoint (e.g. `/me`)
   - frontend keeps Route + Menu configs and filters with `can()`.
4) Auth model: JWT + refresh
   - apiClient attaches access token
   - 401 triggers ONE refresh + retry; refresh failure => logout => redirect login
5) UI: Shoelace for controls, native `<table>` for data tables, wrap into `DataTable` component.

# Directory Contract (Must match)
- `src/core/router/{router.ts,routes.ts,guard.ts}`
- `src/core/auth/{auth.service.ts,token.store.ts,session.store.ts,auth.api.ts}`
- `src/core/rbac/{rbac.ts,menu.ts,(perms.ts optional)}`
- `src/core/http/{apiClient.ts,errors.ts,(interceptors.ts optional)}`
- `src/core/ui/layout/{AppShell.ts,LoginShell.ts}`
- `src/core/ui/components/{DataTable.ts,ConfirmDialog.ts,(FormView.ts optional)}`
- `src/pages/{login,dashboard,workorders}/...`

# How to Use (Checklist for the agent)
When user asks for a feature/change:
1) Identify which layer it belongs to (core vs pages).
2) Ensure route/menu permission gating is respected.
3) Ensure API calls go through `apiClient`.
4) Ensure pages do not own auth/rbac/http logic.
5) Output a short "Compliance Report":
   - what files changed
   - which rules were applied
   - any deviations + rationale

# Output Format
- Provide file-tree diff
- Provide key snippets only
- Avoid introducing heavy frameworks