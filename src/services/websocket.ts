import { OpenIMWebSocket } from 'openim-websocket'
import type { WebSocketMessage } from 'openim-websocket'
import { VxeUI } from 'vxe-pc-ui'

class WebSocketService {
  private static instance: WebSocketService
  private ws: OpenIMWebSocket | null = null
  private messageHandlers: ((message: WebSocketMessage) => void)[] = []
  private openHandlers: (() => void)[] = []

  private constructor() {}

  public static getInstance(): WebSocketService {
    if (!WebSocketService.instance) {
      WebSocketService.instance = new WebSocketService()
    }
    return WebSocketService.instance
  }

  public async connect(url: string, headers: Record<string, string>): Promise<void> {
    try {
      this.ws = new OpenIMWebSocket({
        url,
        headers,
        reconnectInterval: 3000,
        maxReconnectAttempts: 5,
      })
      this.ws.on('open', () => {
        VxeUI.modal.close('websocketlinkstatus')
        VxeUI.modal.message({
          content: `消息服务已连接`,
          status: 'success',
        })
        this.openHandlers.forEach((handler) => handler())
      })
      this.ws.on('message', (data) => {
        this.messageHandlers.forEach((handler) => handler(data))
      })

      this.ws.on('error', (error) => {
        console.log('WebSocket error', error)
      })

      this.ws.on('close', () => {
        console.log('WebSocket 连接关闭')
        VxeUI.modal
          .message({
            id: 'websocketlinkstatus',
            content: `服务器链接已断开`,
            status: 'error',
            lockView: false,
            mask: false,
            duration: -1,
          })
          .then((type) => {
            console.log(`操作类型 ${type}`)
          })
      })

      await this.ws.connect()

      console.log('WebSocket 连接成功')
    } catch (error) {
      VxeUI.modal
        .message({
          id: 'websocketlinkstatus',
          content: `服务器链接已断开`,
          status: 'error',
          lockView: false,
          mask: false,
          showClose: false,
          duration: -1,
          showConfirmButton: false,
        })
        .then((type) => {
          console.log(`操作类型 ${type}`)
        })
      throw error
    }
  }

  public subscribe(topic: string): void {
    if (this.ws) {
      this.ws.subscribe(topic)
    }
  }

  public send(data: WebSocketMessage): void {
    if (this.ws) {
      this.ws.send(data)
    } else {
      console.error('WebSocket 未连接，无法发送消息')
    }
  }

  public open(handler: () => void): void {
    this.openHandlers.push(handler)
  }

  public onMessage(handler: (message: WebSocketMessage) => void): void {
    this.messageHandlers.push(handler)
  }

  public disconnect(): void {
    if (this.ws) {
      this.ws.disconnect()
      this.ws = null
    }
  }
}

export const wsService = WebSocketService.getInstance()
