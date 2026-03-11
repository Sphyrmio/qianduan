import { sessionStore } from '@/core/auth/session.store'
import { can } from '@/core/rbac/rbac'
import type { RouteMeta } from './routes'

export interface GuardContext {
  meta: RouteMeta
  /** 目标路径，用于登录后回跳 */
  targetPath: string
}

export type GuardAction =
  | { action: 'allow' }
  | { action: 'redirect'; to: string }

/**
 * 路由守卫：
 * 1. requiresAuth && 未登录 -> 跳登录页，并保存 returnUrl
 * 2. 有权限要求 && 无该权限 -> 跳 403
 * 3. 其余放行
 */
export function runGuard(ctx: GuardContext): GuardAction {
  const { meta, targetPath } = ctx

  if (meta.requiresAuth && !sessionStore.isLoggedIn()) {
    const returnUrl = encodeURIComponent(targetPath)
    return { action: 'redirect', to: `/login?returnUrl=${returnUrl}` }
  }

  if (meta.perm && !can(meta.perm)) {
    return { action: 'redirect', to: '/403' }
  }

  return { action: 'allow' }
}
