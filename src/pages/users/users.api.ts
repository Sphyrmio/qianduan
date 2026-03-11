import { apiClient, type ApiResult } from '@/core/http/apiClient'
import type { UserVO, PageResponse } from './users.model'

export interface UsersListQuery {
  current: number
  pageSize: number
}

export const usersApi = {
  list(query: UsersListQuery): Promise<ApiResult<PageResponse<UserVO>>> {
    const params = new URLSearchParams({
      current: String(query.current),
      pageSize: String(query.pageSize),
    })
    return apiClient.get<PageResponse<UserVO>>(`/users?${params}`)
  },
}
