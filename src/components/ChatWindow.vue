<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import type { ChatProps, ChatEmits } from '@/types/chat'
import type { Message } from '@/types/message'
import MessageInput from "./MessageInput.vue"

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
const handleMessage = (message: {
  type: string
  content: string | File
  fileType?: string
  fileId?: string
}) => {
  if (message.type === 'text') {
    // 处理文本消息
    console.log('文本消息:', message.content)
  } else if (message.type === 'file') {
    // 处理文件消息
    console.log('文件消息:', {
      file: message.content,
      type: message.fileType,
      id: message.fileId
    })
  }
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
    <vxe-layout-container>
      <vxe-layout-aside :width="250">
        <div style="height: 400px">菜单</div>
      </vxe-layout-aside>


      <vxe-layout-body>
        <vxe-layout-container vertical>
          <vxe-layout-header class="bg1">
            <div style="height: 50px">头部</div>
          </vxe-layout-header>

          <vxe-layout-body class="bg3">
            <vxe-split vertical height="100%" :bar-config="{ height: 2 }">
              <vxe-split-pane>
                <div>顶部</div>
              </vxe-split-pane>
              <vxe-split-pane height="200">
                <MessageInput placeholder="请输入消息..." @send="handleMessage" />
              </vxe-split-pane>
            </vxe-split>
          </vxe-layout-body>
        </vxe-layout-container>
      </vxe-layout-body>
    </vxe-layout-container>
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
