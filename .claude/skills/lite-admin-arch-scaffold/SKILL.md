name: lite-admin-arch-scaffold
description: Generate a runnable Vite + TS + Vanilla lightweight admin scaffold with router/auth/rbac/http/ui layering, plus example workorders module and minimal DataTable.
compatibility: opencode

---

# Inputs to Ask (Only if missing)
- project name (default: lite-admin)
- router mode: hash or history (default: hash)
- auth: JWT+refresh endpoints (`/login`, `/me`, `/refresh`) (default placeholders)
- base API url (default: /api)

# Generate Outputs
Must generate:
1) Directory structure under `src/` matching the architecture contract.
2) Minimal runnable router + route guard:
   - requiresAuth
   - perm gate
   - layout selection (AppShell/LoginShell)
3) Auth services:
   - login/logout/getMe/refresh
   - token store (memory + localStorage)
   - session store (user + perms)
4) RBAC:
   - `can(perm)` and menu filtering
5) HTTP:
   - `apiClient` with token attach + 401 refresh once + retry
6) UI:
   - AppShell with left menu + top bar
   - LoginShell
   - DataTable (native table + sort + pagination hooks)
   - ConfirmDialog (Shoelace dialog wrapper)
7) Pages:
   - login page
   - dashboard page
   - workorders list/detail/edit pages (mock data + API placeholders)

# Constraints
- No Vue/React/Angular
- Prefer Shoelace components for controls
- Prefer UnoCSS utility classes for layout
- Keep pages thin; core owns infrastructure

# Delivery
- Provide file tree
- Provide file contents for newly created files
- Ensure `pnpm run dev` works after generation