import '@shoelace-style/shoelace/dist/components/dialog/dialog.js'
import '@shoelace-style/shoelace/dist/components/button/button.js'
import type SlDialog from '@shoelace-style/shoelace/dist/components/dialog/dialog.js'

export interface ConfirmOptions {
  title?: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  danger?: boolean
}

/**
 * 显示确认对话框，返回用户是否确认
 */
export function confirm(opts: ConfirmOptions): Promise<boolean> {
  return new Promise((resolve) => {
    const {
      title = '确认操作',
      message,
      confirmLabel = '确认',
      cancelLabel = '取消',
      danger = false,
    } = opts

    const dialog = document.createElement('sl-dialog') as SlDialog
    dialog.label = title

    const confirmVariant = danger ? 'danger' : 'primary'

    dialog.innerHTML = `
      <p class="text-sm text-text m-0 mb-4">${message}</p>
      <div slot="footer" class="flex gap-3 justify-end">
        <sl-button id="cancel-btn" variant="default">${cancelLabel}</sl-button>
        <sl-button id="confirm-btn" variant="${confirmVariant}">${confirmLabel}</sl-button>
      </div>
    `

    document.body.appendChild(dialog)
    dialog.show()

    const cleanup = (result: boolean) => {
      dialog.hide()
      dialog.addEventListener('sl-after-hide', () => dialog.remove(), { once: true })
      resolve(result)
    }

    dialog.querySelector('#confirm-btn')?.addEventListener('click', () => cleanup(true))
    dialog.querySelector('#cancel-btn')?.addEventListener('click', () => cleanup(false))
    dialog.addEventListener('sl-request-close', () => cleanup(false))
  })
}
