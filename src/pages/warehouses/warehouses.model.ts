/** 仓库数据模型 */

export interface WarehouseVO {
  id: number
  code: string
  name: string
  type: string
  address: string
  manager: string
  phone: string
  status: string
  capacity: number
  available: boolean
  createdAt: string
  updatedAt: string
}

/** 仓库类型常量 */
export const WAREHOUSE_TYPES = {
  RAW_MATERIAL: 'RAW_MATERIAL',
  FINISHED_GOODS: 'FINISHED_GOODS',
  TRANSFER: 'TRANSFER',
} as const

export type WarehouseType = keyof typeof WAREHOUSE_TYPES

/** 仓库类型标签 */
export const TYPE_LABELS: Record<string, string> = {
  RAW_MATERIAL: '原料仓',
  FINISHED_GOODS: '成品仓',
  TRANSFER: '中转仓',
}

/** 仓库状态标签 */
export const STATUS_LABELS: Record<string, string> = {
  ENABLED: '启用',
  DISABLED: '停用',
}

/** 库区（warehouse_zone 表的一行） */
export interface ZoneVO {
  id: number
  warehouseId: number
  code: string
  name: string
  type: string
  status: string
}

/** 库位（warehouse_location 表的一行）。入库、出库的行里填的就是这里的 code */
export interface LocationVO {
  id: number
  zoneId: number
  code: string
  name: string
  spec: string
  status: string
}

/** GET /warehouses/{id}/tree 的响应：仓库 → 库区 → 库位 */
export interface WarehouseTree {
  warehouse: WarehouseVO
  zones: { zone: ZoneVO; locations: LocationVO[] }[]
}

/** 分页响应结构 */
export interface PageResponse<T> {
  current: number
  pageSize: number
  total: number
  records: T[]
}
