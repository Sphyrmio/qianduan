/**
 * 出库页 Alpine 组件
 *
 * 布局和入库页一样：左边是建过的出库单，右边是选中的那一张。多了两样：
 * 1. 每一行可以改数量（PATCH），用来看已完成的单还能不能改。
 * 2. 左边勾选几张草稿单，点「同时完成勾选的单」，几个 complete 请求一起发出去。
 *    后端把 outbound-read-pause-ms 设成 3000 时，两张单都会在对方写回之前读到同一个数量。
 */
import { outboundApi } from '@/pages/outbound/outbound.api'
import type { OutboundOrderVO } from '@/pages/outbound/outbound.model'
import { skusApi } from '@/pages/skus/skus.api'
import { warehousesApi } from '@/pages/warehouses/warehouses.api'
import type { LocationVO } from '@/pages/warehouses/warehouses.model'
import { recordCall, callTime, type CallResult } from '@/core/ui/callResult'
import { loadOrders, upsertOrder, clearOrders } from '@/core/ui/orderHistory'

const STORE_KEY = 'wms.outboundOrders'

export function outboundPageComponent() {
  return {
    orders: loadOrders<OutboundOrderVO>(STORE_KEY),
    currentId: null as number | null,
    skuCodes: [] as string[],
    locations: [] as LocationVO[],
    form: { skuCode: 'SKU-001', locationCode: 'A-01-01', quantity: 15 },
    /** 每一行要改成的数量，键是行主键 */
    editQty: {} as Record<number, number>,
    /** 勾选了要同时完成的单的主键 */
    selected: [] as number[],
    calls: [] as CallResult[],
    busy: false,

    get current(): OutboundOrderVO | null {
      return this.orders.find((o) => o.id === this.currentId) ?? null
    },

    async loadOptions() {
      const [skuRes, locRes] = await Promise.all([skusApi.list(), warehousesApi.listLocations()])
      if (skuRes.ok) this.skuCodes = [...new Set(skuRes.data.map((s) => s.code))]
      if (locRes.ok) this.locations = [...locRes.data.records].sort((a, b) => a.code.localeCompare(b.code))
    },

    keep(order: OutboundOrderVO) {
      this.orders = upsertOrder(STORE_KEY, this.orders, order)
      this.currentId = order.id
    },

    async createOrder() {
      this.busy = true
      const res = await outboundApi.create()
      this.calls = recordCall(this.calls, 'POST /outbound-orders', res)
      if (res.ok) this.keep(res.data)
      this.busy = false
    },

    async addLine() {
      if (!this.current) return
      this.busy = true
      const id = this.current.id
      const res = await outboundApi.addLine(id, { ...this.form, quantity: Number(this.form.quantity) })
      this.calls = recordCall(this.calls, `POST /outbound-orders/${id}/lines`, res)
      if (res.ok) this.keep(res.data)
      this.busy = false
    },

    /**
     * 模拟网络慢时同一次「加一行」被发了两遍：两个请求带同一个 Idempotency-Key。
     * 后端 submit-once 打开时只加一行，第二次原样返回；关掉时加两行。
     */
    async addLineTwice() {
      if (!this.current) return
      this.busy = true
      const id = this.current.id
      const key = crypto.randomUUID()
      const payload = { ...this.form, quantity: Number(this.form.quantity) }
      for (const n of [1, 2]) {
        const res = await outboundApi.addLine(id, payload, key)
        this.calls = recordCall(this.calls, `POST /outbound-orders/${id}/lines（第 ${n} 次，Idempotency-Key ${key.slice(0, 8)}…）`, res)
        if (res.ok) this.keep(res.data)
      }
      this.busy = false
    },

    async complete() {
      if (!this.current) return
      this.busy = true
      const id = this.current.id
      const res = await outboundApi.complete(id)
      this.calls = recordCall(this.calls, `POST /outbound-orders/${id}/complete`, res)
      if (res.ok) this.keep(res.data)
      this.busy = false
    },

    async updateLine(lineId: number) {
      if (!this.current) return
      const quantity = Number(this.editQty[lineId])
      if (!quantity) return
      this.busy = true
      const id = this.current.id
      const res = await outboundApi.updateLine(id, lineId, { quantity })
      this.calls = recordCall(this.calls, `PATCH /outbound-orders/${id}/lines/${lineId}`, res)
      if (res.ok) this.keep(res.data)
      this.busy = false
    },

    /**
     * 勾选的单一起完成：先把请求全部发出去，再一起等结果。
     * 每条结果记的是它回来的时间；发出时间写在接口名后面，能看出它们是同一刻出发的。
     */
    async completeTogether() {
      const ids = [...this.selected]
      if (ids.length < 2) return
      this.busy = true
      const sentAt = callTime()
      const results = await Promise.all(
        ids.map((id) => outboundApi.complete(id).then((res) => ({ id, res, at: callTime() }))),
      )
      results.sort((a, b) => a.at.localeCompare(b.at))
      for (const { id, res, at } of results) {
        this.calls = recordCall(this.calls, `POST /outbound-orders/${id}/complete（${sentAt} 同时发出）`, res, at)
        if (res.ok) this.orders = upsertOrder(STORE_KEY, this.orders, res.data)
      }
      this.selected = []
      this.busy = false
    },

    clearHistory() {
      clearOrders(STORE_KEY)
      this.orders = []
      this.currentId = null
      this.selected = []
    },

    init() {
      this.currentId = this.orders[0]?.id ?? null
      this.loadOptions()
    },
  }
}
