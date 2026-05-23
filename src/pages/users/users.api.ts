import { apiClient, type ApiResult } from '@/core/http/apiClient'
import type {
  UserVO,
  PageResponse,
  UsersListQuery,
  UserCreatePayload,
  UserUpdatePayload,
} from './users.model'

interface UserDetailResponse {
  user: UserVO
  message: string
}

interface CreateUserResponse {
  userId: number
  user: UserVO
  message: string
}

interface UpdateUserResponse {
  user: UserVO
  message: string
}

interface DeleteUserResponse {
  userId: number
  message: string
}

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
  list(query: UsersListQuery): Promise<ApiResult<PageResponse<UserVO>>> {
    return apiClient.get<PageResponse<UserVO>>(`/users?${buildListQuery(query)}`)
  },

  async getById(id: number): Promise<ApiResult<UserVO>> {
    const res = await apiClient.get<UserDetailResponse>(`/users/${id}`)
    if (!res.ok) return res
    return { ok: true, data: res.data.user }
  },

  async create(data: UserCreatePayload): Promise<ApiResult<UserVO>> {
    const res = await apiClient.post<CreateUserResponse>('/users', data)
    if (!res.ok) return res
    return { ok: true, data: res.data.user }
  },

  async update(id: number, data: UserUpdatePayload): Promise<ApiResult<UserVO>> {
    const res = await apiClient.put<UpdateUserResponse>(`/users/${id}`, data)
    if (!res.ok) return res
    return { ok: true, data: res.data.user }
  },

  async remove(id: number): Promise<ApiResult<void>> {
    const res = await apiClient.delete<DeleteUserResponse>(`/users/${id}`)
    if (!res.ok) return res
    return { ok: true, data: undefined }
  },
}
