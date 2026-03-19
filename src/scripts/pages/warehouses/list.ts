/**
 * 仓库列表页 Alpine 组件
 */

import { warehousesApi } from '@/pages/warehouses/warehouses.api'
import { TYPE_LABELS, STATUS_LABELS, type WarehouseVO } from '@/pages/warehouses/warehouses.model'
import { confirm } from '@/scripts/components'

const PAGE_SIZE = 10

export function warehouseListComponent() {
  return {
    // 数据
    data: [] as WarehouseVO[],
    loading: false,
    total: 0,
    page: 1,
    pageSize: PAGE_SIZE,
    error: '',

    // 筛选条件
    filters: {
      code: '',
      type: '',
      status: '',
    },

    // 计算总页数
    get totalPages() {
      return Math.max(1, Math.ceil(this.total / this.pageSize))
    },

    // 获取类型标签
    getTypeLabel(type: string): string {
      return TYPE_LABELS[type] ?? type
    },

    // 获取状态标签
    getStatusLabel(status: string): string {
      return STATUS_LABELS[status] ?? status
    },

    // 获取状态样式
    getStatusClass(status: string): string {
      return status === 'ENABLED' ? 'badge-green' : 'badge-gray'
    },

    // 加载数据
    async loadData(page: number = 1) {
      this.page = page
      this.loading = true
      this.error = ''
      this.data = []

      try {
        const res = await warehousesApi.list({
          current: page,
          pageSize: this.pageSize,
          ...(this.filters.code && { code: this.filters.code, name: this.filters.code }),
          ...(this.filters.type && { type: this.filters.type }),
          ...(this.filters.status && { status: this.filters.status }),
        })

        if (!res.ok) {
          this.error = res.error.message
          return
        }

        const { records, total } = res.data
        this.data = records
        this.total = total
      } catch (error) {
        console.error('Failed to load warehouses:', error)
        this.error = '加载数据失败'
      } finally {
        this.loading = false
      }
    },

    // 刷新
    refresh() {
      this.loadData(this.page)
    },

    // 搜索
    search() {
      this.loadData(1)
    },

    // 重置筛选
    reset() {
      this.filters = { code: '', type: '', status: '' }
      this.loadData(1)
    },

    // 翻页
    goToPage(page: number) {
      if (page >= 1 && page <= this.totalPages) {
        this.loadData(page)
      }
    },

    // 确认删除
    async confirmDelete(row: WarehouseVO): Promise<boolean> {
      return confirm({
        title: '确认删除',
        message: `确定要删除仓库"${row.name}"吗？此操作不可恢复。`,
        confirmLabel: '删除',
        cancelLabel: '取消',
        danger: true,
      })
    },

    // 删除仓库
    async handleDelete(id: number) {
      const res = await warehousesApi.delete(id)
      if (res.ok) {
        this.refresh()
      } else {
        alert(`删除失败：${res.error.message}`)
      }
    },

    // 初始化
    init() {
      this.loadData(1)
    },
  }
}