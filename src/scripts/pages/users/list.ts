/**
 * 用户列表页 Alpine 组件
 */

import { usersApi } from '@/pages/users/users.api'
import { ROLE_LABELS, STATUS_LABELS } from '@/pages/users/users.model'

const PAGE_SIZE = 10

interface UserRow {
  id: number
  username: string
  displayName: string
  email: string
  phone: string
  role: string
  status: number
  createdAt: string
}

export function userListComponent() {
  return {
    // 数据
    data: [] as UserRow[],
    loading: false,
    total: 0,
    page: 1,
    pageSize: PAGE_SIZE,
    error: '',

    // 计算总页数
    get totalPages() {
      return Math.max(1, Math.ceil(this.total / this.pageSize))
    },

    // 获取角色标签
    getRoleLabel(role: string): string {
      return ROLE_LABELS[role] ?? role
    },

    // 获取状态标签
    getStatusLabel(status: number): string {
      return STATUS_LABELS[status] ?? String(status)
    },

    // 加载数据
    async loadData(page: number = 1) {
      this.page = page
      this.loading = true
      this.error = ''
      this.data = []

      try {
        const res = await usersApi.list({ current: page, pageSize: PAGE_SIZE })

        if (!res.ok) {
          this.error = res.error.message
          return
        }

        const { records, total } = res.data
        this.data = records
        this.total = total
      } catch (error) {
        console.error('Failed to load users:', error)
        this.error = '加载数据失败'
      } finally {
        this.loading = false
      }
    },

    // 刷新
    refresh() {
      this.loadData(this.page)
    },

    // 翻页
    goToPage(page: number) {
      if (page >= 1 && page <= this.totalPages) {
        this.loadData(page)
      }
    },

    // 初始化
    init() {
      this.loadData(1)
    },
  }
}