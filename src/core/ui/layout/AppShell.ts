import { filterMenuByPerms } from '@/core/rbac/menu'
import { sessionStore } from '@/core/auth/session.store'
import { logout } from '@/core/auth/auth.service'
import { router } from '@/core/router/router'

const appEl = () => document.getElementById('app')!

let _shellRendered: 'app' | 'login' | 'blank' | null = null

export function renderAppShell(): void {
  if (_shellRendered === 'app') return
  _shellRendered = 'app'

  const { user } = sessionStore.get()
  const menus = filterMenuByPerms()

  const menuHtml = menus
    .map(
      (m) =>
        `<a class="sidebar-link" data-href="${m.href}" href="${m.href}">
          <span>${m.icon}</span>
          <span>${m.label}</span>
        </a>`,
    )
    .join('')

  appEl().innerHTML = `
    <div class="shell">
      <aside class="sidebar">
        <div class="sidebar-logo">工单管理系统</div>
        <nav class="sidebar-nav" id="sidebar-nav">${menuHtml}</nav>
        <div class="sidebar-footer">
          <span>${user?.displayName ?? user?.username ?? ''}</span>
          <button id="logout-btn" class="link-btn link-btn-danger">退出</button>
        </div>
      </aside>

      <div class="main">
        <header class="topbar">
          <span id="page-title" class="topbar-title"></span>
          <span class="topbar-user">${user?.username ?? ''}</span>
        </header>
        <main id="page-content" class="page-content"></main>
      </div>
    </div>
    <div id="toast-container"></div>
  `

  document.getElementById('logout-btn')?.addEventListener('click', () => {
    logout()
    router.navigate('/login')
  })

  sessionStore.subscribe(() => {
    _shellRendered = null
  })
}

export function renderLoginShell(): void {
  if (_shellRendered === 'login') return
  _shellRendered = 'login'

  appEl().innerHTML = `
    <div class="login-shell">
      <div id="page-content" class="login-box"></div>
    </div>
  `
}

export function renderBlank(): void {
  if (_shellRendered === 'blank') return
  _shellRendered = 'blank'

  appEl().innerHTML = `
    <div class="blank-shell">
      <div id="page-content"></div>
    </div>
  `
}

export function showToast(message: string, type: 'success' | 'error' | 'info' = 'info', duration = 3000): void {
  const container = document.getElementById('toast-container')
  if (!container) return

  const el = document.createElement('div')
  el.className = `toast toast-${type}`
  el.textContent = message
  container.appendChild(el)

  setTimeout(() => el.remove(), duration)
}
