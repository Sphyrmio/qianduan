import type { PermKey } from '@/core/rbac/rbac'

export type LayoutType = 'app' | 'login' | 'blank'

export interface RouteMeta {
  requiresAuth: boolean
  perm?: PermKey
  layout: LayoutType
  title?: string
}

export interface RouteConfig {
  path: string
  meta: RouteMeta
  page: () => Promise<{ mount: (el: HTMLElement) => void; unmount?: () => void }>
}

export const routes: RouteConfig[] = [
  {
    path: '/',
    meta: { requiresAuth: true, layout: 'app', title: '仪表盘', perm: 'dashboard:view' },
    page: () => import('@/pages/dashboard/dashboard.page'),
  },
  {
    path: '/login',
    meta: { requiresAuth: false, layout: 'login', title: '登录' },
    page: () => import('@/pages/login/login.page'),
  },
  {
    path: '/users',
    meta: { requiresAuth: true, layout: 'app', title: '用户列表', perm: 'user:list' },
    page: () => import('@/pages/users/list.page'),
  },
  {
    path: '/403',
    meta: { requiresAuth: false, layout: 'blank', title: '无权限' },
    page: () => import('@/pages/error/403.page'),
  },
  {
    path: '/404',
    meta: { requiresAuth: false, layout: 'blank', title: '页面不存在' },
    page: () => import('@/pages/error/404.page'),
  },
]
