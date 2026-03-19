/**
 * DataTable Alpine 组件
 */

import type { Column } from '@/core/ui/components/DataTable'

export interface DataTableRow {
  [key: string]: unknown
}

export function dataTableComponent() {
  return {
    columns: [] as Column<DataTableRow>[],
    data: [] as DataTableRow[],
    total: 0,
    page: 1,
    pageSize: 10,
    loading: false,
    empty: '暂无数据',
    sortKey: '',
    sortDir: 'asc' as 'asc' | 'desc',
    
    // 回调函数（由外部设置）
    onPageChange: null as ((page: number) => void) | null,
    onSort: null as ((key: string, dir: 'asc' | 'desc') => void) | null,
    onRowAction: null as ((action: string, row: DataTableRow) => void) | null,

    // 计算总页数
    get totalPages() {
      return Math.max(1, Math.ceil(this.total / this.pageSize))
    },

    /**
     * 处理排序
     */
    handleSort(key: string) {
      if (this.sortKey === key) {
        this.sortDir = this.sortDir === 'asc' ? 'desc' : 'asc'
      } else {
        this.sortKey = key
        this.sortDir = 'asc'
      }
      this.onSort?.(key, this.sortDir)
    },

    /**
     * 获取排序图标
     */
    getSortIcon(key: string): string {
      if (!this.sortKey || this.sortKey !== key) return ' ↕'
      return this.sortDir === 'asc' ? ' ↑' : ' ↓'
    },

    /**
     * 渲染单元格
     */
    renderCell(row: DataTableRow, col: Column<DataTableRow>): string {
      const value = row[col.key] ?? ''
      if (col.render) {
        return col.render(row, col)
      }
      return String(value)
    },

    /**
     * 跳转页码
     */
    goToPage(page: number) {
      if (page >= 1 && page <= this.totalPages) {
        this.onPageChange?.(page)
      }
    },

    /**
     * 加载数据（外部调用）
     */
    loadData(newData: DataTableRow[], newTotal?: number) {
      this.data = newData
      if (newTotal !== undefined) {
        this.total = newTotal
      }
    },

    /**
     * 设置加载状态
     */
    setLoading(loading: boolean) {
      this.loading = loading
    },
  }
}
