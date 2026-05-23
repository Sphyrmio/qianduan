/**
 * 用户模块 — 数据模型（教学用）
 *
 * 【本文件干什么】
 * 把后端 Swagger 里的 JSON 字段「翻译」成 TypeScript 类型，方便写代码时有提示、少拼错字段名。
 *
 * 【对照 Swagger】
 * 打开 http://localhost:8080/swagger-ui → 用户管理 → 看 Schemas：
 * - UserResponse        → UserVO
 * - CreateUserRequest   → UserCreatePayload
 * - UpdateUserRequest   → UserUpdatePayload
 * - UserPageResponse    → PageResponse<UserVO>
 *
 * 【分层】本文件只做类型定义，不发 HTTP 请求（请求在 users.api.ts）。
 */

/** 一条用户记录，对应后端 UserResponse（注意：永远没有 password 字段） */
export interface UserVO {
  id: number
  username: string
  displayName: string
  email: string
  phone: string
  role: string
  /** 1=正常 0=禁用，与后端 tb_user.status 一致 */
  status: number
  createdAt: string
  updatedAt: string
}

/** 角色英文码 → 中文展示（表格、下拉用） */
export const ROLE_LABELS: Record<string, string> = {
  ADMIN: '系统管理员',
  WAREHOUSE_MANAGER: '仓库管理员',
  OPERATOR: '库管员',
  BUSINESS: '采购/销售/财务',
}

/** 角色下拉选项，值必须与后端 allowableValues 一致 */
export const ROLE_OPTIONS = Object.keys(ROLE_LABELS)

export const STATUS_LABELS: Record<number, string> = {
  1: '正常',
  0: '禁用',
}

/**
 * 分页响应，对应 GET /users 的 200 body。
 * 四个字段名必须与后端 UserPageResponse 完全一致，否则 this.data = res.data.records 会对不上。
 */
export interface PageResponse<T> {
  current: number
  pageSize: number
  total: number
  records: T[]
}

/** GET /users 的 query 参数 */
export interface UsersListQuery {
  current: number
  pageSize: number
  username?: string
  role?: string
  /** 空字符串表示「全部状态」，此时不要传给后端 */
  status?: number | ''
}

/**
 * POST /users 的 request body，对应 CreateUserRequest。
 * username、password、role 在后端有 @NotBlank 校验。
 */
export interface UserCreatePayload {
  username: string
  password: string
  displayName?: string
  role: string
  email?: string
  phone?: string
}

/**
 * PUT /users/{id} 的 request body，对应 UpdateUserRequest。
 * displayName、role 必填；password 不传或空字符串表示不修改密码。
 */
export interface UserUpdatePayload {
  displayName: string
  role: string
  email?: string
  phone?: string
  status?: number
  password?: string
}
