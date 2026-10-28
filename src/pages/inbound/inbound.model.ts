/**
 * 入库模块 — 数据类型（教学用）
 *
 * 字段名和后端 domain/InboundOrder.java、InboundOrderLine.java、InboundLineRequest.java 对应。
 */

/** 入库单上的一行 */
export interface InboundLineVO {
  id: number // inbound_order_line 主键
  orderId: number // 属于哪张入库单
  skuId: number // 存进表里的是货品主键
  skuCode: string // 返回时查回来的编码，给页面看
  locationId: number // 存进表里的是库位主键
  locationCode: string
  quantity: number
}

/** 新建、加行、完成三个接口都返回这一整张单 */
export interface InboundOrderVO {
  id: number // inbound_order 主键，路径里的 {id} 就是它
  orderNo: string // IN-主键
  status: 'DRAFT' | 'COMPLETED'
  createdAt: string
  lines: InboundLineVO[]
}

/** POST /inbound-orders/{id}/lines 的请求体：填编码，不填主键 */
export interface InboundLinePayload {
  skuCode: string // 例如 SKU-001
  locationCode: string // 例如 A-01-01
  quantity: number // 大于 0
}
