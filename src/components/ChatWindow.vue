<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import type { ChatProps, ChatEmits } from '@/types/chat'
import type { Message } from '@/types/message'

const props = withDefaults(defineProps<ChatProps>(), {
  theme: 'light',
  language: 'zh-CN',
  width: '100%',
  height: '100%',
  borderRadius: '8px'
})

const emit = defineEmits<ChatEmits>()

// 组件内部状态
const messages = ref<Message[]>([])
const isConnected = ref(false)

// 连接 WebSocket
function connect() {
  try {
    // 实现 WebSocket 连接逻辑
    emit('connect')
    isConnected.value = true
  } catch (error) {
    emit('error', error as Error)
  }
}

// 发送消息
function sendMessage(content: string, type: Message['type'] = 'text') {
  const message: Message = {
    id: Date.now().toString(),
    type,
    content,
    senderId: props.userId,
    receiverId: '', // 需要根据实际场景设置
    timestamp: Date.now(),
    status: 'sending'
  }

  messages.value.push(message)
  emit('message', message)
  // 实现发送逻辑
  emit('message-sent', message)
}

// 暴露方法给父组件
defineExpose({
  sendMessage
})

// 生命周期钩子
onMounted(() => {
  connect()
})

onUnmounted(() => {
  // 实现断开连接逻辑
  emit('disconnect', 'component unmounted')
})
</script>

<template>
  <div class="chat-window" :style="{
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height,
    borderRadius: typeof borderRadius === 'number' ? `${borderRadius}px` : borderRadius
  }">
    <!-- 聊天窗口内容 -->
    <div class="chat-messages">
      <div v-for="message in messages" :key="message.id" class="message">
        {{ message.content }}
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.chat-window {
  background-color: var(--vxe-background-color);
  border: 1px solid var(--vxe-border-color);
  overflow: hidden;
}

.chat-messages {
  height: 100%;
  overflow-y: auto;
  padding: 16px;
}

.message {
  margin-bottom: 8px;
  padding: 8px;
  border-radius: 4px;
  background-color: var(--vxe-table-row-hover-background-color);
}
</style>
