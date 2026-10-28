/**
 * 出库模块 — 数据类型（教学用）
 *
 * 字段名和后端 domain/OutboundOrder.java、OutboundOrderLine.java、
 * OutboundLineRequest.java、OutboundLineQuantityRequest.java 对应。
 */

/** 出库单上的一行 */
export interface OutboundLineVO {
  id: number // outbound_order_line 主键，PATCH 路径里的 {lineId}
  orderId: number
  skuId: number
  skuCode: string
  locationId: number
  locationCode: string
  quantity: number // 这一行出多少
}

/** 新建、加行、完成、改行四个接口都返回这一整张单 */
export interface OutboundOrderVO {
  id: number // outbound_order 主键，路径里的 {id}
  orderNo: string // OUT-主键
  status: 'DRAFT' | 'COMPLETED'
  createdAt: string
  lines: OutboundLineVO[]
}

/** POST /outbound-orders/{id}/lines 的请求体 */
export interface OutboundLinePayload {
  skuCode: string // 例如 SKU-001
  locationCode: string // 从哪个格子出，例如 A-01-01
  quantity: number
}

/** PATCH /outbound-orders/{id}/lines/{lineId} 的请求体：只有新数量 */
export interface OutboundLineQuantityPayload {
  quantity: number
}
