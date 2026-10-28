/**
 * 页面上建过的单据，记在浏览器 localStorage 里
 *
 * 后端没有「列出全部入库单 / 出库单」的接口。新建、加行、完成这三个接口都返回整张单，
 * 页面每拿到一次就按主键更新这里的记录，刷新页面后还能接着点。
 * 换了数据库（比如 docker compose down -v）以后，点「清空记录」重新开始。
 */
export interface OrderLike {
  id: number
}

export function loadOrders<T extends OrderLike>(key: string): T[] {
  try {
    return JSON.parse(localStorage.getItem(key) ?? '[]') as T[]
  } catch {
    return []
  }
}

/** 同一个主键的单换成新返回的那份；没有就加在最前面 */
export function upsertOrder<T extends OrderLike>(key: string, orders: T[], order: T): T[] {
  const next = orders.some((o) => o.id === order.id)
    ? orders.map((o) => (o.id === order.id ? order : o))
    : [order, ...orders]
  localStorage.setItem(key, JSON.stringify(next))
  return next
}

export function clearOrders(key: string): void {
  localStorage.removeItem(key)
}
