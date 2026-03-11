import { apiClient, type ApiResult } from '@/core/http/apiClient'

export interface LoginRequest {
  username: string
  password: string
}

/** POST /auth/login 响应 */
export interface LoginResponse {
  token: string
  username: string
  role: string
}

export const authApi = {
  login(data: LoginRequest): Promise<ApiResult<LoginResponse>> {
    return apiClient.post<LoginResponse>('/auth/login', data)
  },
}
