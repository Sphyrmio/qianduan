/**
 * 出库模块 — HTTP 接口封装（教学用）
 *
 * 和入库对称：新建 → 加行 → 完成。多一个改行数量的 PATCH。
 * 完成时后端从「货品 + 库位」那一格减掉行上的数量。
 */
import { apiClient, type ApiResult } from '@/core/http/apiClient'
import type { OutboundOrderVO, OutboundLinePayload, OutboundLineQuantityPayload } from './outbound.model'

export const outboundApi = {
  /** POST /outbound-orders：没有请求体，返回一张 DRAFT 空单 */
  create(): Promise<ApiResult<OutboundOrderVO>> {
    return apiClient.post<OutboundOrderVO>('/outbound-orders')
  },

  /** POST /outbound-orders/{id}/lines：货品编码、库位编码、数量 */
  addLine(id: number, data: OutboundLinePayload): Promise<ApiResult<OutboundOrderVO>> {
    return apiClient.post<OutboundOrderVO>(`/outbound-orders/${id}/lines`, data)
  },

  /**
   * POST /outbound-orders/{id}/complete：没有请求体
   * 剩余不够时，原分支照减（库存变成负数）；改良版返回 400 INSUFFICIENT_STOCK。
   * 两张单同时完成时，原分支两张都 200；改良版有一张 400 STOCK_CONFLICT。
   */
  complete(id: number): Promise<ApiResult<OutboundOrderVO>> {
    return apiClient.post<OutboundOrderVO>(`/outbound-orders/${id}/complete`)
  },

  /**
   * PATCH /outbound-orders/{id}/lines/{lineId}：改一行的数量
   * 单已经 COMPLETED 时，原分支照改；改良版返回 400 ORDER_NOT_EDITABLE。
   */
  updateLine(id: number, lineId: number, data: OutboundLineQuantityPayload): Promise<ApiResult<OutboundOrderVO>> {
    return apiClient.patch<OutboundOrderVO>(`/outbound-orders/${id}/lines/${lineId}`, data)
  },
}
