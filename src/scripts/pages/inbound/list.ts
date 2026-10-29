/**
 * 入库页 Alpine 组件
 *
 * 上面是这个浏览器建过的入库单，下面是选中的那一张：加行、完成。最下面是「接口返回」。
 * 课上的操作：建单 → 加一行 SKU-003 / A-01-01 / 10 → 完成，再到数据库看 inventory 多了哪一行。
 */
import { inboundApi } from '@/pages/inbound/inbound.api'
import type { InboundOrderVO } from '@/pages/inbound/inbound.model'
import { skusApi } from '@/pages/skus/skus.api'
import type { SkuVO } from '@/pages/skus/skus.model'
import { warehousesApi } from '@/pages/warehouses/warehouses.api'
import type { LocationVO } from '@/pages/warehouses/warehouses.model'
import { recordCall, type CallResult } from '@/core/ui/callResult'
import { loadOrders, upsertOrder, clearOrders } from '@/core/ui/orderHistory'
import { attachmentApi, type AttachmentVO } from '@/pages/inbound/attachment.api'
import { toCallResult } from '@/core/ui/callResult'

const STORE_KEY = 'wms.inboundOrders'
const ATTACH_KEY = 'wms.inboundAttachments'

export function inboundPageComponent() {
  return {
    orders: loadOrders<InboundOrderVO>(STORE_KEY),
    currentId: null as number | null,
    skus: [] as SkuVO[],
    locations: [] as LocationVO[],
    form: { skuCode: 'SKU-003', locationCode: 'A-01-01', quantity: 10 },
    calls: [] as CallResult[],
    /** 这个浏览器上传过的附件，按入库单主键分组。后端没有列出附件的接口 */
    attachments: JSON.parse(localStorage.getItem(ATTACH_KEY) ?? '{}') as Record<number, AttachmentVO[]>,
    file: null as File | null,
    busy: false,

    get current(): InboundOrderVO | null {
      return this.orders.find((o) => o.id === this.currentId) ?? null
    },

    /** 下拉框里的货品编码 */
    get skuCodes(): string[] {
      return [...new Set(this.skus.map((s) => s.code))]
    },

    async loadOptions() {
      const [skuRes, locRes] = await Promise.all([skusApi.list(), warehousesApi.listLocations()])
      if (skuRes.ok) this.skus = skuRes.data
      if (locRes.ok) this.locations = [...locRes.data.records].sort((a, b) => a.code.localeCompare(b.code))
    },

    /** 接口返回整张单时，更新左边的记录并选中它 */
    keep(order: InboundOrderVO) {
      this.orders = upsertOrder(STORE_KEY, this.orders, order)
      this.currentId = order.id
    },

    async createOrder() {
      this.busy = true
      const res = await inboundApi.create()
      this.calls = recordCall(this.calls, 'POST /inbound-orders', res)
      if (res.ok) this.keep(res.data)
      this.busy = false
    },

    async addLine() {
      if (!this.current) return
      this.busy = true
      const id = this.current.id
      const res = await inboundApi.addLine(id, { ...this.form, quantity: Number(this.form.quantity) })
      this.calls = recordCall(this.calls, `POST /inbound-orders/${id}/lines`, res)
      if (res.ok) this.keep(res.data)
      this.busy = false
    },

    get currentAttachments(): AttachmentVO[] {
      return this.current ? this.attachments[this.current.id] ?? [] : []
    },

    /** 上传附件：POST /inbound-orders/{id}/attachments，表单字段 file */
    async upload() {
      if (!this.current || !this.file) return
      this.busy = true
      const id = this.current.id
      const res = await attachmentApi.upload(id, this.file)
      this.calls = recordCall(this.calls, `POST /inbound-orders/${id}/attachments（${this.file.name}）`, res)
      if (res.ok) {
        this.attachments = { ...this.attachments, [id]: [...(this.attachments[id] ?? []), res.data] }
        localStorage.setItem(ATTACH_KEY, JSON.stringify(this.attachments))
      }
      this.busy = false
    },

    /** 下载附件：GET /inbound-orders/{id}/attachments/{attachmentId}。文本内容直接显示在「接口返回」里 */
    async download(a: AttachmentVO) {
      const res = await attachmentApi.download(a.orderId, a.id)
      const action = `GET /inbound-orders/${a.orderId}/attachments/${a.id}（${a.fileName}）`
      if (res.ok) {
        const c = toCallResult(action, { ok: true, data: null, status: res.status })
        c.body = res.data.text
        this.calls = [c, ...this.calls].slice(0, 8)
        const link = document.createElement('a')
        link.href = URL.createObjectURL(res.data.blob)
        link.download = a.fileName
        link.click()
        URL.revokeObjectURL(link.href)
      } else {
        this.calls = recordCall(this.calls, action, res)
      }
    },

    async complete() {
      if (!this.current) return
      this.busy = true
      const id = this.current.id
      const res = await inboundApi.complete(id)
      this.calls = recordCall(this.calls, `POST /inbound-orders/${id}/complete`, res)
      if (res.ok) this.keep(res.data)
      this.busy = false
    },

    clearHistory() {
      clearOrders(STORE_KEY)
      localStorage.removeItem(ATTACH_KEY)
      this.attachments = {}
      this.orders = []
      this.currentId = null
    },

    init() {
      this.currentId = this.orders[0]?.id ?? null
      this.loadOptions()
    },
  }
}
