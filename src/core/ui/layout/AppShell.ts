import { filterMenuByPerms } from '@/core/rbac/menu'
import { sessionStore } from '@/core/auth/session.store'
import { logout } from '@/core/auth/auth.service'
import { router } from '@/core/router/router'
import { renderTemplate } from '@/core/ui/template'
import appShellTemplate from './AppShell.app.html?raw'
import blankShellTemplate from './AppShell.blank.html?raw'
import loginShellTemplate from './AppShell.login.html?raw'

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

  appEl().innerHTML = renderTemplate(appShellTemplate, {
    menuItems: menuHtml,
    displayName: user?.displayName ?? user?.username ?? '',
    username: user?.username ?? '',
  })

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

  appEl().innerHTML = loginShellTemplate
}

export function renderBlank(): void {
  if (_shellRendered === 'blank') return
  _shellRendered = 'blank'

  appEl().innerHTML = blankShellTemplate
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
