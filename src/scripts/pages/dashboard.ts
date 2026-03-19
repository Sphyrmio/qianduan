/**
 * 仪表盘页面 Alpine 组件
 */

import { sessionStore } from '@/core/auth/session.store'
import { can } from '@/core/rbac/rbac'

export function dashboardComponent() {
  return {
    // 用户信息
    user: null as any,

    // 权限检查
    can(permission: string): boolean {
      return can(permission as any)
    },

    // 获取用户显示名称
    get displayName(): string {
      return this.user?.displayName ?? this.user?.username ?? '用户'
    },

    // 获取用户名
    get username(): string {
      return this.user?.username ?? '-'
    },

    // 获取角色
    get role(): string {
      return this.user?.role ?? '-'
    },

    // 初始化
    init() {
      const { user } = sessionStore.get()
      this.user = user
    },

    // 导航
    navigate(path: string) {
      location.hash = '#' + path
    },
  }
}