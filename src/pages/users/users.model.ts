/** 用户数据模型（对应真实后端 /users 接口） */

export interface UserVO {
  id: number
  username: string
  displayName: string
  email: string
  phone: string
  role: string
  /** 1=正常 0=禁用 */
  status: number
  createdAt: string
  updatedAt: string
}

export const ROLE_LABELS: Record<string, string> = {
  ADMIN: '系统管理员',
  WAREHOUSE_MANAGER: '仓库管理员',
  OPERATOR: '库管员',
  BUSINESS: '采购/销售/财务',
}

export const STATUS_LABELS: Record<number, string> = {
  1: '正常',
  0: '禁用',
}

/** 后端分页响应结构 */
export interface PageResponse<T> {
  current: number
  pageSize: number
  total: number
  records: T[]
}
