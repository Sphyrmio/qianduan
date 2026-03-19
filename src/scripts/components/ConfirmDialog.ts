/**
 * ConfirmDialog Alpine 组件
 * 提供全局确认对话框功能
 */

export interface ConfirmDialogState {
  visible: boolean
  title: string
  message: string
  confirmLabel: string
  cancelLabel: string
  danger: boolean
  resolve: ((result: boolean) => void) | null
}

/**
 * 创建确认对话框组件
 */
export function confirmDialogComponent() {
  return {
    visible: false,
    title: '确认操作',
    message: '',
    confirmLabel: '确认',
    cancelLabel: '取消',
    danger: false,
    resolve: null as ((result: boolean) => void) | null,

    /**
     * 显示确认对话框
     */
    show(options: {
      title?: string
      message: string
      confirmLabel?: string
      cancelLabel?: string
      danger?: boolean
    }): Promise<boolean> {
      return new Promise((resolve) => {
        this.title = options.title ?? '确认操作'
        this.message = options.message
        this.confirmLabel = options.confirmLabel ?? '确认'
        this.cancelLabel = options.cancelLabel ?? '取消'
        this.danger = options.danger ?? false
        this.resolve = resolve
        this.visible = true
      })
    },

    /**
     * 确认按钮点击
     */
    confirm() {
      this.visible = false
      this.resolve?.(true)
      this.resolve = null
    },

    /**
     * 取消按钮点击
     */
    cancel() {
      this.visible = false
      this.resolve?.(false)
      this.resolve = null
    },

    /**
     * 对话框隐藏后的清理
     */
    onHide() {
      // 如果对话框关闭但还有未处理的 resolve，视为取消
      if (this.resolve !== null) {
        this.resolve(false)
        this.resolve = null
      }
    },
  }
}

/**
 * 全局确认对话框实例（通过 Alpine.store 注册）
 */
let _confirmDialogInstance: ReturnType<typeof confirmDialogComponent> | null = null

export function getConfirmDialog() {
  if (!_confirmDialogInstance) {
    _confirmDialogInstance = confirmDialogComponent()
  }
  return _confirmDialogInstance
}

/**
 * 便捷的 confirm 函数（兼容原有 API）
 */
export function confirm(options: {
  title?: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  danger?: boolean
}): Promise<boolean> {
  const dialog = getConfirmDialog()
  return dialog.show(options)
}
