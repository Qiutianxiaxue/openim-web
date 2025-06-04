declare module 'openim-websocket' {
  export interface WebSocketMessage {
    type: string
    topic?: string
    service?: string
    message?: string
    client_time?: string | number
    data?: Record<string, unknown>
  }

  export interface WebSocketError {
    code: number
    message: string
  }

  export interface WebSocketClientOptions {
    url: string
    headers: Record<string, string>
    enableLogging: boolean
    reconnectInterval?: number
    maxReconnectAttempts?: number
  }

  export class OpenIMWebSocket {
    constructor(options: WebSocketClientOptions)
    connect(): Promise<void>
    disconnect(): void
    send(data: WebSocketMessage): void
    subscribe(topic: string): void
    unsubscribe(topic: string): void
    on(event: 'message', handler: (data: WebSocketMessage) => void): void
    on(event: 'error', handler: (error: WebSocketError) => void): void
    on(event: 'connect_error', handler: (data: WebSocketMessage) => void): void
    on(event: 'force_offline', handler: (data: WebSocketMessage) => void): void
    on(event: 'connected', handler: (data: WebSocketMessage) => void): void
    on(event: 'open', handler: () => void): void
    on(event: 'close', handler: () => void): void
  }
}
