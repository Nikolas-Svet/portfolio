export class ManualSSE {
  private controller: AbortController | null = null
  private isConnected = false
  private reconnectInterval: number | null = null
  private lastPingTimestamp: number = Date.now()
  private pingCheckInterval: number | null = null

  public async connect(
    baseUrl: string,
    endpoint: string,
    onMessage: (data: any) => void,
    onError?: (err: any) => void,
    withReconnect: boolean = false
  ): Promise<void> {
    if (this.isConnected) {
      console.warn('⚠️ Уже подключены к SSE. Сначала вызовите `disconnect()`.')
      return
    }

    const token = localStorage.getItem('token')
    if (!token) {
      console.error('⛔️ Нет токена для авторизации, SSE не подключается.')
      return
    }

    this.controller = new AbortController()
    const url = `${baseUrl}${endpoint}`
    console.log('📡 Подключение к SSE:', url)

    this.isConnected = true
    this.lastPingTimestamp = Date.now()

    // ✅ Запускаем проверку пинга каждые 5 секунд
    this.startPingCheck(baseUrl, endpoint, onMessage, onError)

    try {
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
        signal: this.controller.signal
      })

      if (!response.ok) {
        console.error(`❌ SSE запрос вернул статус ${response.status}`)
        this.isConnected = false
        if (withReconnect) this.scheduleReconnect(baseUrl, endpoint, onMessage, onError)
        return
      }

      const reader = response.body?.getReader()
      if (!reader) throw new Error('❌ `response.body` не поддерживается.')

      let buffer = ''
      while (this.isConnected) {
        const { done, value } = await reader.read()
        if (done) {
          console.log('⛔️ Поток SSE закрыт сервером.')
          this.isConnected = false
          if (withReconnect) this.scheduleReconnect(baseUrl, endpoint, onMessage, onError)
          break
        }

        const chunk = new TextDecoder().decode(value)
        buffer += chunk

        let lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          if (line.startsWith(': ping')) {
            console.log('📡 Пинг получен:', line)
            this.lastPingTimestamp = Date.now() // Обновляем время последнего пинга
            continue
          }

          if (line.startsWith('data:')) {
            const raw = line.slice('data:'.length).trim()
            console.log('📨 Получено сообщение от SSE:', raw)
            if (raw) {
              try {
                onMessage(JSON.parse(raw))
              } catch {
                console.warn('⚠️ Данные не в формате JSON:', raw)
                onMessage(raw)
              }
            }
          }
        }
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        console.log('⛔️ SSE-соединение прервано вручную.')
      } else {
        console.error('❌ Ошибка в процессе SSE:', err)
        this.isConnected = false
        if (onError) onError(err)
        if (withReconnect) this.scheduleReconnect(baseUrl, endpoint, onMessage, onError)
      }
    }
  }

  private startPingCheck(
    baseUrl: string,
    endpoint: string,
    onMessage: (data: any) => void,
    onError?: (err: any) => void
  ) {
    if (this.pingCheckInterval) clearInterval(this.pingCheckInterval)

    this.pingCheckInterval = window.setInterval(() => {
      const timeSinceLastPing = Date.now() - this.lastPingTimestamp

      if (timeSinceLastPing > 33000) {
        // 33 секунд без пинга
        console.warn('⛔️ Пинг не получен за 33 секунд. Переподключаемся...')
        this.disconnect()
        this.scheduleReconnect(baseUrl, endpoint, onMessage, onError)
      }
    }, 5000) // Проверка каждые 5 секунд
  }

  public disconnect() {
    if (!this.isConnected) {
      console.warn('⚠️ SSE не активно, `disconnect()` проигнорирован.')
      return
    }

    this.isConnected = false

    if (this.controller) {
      this.controller.abort()
      console.log('⛔️ SSE fetch прерван через AbortController.')
      this.controller = null
    }

    // ✅ Останавливаем таймер проверки пинга
    if (this.pingCheckInterval) {
      clearInterval(this.pingCheckInterval)
      this.pingCheckInterval = null
    }

    // ✅ Останавливаем переподключение, если оно было запланировано
    if (this.reconnectInterval) {
      console.log('⛔️ Очищаем запланированное переподключение SSE.')
      clearTimeout(this.reconnectInterval)
      this.reconnectInterval = null
    }
  }

  public scheduleReconnect(
    baseUrl: string,
    endpoint: string,
    onMessage: (data: any) => void,
    onError?: (err: any) => void
  ) {
    if (this.reconnectInterval) return

    // ✅ Проверка перед запуском переподключения
    if (!localStorage.getItem('token')) {
      console.log('⛔️ Переподключение SSE отменено (нет токена).')
      return
    }

    console.log('🔄 Переподключение SSE через 5 секунд...')
    this.reconnectInterval = window.setTimeout(() => {
      this.reconnectInterval = null
      this.connect(baseUrl, endpoint, onMessage, onError, true)
    }, 5000)
  }
}
