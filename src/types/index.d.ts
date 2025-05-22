declare module 'openim-web' {
  import type { App } from 'vue'
  import type { Component } from 'vue'

  export interface Message {
    id: string
    type: 'text' | 'image' | 'file' | 'audio' | 'video' | 'location' | 'custom'
    content: string
    senderId: string
    receiverId: string
    timestamp: number
    status: 'sending' | 'sent' | 'delivered' | 'read' | 'failed'
    metadata?: Record<string, unknown>
  }

  export interface ChatWindowProps {
    apiUrl: string
    wsUrl: string
    token: string
    userId: string
    theme?: 'light' | 'dark'
    language?: 'zh-CN' | 'en-US'
    avatar?: string
    nickname?: string
    width?: string | number
    height?: string | number
    borderRadius?: string | number
  }

  export const ChatWindow: Component<ChatWindowProps>

  const OpenIMWeb: {
    install: (app: App) => void
  }

  export default OpenIMWeb
}
