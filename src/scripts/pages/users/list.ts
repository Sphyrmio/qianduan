/**
 * 用户列表页 Alpine 组件
 */

import { usersApi } from '@/pages/users/users.api'
import {
  ROLE_LABELS,
  ROLE_OPTIONS,
  STATUS_LABELS,
  type UserVO,
} from '@/pages/users/users.model'
import { confirm } from '@/core/ui/components/ConfirmDialog'

const PAGE_SIZE = 10

type DialogMode = 'create' | 'edit' | null

interface UserForm {
  username: string
  password: string
  displayName: string
  role: string
  email: string
  phone: string
  status: number
}

function emptyForm(): UserForm {
  return {
    username: '',
    password: '',
    displayName: '',
    role: 'OPERATOR',
    email: '',
    phone: '',
    status: 1,
  }
}

export function userListComponent() {
  return {
    data: [] as UserVO[],
    loading: false,
    total: 0,
    page: 1,
    pageSize: PAGE_SIZE,
    error: '',
    roleOptions: ROLE_OPTIONS,

    filters: {
      username: '',
      role: '',
      status: '' as number | '',
    },

    dialogMode: null as DialogMode,
    editingId: null as number | null,
    form: emptyForm(),
    formError: '',
    submitting: false,

    get totalPages() {
      return Math.max(1, Math.ceil(this.total / this.pageSize))
    },

    get dialogTitle() {
      return this.dialogMode === 'create' ? '新增用户' : '编辑用户'
    },

    getRoleLabel(role: string): string {
      return ROLE_LABELS[role] ?? role
    },

    getStatusLabel(status: number): string {
      return STATUS_LABELS[status] ?? String(status)
    },

    async loadData(page: number = 1) {
      this.page = page
      this.loading = true
      this.error = ''
      this.data = []

      try {
        const res = await usersApi.list({
          current: page,
          pageSize: PAGE_SIZE,
          ...(this.filters.username && { username: this.filters.username }),
          ...(this.filters.role && { role: this.filters.role }),
          ...(this.filters.status !== '' && { status: Number(this.filters.status) }),
        })

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

    refresh() {
      this.loadData(this.page)
    },

    search() {
      this.loadData(1)
    },

    reset() {
      this.filters = { username: '', role: '', status: '' }
      this.loadData(1)
    },

    goToPage(page: number) {
      if (page >= 1 && page <= this.totalPages) {
        this.loadData(page)
      }
    },

    openCreate() {
      this.dialogMode = 'create'
      this.editingId = null
      this.form = emptyForm()
      this.formError = ''
    },

    async openEdit(row: UserVO) {
      this.formError = ''
      this.submitting = true

      const res = await usersApi.getById(row.id)
      this.submitting = false

      if (!res.ok) {
        alert(`加载用户失败：${res.error.message}`)
        return
      }

      this.dialogMode = 'edit'
      this.editingId = row.id

      const user = res.data
      this.form = {
        username: user.username,
        password: '',
        displayName: user.displayName,
        role: user.role,
        email: user.email ?? '',
        phone: user.phone ?? '',
        status: user.status,
      }
    },

    closeDialog() {
      this.dialogMode = null
      this.editingId = null
      this.form = emptyForm()
      this.formError = ''
    },

    validateForm(): boolean {
      if (this.dialogMode === 'create') {
        if (!this.form.username.trim()) {
          this.formError = '请输入用户名'
          return false
        }
        if (this.form.username.trim().length < 3) {
          this.formError = '用户名至少 3 个字符'
          return false
        }
        if (!this.form.password || this.form.password.length < 6) {
          this.formError = '密码至少 6 个字符'
          return false
        }
      }

      if (this.dialogMode === 'edit' && !this.form.displayName.trim()) {
        this.formError = '请输入显示名称'
        return false
      }
      if (!this.form.role) {
        this.formError = '请选择角色'
        return false
      }
      if (this.dialogMode === 'edit' && this.form.password && this.form.password.length < 6) {
        this.formError = '新密码至少 6 个字符'
        return false
      }

      this.formError = ''
      return true
    },

    async submitForm() {
      if (!this.validateForm()) return

      this.submitting = true
      this.formError = ''

      try {
        if (this.dialogMode === 'create') {
          const username = this.form.username.trim()
          const res = await usersApi.create({
            username,
            password: this.form.password,
            displayName: this.form.displayName.trim() || username,
            role: this.form.role,
            email: this.form.email.trim() || undefined,
            phone: this.form.phone.trim() || undefined,
          })
          if (!res.ok) {
            this.formError = res.error.message
            return
          }
        } else if (this.dialogMode === 'edit' && this.editingId != null) {
          const res = await usersApi.update(this.editingId, {
            displayName: this.form.displayName.trim(),
            role: this.form.role,
            email: this.form.email.trim() || undefined,
            phone: this.form.phone.trim() || undefined,
            status: this.form.status,
            ...(this.form.password ? { password: this.form.password } : {}),
          })
          if (!res.ok) {
            this.formError = res.error.message
            return
          }
        }

        this.closeDialog()
        this.refresh()
      } finally {
        this.submitting = false
      }
    },

    async confirmDisable(row: UserVO): Promise<boolean> {
      return confirm({
        title: '确认禁用',
        message: `确定要禁用用户「${row.displayName || row.username}」吗？禁用后该账号将无法登录。`,
        confirmLabel: '禁用',
        cancelLabel: '取消',
        danger: true,
      })
    },

    async handleDisable(row: UserVO) {
      if (row.status === 0) return
      const ok = await this.confirmDisable(row)
      if (!ok) return

      const res = await usersApi.remove(row.id)
      if (res.ok) {
        this.refresh()
      } else {
        alert(`禁用失败：${res.error.message}`)
      }
    },

    init() {
      this.loadData(1)
    },
  }
}
