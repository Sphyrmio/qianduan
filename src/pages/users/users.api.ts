/**
 * 用户模块 — HTTP 接口封装（教学用）
 *
 * 【本文件干什么】
 * 一个后端接口对应一个函数；页面（list.ts）只调 usersApi，不直接写 fetch。
 *
 * 【约定】
 * - 路径写 /users、/users/1，不要写 /api/users（apiClient 已带 baseURL /api）
 * - 返回统一用 ApiResult：成功 { ok: true, data }，失败 { ok: false, error }
 * - 后端把 user 包在 { user, message } 里的，在这里拆成 data: user 再给页面用
 *
 * 【教学顺序】建议按 Swagger 顺序实现：list → getById → create → update → remove
 */
import { apiClient, type ApiResult } from '@/core/http/apiClient'
import type {
  UserVO,
  PageResponse,
  UsersListQuery,
  UserCreatePayload,
  UserUpdatePayload,
} from './users.model'

/** GET /users/{id} 的原始响应（Swagger: UserDetailResponse） */
interface UserDetailResponse {
  user: UserVO
  message: string
}

/** POST /users 的原始响应（Swagger: CreateUserResponse） */
interface CreateUserResponse {
  userId: number
  user: UserVO
  message: string
}

/** PUT /users/{id} 的原始响应（Swagger: UpdateUserResponse） */
interface UpdateUserResponse {
  user: UserVO
  message: string
}

/** DELETE /users/{id} 的原始响应（Swagger: DeleteUserResponse） */
interface DeleteUserResponse {
  userId: number
  message: string
}

/** 把列表查询对象转成 ?current=1&pageSize=10&username=... */
function buildListQuery(query: UsersListQuery): string {
  const params = new URLSearchParams({
    current: String(query.current),
    pageSize: String(query.pageSize),
  })
  if (query.username) params.append('username', query.username)
  if (query.role) params.append('role', query.role)
  if (query.status !== undefined && query.status !== '') {
    params.append('status', String(query.status))
  }
  return params.toString()
}

export const usersApi = {
  /**
   * 接口一：分页列表 — GET /users
   * Swagger 200 直接就是 PageResponse，无需拆包。
   */
  list(query: UsersListQuery): Promise<ApiResult<PageResponse<UserVO>>> {
    return apiClient.get<PageResponse<UserVO>>(`/users?${buildListQuery(query)}`)
  },

  /**
   * 接口二：用户详情 — GET /users/{id}
   * 注意：用户信息在 body.user 里，不是根对象。
   */
  async getById(id: number): Promise<ApiResult<UserVO>> {
    const res = await apiClient.get<UserDetailResponse>(`/users/${id}`)
    if (!res.ok) return res
    return { ok: true, data: res.data.user }
  },

  /**
   * 接口三：创建用户 — POST /users
   * body 字段见 UserCreatePayload；成功后可从 res.data 取新建的用户对象。
   */
  async create(data: UserCreatePayload): Promise<ApiResult<UserVO>> {
    const res = await apiClient.post<CreateUserResponse>('/users', data)
    if (!res.ok) return res
    return { ok: true, data: res.data.user }
  },

  /**
   * 接口四：更新用户 — PUT /users/{id}
   * id 在 URL 里；body 不要带 username（后端从路径认用户）。
   */
  async update(id: number, data: UserUpdatePayload): Promise<ApiResult<UserVO>> {
    const res = await apiClient.put<UpdateUserResponse>(`/users/${id}`, data)
    if (!res.ok) return res
    return { ok: true, data: res.data.user }
  },

  /**
   * 接口五：禁用用户 — DELETE /users/{id}
   * 后端是软删除（status=0），不是物理删行。
   */
  async remove(id: number): Promise<ApiResult<void>> {
    const res = await apiClient.delete<DeleteUserResponse>(`/users/${id}`)
    if (!res.ok) return res
    return { ok: true, data: undefined }
  },
}
