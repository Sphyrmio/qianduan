/** 统一错误模型 */

export type ErrorKind = 'network' | 'auth' | 'forbidden' | 'not_found' | 'validation' | 'business' | 'unknown'

export interface AppError {
  kind: ErrorKind
  message: string
  status?: number
  /** 字段级错误 key->message */
  fields?: Record<string, string>
  raw?: unknown
}

export function makeNetworkError(cause?: unknown): AppError {
  return { kind: 'network', message: '网络连接失败，请检查网络后重试', raw: cause }
}

export function makeAuthError(): AppError {
  return { kind: 'auth', message: '登录已过期，请重新登录', status: 401 }
}

export function makeForbiddenError(): AppError {
  return { kind: 'forbidden', message: '您没有权限执行此操作', status: 403 }
}

export function makeNotFoundError(): AppError {
  return { kind: 'not_found', message: '请求的资源不存在', status: 404 }
}

export function makeValidationError(fields: Record<string, string>): AppError {
  return { kind: 'validation', message: '请检查表单输入', fields }
}

export function makeBusinessError(message: string, status?: number, raw?: unknown): AppError {
  return { kind: 'business', message, status, raw }
}

export function fromHttpStatus(status: number, body?: unknown): AppError {
  if (status === 401) return makeAuthError()
  if (status === 403) return makeForbiddenError()
  if (status === 404) return makeNotFoundError()
  if (status === 422 || status === 400) {
    const b = body as Record<string, unknown>
    const fields = b?.errors as Record<string, string> | undefined
    const msg = (b?.message as string) ?? '请求参数有误'
    if (fields) return makeValidationError(fields)
    return makeBusinessError(msg, status, body)
  }
  const msg = (body as Record<string, unknown>)?.message as string | undefined
  return makeBusinessError(msg ?? `服务器错误 (${status})`, status, body)
}
