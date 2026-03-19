/**
 * AppShell Alpine 组件
 * 管理主应用布局（侧边栏、顶栏、用户信息）
 */

import { filterMenuByPerms, type MenuItem } from '@/core/rbac/menu'
import { sessionStore } from '@/core/auth/session.store'
import { logout } from '@/core/auth/auth.service'
import { router } from '@/core/router/router'

export function appShellComponent() {
  return {
    menus: [] as MenuItem[],
    user: sessionStore.get().user,
    pageTitle: '',

    /**
     * 初始化
     */
    init() {
      // 加载菜单
      this.menus = filterMenuByPerms()
      
      // 订阅 session 变化
      sessionStore.subscribe(() => {
        this.user = sessionStore.get().user
        if (!this.user) {
          // 用户已退出，跳转登录页
          router.navigate('/login')
        }
      })

      // 监听路由变化，更新页面标题（在 init 时获取当前标题）
      const currentPath = location.hash.replace('#', '') || '/'
      this.pageTitle = this.getPageTitle(currentPath)
    },

    /**
     * 根据路径获取页面标题
     */
    getPageTitle(path: string): string {
      const menu = this.menus.find(m => m.href === path)
      return menu?.label || ''
    },

    /**
     * 导航到指定路径
     */
    navigateTo(href: string) {
      router.navigate(href)
    },

    /**
     * 退出登录
     */
    handleLogout() {
      logout()
      router.navigate('/login')
    },
  }
}

/**
 * 更新页面标题（外部调用）
 */
export function setPageTitle(title: string): void {
  const el = document.getElementById('page-title')
  if (el) {
    el.textContent = title
  }
}

/**
 * 显示 Toast 消息（兼容原有 API）
 */
export function showToast(
  message: string, 
  type: 'success' | 'error' | 'info' = 'info', 
  duration = 3000
): void {
  const container = document.getElementById('toast-container')
  if (!container) return

  const el = document.createElement('div')
  el.className = `toast toast-${type}`
  el.textContent = message
  container.appendChild(el)

  setTimeout(() => el.remove(), duration)
}
