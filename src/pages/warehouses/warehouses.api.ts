import { apiClient, type ApiResult } from '@/core/http/apiClient'
import type { WarehouseVO, PageResponse } from './warehouses.model'

export interface WarehouseCreatePayload {
  code: string
  name: string
  type: string
  address?: string
  manager?: string
  phone?: string
  capacity?: number
}

export interface WarehouseUpdatePayload {
  name: string
  type?: string
  address?: string
  manager?: string
  phone?: string
  status?: string
  capacity?: number
}

export interface WarehouseListQuery {
  current: number
  pageSize: number
  code?: string
  name?: string
  type?: string
  status?: string
}

export const warehousesApi = {
  list(query: WarehouseListQuery): Promise<ApiResult<PageResponse<WarehouseVO>>> {
    const params = new URLSearchParams({
      current: String(query.current),
      pageSize: String(query.pageSize),
    })
    if (query.code) params.append('code', query.code)
    if (query.name) params.append('name', query.name)
    if (query.type) params.append('type', query.type)
    if (query.status) params.append('status', query.status)
    return apiClient.get<PageResponse<WarehouseVO>>(`/warehouses/list?${params}`)
  },

  getById(id: number): Promise<ApiResult<WarehouseVO>> {
    return apiClient.get<WarehouseVO>(`/warehouses/${id}`)
  },

  create(data: WarehouseCreatePayload): Promise<ApiResult<WarehouseVO>> {
    return apiClient.post<WarehouseVO>('/warehouses', data)
  },

  update(id: number, data: WarehouseUpdatePayload): Promise<ApiResult<WarehouseVO>> {
    return apiClient.put<WarehouseVO>(`/warehouses/${id}`, data)
  },

  delete(id: number): Promise<ApiResult<void>> {
    return apiClient.delete(`/warehouses/${id}`)
  },
}
