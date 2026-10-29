/**
 * 库存模块 — HTTP 接口封装（教学用）
 *
 * 两个接口查的是同一份数量，来源不同：
 * - GET /inventories?skuId=&locationId=  先查 Redis 缓存（inv:货品:库位），没有才查数据库
 * - GET /inventories/list                直接查数据库 inventory 表
 * 缓存没删时，两边会对不上。
 */
import { apiClient, type ApiResult } from '@/core/http/apiClient'

export interface QuantityVO {
  skuId: number
  locationId: number
  quantity: number
}

export interface InventoryRowVO {
  id: number
  skuId: number
  locationId: number
  quantity: number
  version: number
}

export const inventoryApi = {
  quantity(skuId: number, locationId: number): Promise<ApiResult<QuantityVO>> {
    return apiClient.get<QuantityVO>(`/inventories?skuId=${skuId}&locationId=${locationId}`)
  },

  list(): Promise<ApiResult<InventoryRowVO[]>> {
    return apiClient.get<InventoryRowVO[]>('/inventories/list')
  },
}
