export type MessageType = 'text' | 'image' | 'file' | 'audio' | 'video' | 'location' | 'custom'

export interface Message {
  id: string
  type: MessageType
  content: string
  senderId: string
  receiverId: string
  timestamp: number
  status: 'sending' | 'sent' | 'delivered' | 'read' | 'failed'
  metadata?: Record<string, unknown>
}
