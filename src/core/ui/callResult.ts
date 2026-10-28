/**
 * 「接口返回」面板 — 页面上每点一次按钮，就把这次请求的结果记一条（教学用）
 *
 * 【为什么要有】
 * 改良版和原分支用的是同一个前端。区别全在后端返回：同一个按钮，
 * 一边是 200 和一张单，另一边是 400 和 SKU_CODE_DUPLICATED。
 * 面板把状态码和响应体原样摆出来，学生不用开浏览器开发者工具也能对比。
 *
 * 【怎么用】
 * 页面组件里放一个 calls: CallResult[]，每次调完接口：
 *   this.calls = recordCall(this.calls, 'POST /skus', res)
 * 模板里用 x-for 把 calls 画出来，最新的在最上面。
 */
import type { ApiResult } from '@/core/http/apiClient'

export interface CallResult {
  /** 请求发出的时间，精确到毫秒；两张单同时完成时靠它看先后 */
  at: string
  /** 调的哪个接口，例如 POST /inbound-orders/1/complete */
  action: string
  ok: boolean
  /** HTTP 状态码；连不上后端时是「网络错误」 */
  status: number | string
  /** 响应体，已经排好缩进 */
  body: string
}

function now(): string {
  const d = new Date()
  const pad = (n: number, w = 2) => String(n).padStart(w, '0')
  return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}.${pad(d.getMilliseconds(), 3)}`
}

/** 把一次 ApiResult 变成面板上的一条 */
export function toCallResult(action: string, res: ApiResult<unknown>, at = now()): CallResult {
  if (res.ok) {
    return { at, action, ok: true, status: res.status ?? 200, body: JSON.stringify(res.data, null, 2) }
  }
  const { status, raw, message } = res.error
  return {
    at,
    action,
    ok: false,
    status: status ?? '网络错误',
    // 后端的错误体是 { status, message, path }，message 里带着错误码
    body: JSON.stringify(raw ?? { message }, null, 2),
  }
}

/** 记一条，最新的放最前面，只留最近 8 条 */
export function recordCall(calls: CallResult[], action: string, res: ApiResult<unknown>, at?: string): CallResult[] {
  return [toCallResult(action, res, at), ...calls].slice(0, 8)
}

export { now as callTime }
