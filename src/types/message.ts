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
export interface ChatItem {
  chats_id: string
  user_id: string
  peer_id: string
  chats_key: string
  message_table: string
  chats_type: string
  source_type: string
  source_app_id: string
  unread_count: number
  badge_icon_url: string | null
  chats_icon: string
  chats_name: string
  web_hook_url: string | null
  last_message_content: string
  last_message_type: string
  last_send_time: string
  last_sender_id: string
  is_top: boolean
  is_mute: boolean
  is_archived: boolean
  create_time: string
  update_time: string
}
export interface FileMessageContent {
  filename: string
  url: string
  size: number
}
export interface ChatsMessage {
  chats_message_id: number
  message_key: string
  chats_key: string
  send_user_id: string
  receive_user_id: string
  message_type: 'text' | 'image' | 'file' | 'audio' | 'video' | 'location' | 'custom'
  message_content: Record<string, FileMessageContent>
  message_extra: Record<string, unknown>
  reply_to_message_key?: string
  forward_from_message_key?: string
  is_retracted: 0 | 1
  is_read: 0 | 1
  delivery_status: 'sending' | 'sent' | 'delivered' | 'read' | 'failed'
  update_time: string
  create_time: string
}
