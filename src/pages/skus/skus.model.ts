/**
 * 货品模块 — 数据类型（教学用）
 *
 * 字段名和后端 domain/Sku.java、SkuCreateRequest.java 一一对应。
 */

/** GET /skus 列表里的一行，也是 POST /skus 成功后返回的对象 */
export interface SkuVO {
  id: number // sku 表主键，插入后才有
  code: string // 货品编码，例如 SKU-001
  name: string // 货品名称
  unit: string // 计量单位
  createdAt: string
  onHand: number // sku.on_hand：这个货品的数量合计，不分库位
}

/** POST /skus 的请求体，三个字段都必填 */
export interface SkuCreatePayload {
  code: string
  name: string
  unit: string
}
