/**
 * 入库单附件 — 上传、下载（教学用）
 *
 * 上传是表单（multipart/form-data），不是 JSON，所以不走 apiClient，直接用 fetch：
 * 请求体是 FormData，字段名 file 要和后端 @RequestParam("file") 一致。
 * 下载返回的是文件内容，不是 JSON，也单独写。
 */
import type { ApiResult } from '@/core/http/apiClient'
import { tokenStore } from '@/core/auth/token.store'
import { fromHttpStatus } from '@/core/http/errors'

const BASE_URL = (import.meta.env.VITE_API_BASE as string | undefined) ?? '/api'

/** POST /inbound-orders/{orderId}/attachments 成功后返回的一行 inbound_attachment */
export interface AttachmentVO {
  id: number // 附件主键，下载路径里的 {attachmentId}
  orderId: number
  fileName: string // 上传时的原名
  filePath: string // 内容存在哪：本机绝对路径，或 MinIO 里的对象 key
}

function authHeaders(): Record<string, string> {
  const token = tokenStore.get()
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export const attachmentApi = {
  async upload(orderId: number, file: File): Promise<ApiResult<AttachmentVO>> {
    const form = new FormData()
    form.append('file', file) // 字段名 file
    const res = await fetch(`${BASE_URL}/inbound-orders/${orderId}/attachments`, {
      method: 'POST',
      headers: authHeaders(), // 不设 Content-Type，浏览器会自己带上 multipart 的分隔符
      body: form,
    })
    const body = await res.json().catch(() => ({}))
    return res.ok ? { ok: true, data: body as AttachmentVO, status: res.status } : { ok: false, error: fromHttpStatus(res.status, body) }
  },

  /** GET /inbound-orders/{orderId}/attachments/{attachmentId}：返回文件内容 */
  async download(orderId: number, attachmentId: number): Promise<ApiResult<{ blob: Blob; text: string }>> {
    const res = await fetch(`${BASE_URL}/inbound-orders/${orderId}/attachments/${attachmentId}`, { headers: authHeaders() })
    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      return { ok: false, error: fromHttpStatus(res.status, body) }
    }
    const blob = await res.blob()
    const text = blob.type.startsWith('text/') || blob.size < 2000 ? await blob.text() : `（${blob.size} 字节）`
    return { ok: true, data: { blob, text }, status: res.status }
  },
}
