/**
 * 入库模块 — HTTP 接口封装（教学用）
 *
 * 入库分三步：新建一张空单 → 往单上加行 → 完成。完成那一步才把数量记进库存。
 */
import { apiClient, type ApiResult } from '@/core/http/apiClient'
import type { InboundOrderVO, InboundLinePayload } from './inbound.model'

export const inboundApi = {
  /** POST /inbound-orders：没有请求体，返回一张 DRAFT 空单 */
  create(): Promise<ApiResult<InboundOrderVO>> {
    return apiClient.post<InboundOrderVO>('/inbound-orders')
  },

  /** POST /inbound-orders/{id}/lines：{id} 是单的主键，请求体是货品编码、库位编码、数量 */
  addLine(id: number, data: InboundLinePayload): Promise<ApiResult<InboundOrderVO>> {
    return apiClient.post<InboundOrderVO>(`/inbound-orders/${id}/lines`, data)
  },

  /**
   * POST /inbound-orders/{id}/complete：没有请求体
   * 后端按「货品 + 库位」把每一行的数量写进 inventory 表，单据改成 COMPLETED。
   * 返回里看不到 inventory，要到数据库里看。
   */
  complete(id: number): Promise<ApiResult<InboundOrderVO>> {
    return apiClient.post<InboundOrderVO>(`/inbound-orders/${id}/complete`)
  },
}
