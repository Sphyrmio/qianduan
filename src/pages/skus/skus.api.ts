/**
 * 货品模块 — HTTP 接口封装（教学用）
 *
 * 一个后端接口对应一个函数。路径写 /skus，apiClient 会加上 /api，
 * Vite 再把 /api 去掉转给后端，后端收到的就是 /skus。
 */
import { apiClient, type ApiResult } from '@/core/http/apiClient'
import type { SkuVO, SkuCreatePayload } from './skus.model'

export const skusApi = {
  /** GET /skus：全部货品，后端直接返回数组，没有分页 */
  list(): Promise<ApiResult<SkuVO[]>> {
    return apiClient.get<SkuVO[]>('/skus')
  },

  /**
   * POST /skus：新建货品
   * 请求体 { code, name, unit } → SkuController.create → SkuService.create → sku 表插入一行。
   * 成功返回带 id 的货品；编码重复时改良版返回 400，message 以 SKU_CODE_DUPLICATED 开头。
   */
  create(data: SkuCreatePayload): Promise<ApiResult<SkuVO>> {
    return apiClient.post<SkuVO>('/skus', data)
  },
}
