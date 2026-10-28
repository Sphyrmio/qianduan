import { can, Perm } from './rbac'
import type { PermKey } from './rbac'

export interface MenuItem {
  key: string
  label: string
  icon: string
  href: string
  perm: PermKey
}

/** 完整菜单配置 */
export const ALL_MENUS: MenuItem[] = [
  {
    key: 'dashboard',
    label: '仪表盘',
    icon: '📊',
    href: '#/',
    perm: Perm.DASHBOARD,
  },
  {
    key: 'users',
    label: '用户管理',
    icon: '👥',
    href: '#/users',
    perm: Perm.USER_LIST,
  },
  {
    key: 'warehouses',
    label: '仓库管理',
    icon: '🏭',
    href: '#/warehouses',
    perm: Perm.WAREHOUSE_LIST,
  },
  {
    key: 'skus',
    label: '货品',
    icon: '📦',
    href: '#/skus',
    perm: Perm.SKU_LIST,
  },
  {
    key: 'inbound',
    label: '入库',
    icon: '📥',
    href: '#/inbound',
    perm: Perm.INBOUND,
  },
  {
    key: 'outbound',
    label: '出库',
    icon: '📤',
    href: '#/outbound',
    perm: Perm.OUTBOUND,
  },
]

/** 根据当前用户权限过滤菜单 */
export function filterMenuByPerms(menus: MenuItem[] = ALL_MENUS): MenuItem[] {
  return menus.filter((item) => can(item.perm))
}
