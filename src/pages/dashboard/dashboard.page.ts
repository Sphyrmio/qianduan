import { sessionStore } from '@/core/auth/session.store'
import { can, Perm } from '@/core/rbac/rbac'

export function mount(container: HTMLElement): void {
  const { user } = sessionStore.get()

  container.innerHTML = `
    <div>
      <h2 class="page-title" style="margin-bottom:1.5rem">欢迎回来，${user?.displayName ?? user?.username ?? '用户'}</h2>

      <div class="stat-grid">
        ${can(Perm.USER_LIST) ? `
        <div class="card stat-card stat-card-clickable" data-nav="/users">
          <span class="stat-icon">👥</span>
          <p class="stat-label">用户管理</p>
          <p class="stat-value">查看所有用户</p>
        </div>
        ` : ''}

        <div class="card stat-card">
          <span class="stat-icon">👤</span>
          <p class="stat-label">当前用户</p>
          <p class="stat-value">${user?.username ?? '-'}</p>
        </div>

        <div class="card stat-card">
          <span class="stat-icon">🔑</span>
          <p class="stat-label">角色</p>
          <p class="stat-value">${user?.role ?? '-'}</p>
        </div>
      </div>
    </div>
  `

  container.querySelectorAll<HTMLElement>('[data-nav]').forEach((el) => {
    el.addEventListener('click', () => {
      const path = el.getAttribute('data-nav')!
      location.hash = '#' + path
    })
  })
}
