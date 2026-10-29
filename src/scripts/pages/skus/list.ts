/**
 * 货品页 Alpine 组件
 *
 * 上面一张表单新建货品，下面一张表列出全部货品，最下面是「接口返回」。
 * 课上的操作：先建 SKU-003，再建一次已经有的 SKU-001，第二次返回 400，表里不多一行。
 */
import { skusApi } from '@/pages/skus/skus.api'
import type { SkuVO } from '@/pages/skus/skus.model'
import { recordCall, type CallResult } from '@/core/ui/callResult'

export function skuListComponent() {
  return {
    rows: [] as SkuVO[],
    form: { code: 'SKU-003', name: '垫圈', unit: '个' },
    calls: [] as CallResult[],
    submitting: false,

    // record 为 false 时只刷新表格，不往「接口返回」里记，免得把刚才那次新建挤下去
    async loadList(record = true) {
      const res = await skusApi.list()
      if (record) this.calls = recordCall(this.calls, 'GET /skus', res)
      if (res.ok) this.rows = res.data
    },

    async create() {
      this.submitting = true
      const res = await skusApi.create({ ...this.form })
      this.calls = recordCall(this.calls, 'POST /skus', res)
      this.submitting = false
      // 不管成功失败都重新拉一次列表，表里有没有多出一行一眼就能看到
      await this.loadList(false)
    },

    init() {
      this.loadList(false)
    },
  }
}
