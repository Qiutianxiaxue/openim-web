import type { Message } from './message'

export interface ChatProps {
  // 基础配置
  apiUrl: string
  wsUrl: string
  token: string
  userId: string

  // 可选配置
  theme?: 'light' | 'dark'
  language?: 'zh-CN' | 'en-US'
  avatar?: string
  nickname?: string

  // 自定义样式
  width?: string | number
  height?: string | number
  borderRadius?: string | number
}

export interface ChatEmits {
  // 连接相关
  (e: 'connect'): void
  (e: 'disconnect', reason: string): void
  (e: 'error', error: Error): void

  // 消息相关
  (e: 'message', message: Message): void
  (e: 'message-sent', message: Message): void
  (e: 'message-received', message: Message): void

  // 状态相关
  (e: 'typing', userId: string): void
  (e: 'online-status-change', userId: string, status: 'online' | 'offline'): void
}
