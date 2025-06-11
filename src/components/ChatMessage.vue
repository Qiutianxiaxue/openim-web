<template>
  <div class="chat-message" :class="{ 'is-self': isSelf(send_user_id) }">
    <div class="message-avatar">
      <img :src="send_user_id" :alt="send_user_id" />
    </div>
    <div class="message-content">
      <div class="message-name">{{ send_user_id }}</div>
      <div class="message-bubble">
        <!-- 文本消息 -->
        <div v-if="message_type === 'text'" class="message-text">{{ message_content.text }}</div>
        <!-- 其他类型附件 -->
        <div v-else-if="message_type === 'file'">
          <!-- <Attachments :items="[message_content]" :hide-upload="true" @preview="handlePreview" /> -->
        </div>
      </div>
      <div class="message-footer">
        <div class="message-time">{{ formatTime(create_time) }}</div>
        <div class="message-status" v-if="isSelf(send_user_id)">
          <span v-if="isRead(is_read)" class="status-read">已读</span>
          <span v-else class="status-unread">未读</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import Attachments from './Attachments.vue'
import type { ChatsMessage } from '@/types/message'
import { useUserStore } from '@/stores/user'
import { storeToRefs } from 'pinia'
defineProps<ChatsMessage>()

const suerStore = useUserStore()
const { user_id } = storeToRefs(suerStore)

const emit = defineEmits<{
  (e: 'preview', file: { url?: string; thumbUrl?: string }): void
}>()

const handlePreview = (file: { url?: string; thumbUrl?: string }) => {
  emit('preview', file)
}

const isSelf = (sender_user_id: string) => {
  return user_id.value === sender_user_id
}
const isRead = (read: number) => {
  return read === 1
}

const formatTime = (create_time: string) => {
  const date = new Date(create_time)
  const hours = date.getHours().toString().padStart(2, '0')
  const minutes = date.getMinutes().toString().padStart(2, '0')
  return `${hours}:${minutes}`
}
</script>

<style lang="scss" scoped>
// 文本省略号 mixin
@mixin text-ellipsis {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.chat-message {
  display: flex;
  margin-bottom: 16px;
  padding: 0 16px;

  &.is-self {
    flex-direction: row-reverse;

    .message-content {
      align-items: flex-end;
    }

    .message-bubble {
      background-color: #95ec69;
      border-radius: 16px 4px 16px 16px;
      color: #333;

      .message-text {
        color: #333;
      }

      // 暗黑模式
      :root[data-theme='dark'] & {
        background-color: var(--vxe-ui-primary-color);
        color: #fff;

        .message-text {
          color: #fff;
        }
      }
    }
  }
}

.message-avatar {
  width: 40px;
  height: 40px;
  border-radius: 4px;
  overflow: hidden;
  margin: 0 12px;
  flex-shrink: 0;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.message-content {
  max-width: 60%;
}

.message-name {
  font-size: 12px;
  color: var(--vxe-ui-font-color-secondary);
  margin-bottom: 4px;
}

.message-bubble {
  background-color: var(--vxe-ui-layout-background-color);
  border-radius: 4px 16px 16px 16px;
  word-break: break-all;
  box-shadow:
    0 1px 2px var(--vxe-ui-input-border-color),
    1px 1px 2px var(--vxe-ui-input-border-color),
    -1px -1px 1px 0px var(--vxe-ui-input-border-color);
  overflow: hidden;

  // 暗黑模式
  :root[data-theme='dark'] & {
    border-color: var(--vxe-ui-border-color);
    box-shadow: 0 1px 2px var(--vxe-ui-border-color);
  }

  // 图片和附件消息不需要内边距、边框和阴影
  .message-image,
  .message-file {
    margin: -12px;
    border: none;
    box-shadow: none;
  }
}

.message-text {
  font-size: 14px;
  line-height: 1.5;
  color: var(--vxe-ui-font-color);
  white-space: pre-wrap;
  word-break: break-word;
  padding: 12px;
}

.message-footer {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 4px;
}

.message-time {
  font-size: 12px;
  color: var(--vxe-ui-font-color-secondary);
}

.message-status {
  font-size: 12px;

  .status-read {
    color: var(--vxe-ui-font-color-secondary);
  }

  .status-unread {
    color: var(--vxe-ui-status-warning-color);
  }
}
</style>
