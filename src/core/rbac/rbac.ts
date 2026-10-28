import { sessionStore } from '@/core/auth/session.store'

/**
 * 检查当前用户是否拥有指定权限
 * @param perm 权限标识，如 'workorder:list'
 */
export function can(perm: string): boolean {
  const { perms } = sessionStore.get()
  return perms.includes(perm)
}

/**
 * 检查当前用户是否拥有任意一个权限
 */
export function canAny(...perms: string[]): boolean {
  const { perms: userPerms } = sessionStore.get()
  return perms.some((p) => userPerms.includes(p))
}

/** 权限常量枚举 */
export const Perm = {
  DASHBOARD: 'dashboard:view',
  USER_LIST: 'user:list',
  WAREHOUSE_LIST: 'warehouse:list',
  WAREHOUSE_CREATE: 'warehouse:create',
  WAREHOUSE_EDIT: 'warehouse:edit',
  WAREHOUSE_DELETE: 'warehouse:delete',
  SKU_LIST: 'sku:list',
  INBOUND: 'inbound:use',
  OUTBOUND: 'outbound:use',
} as const

export type PermKey = (typeof Perm)[keyof typeof Perm]
