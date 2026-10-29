/**
 * 库存页 Alpine 组件
 *
 * 左边「查一个格子」走缓存，右边「库存表」直接查数据库。课上的操作：先查一次 A-01-01，
 * 到出库页出几个，回来再查一次，看两边是不是同一个数。
 */
import { inventoryApi, type InventoryRowVO } from '@/pages/inventory/inventory.api'
import { skusApi } from '@/pages/skus/skus.api'
import type { SkuVO } from '@/pages/skus/skus.model'
import { warehousesApi } from '@/pages/warehouses/warehouses.api'
import type { LocationVO } from '@/pages/warehouses/warehouses.model'
import { recordCall, type CallResult } from '@/core/ui/callResult'

export function inventoryPageComponent() {
  return {
    skus: [] as SkuVO[],
    locations: [] as LocationVO[],
    rows: [] as InventoryRowVO[],
    form: { skuId: 3, locationId: 1 },
    cached: null as number | null,
    calls: [] as CallResult[],

    skuCode(id: number): string {
      return this.skus.find((s) => s.id === id)?.code ?? String(id)
    },
    locationCode(id: number): string {
      return this.locations.find((l) => l.id === id)?.code ?? String(id)
    },

    /** 查一个格子：GET /inventories?skuId=&locationId=，可能来自 Redis 缓存 */
    async query() {
      const { skuId, locationId } = this.form
      const res = await inventoryApi.quantity(Number(skuId), Number(locationId))
      this.calls = recordCall(this.calls, `GET /inventories?skuId=${skuId}&locationId=${locationId}`, res)
      this.cached = res.ok ? res.data.quantity : null
      await this.loadRows()
    },

    /** 库存表：GET /inventories/list，直接查数据库 */
    async loadRows() {
      const res = await inventoryApi.list()
      if (res.ok) this.rows = res.data
    },

    async init() {
      const [skuRes, locRes] = await Promise.all([skusApi.list(), warehousesApi.listLocations()])
      if (skuRes.ok) this.skus = skuRes.data
      if (locRes.ok) this.locations = [...locRes.data.records].sort((a, b) => a.code.localeCompare(b.code))
      await this.loadRows()
    },
  }
}
