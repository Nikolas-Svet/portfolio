// types/example.ts

/**
 * Пример интерфейса для одного события/уведомления,
 * которое приходит через SSE.
 */
export interface INotificationEvent {
  id: number
  name: string
  process: string
  state: boolean
  result: any
  created_date: string
  updated_date: string | null
}
