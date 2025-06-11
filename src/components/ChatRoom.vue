<template>
  <div class="chat-room">
    <div class="chat-header">
      <div class="chat-title">{{ title || '聊天室' }}</div>
    </div>

    <div class="chat-body" ref="chatBodyRef" @scroll="handleScroll">
      <!-- 加载更多提示 -->
      <div class="loading-more" :class="{ loading }">
        <i class="el-icon-loading"></i>
        <span>加载中...</span>
      </div>

      <!-- 消息列表 -->
      <div class="message-list">
        <ChatMessage
          v-for="message in CurrentMessageBoxList"
          :key="message.chats_key"
          v-bind="message"
          @preview="handlePreview"
        />
      </div>
    </div>

    <!-- 新消息提醒 -->
    <div v-if="hasNewMessage && !isAtBottom" class="new-message-tip" @click="scrollToBottom">
      <i class="el-icon-arrow-down"></i>
      <span>您有新消息</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import ChatMessage from './ChatMessage.vue'
import type { FileType } from '@/types/FileType'

import { useMessageStore } from '@/stores/message'
import { storeToRefs } from 'pinia'

interface ChatMessageType {
  id: string | number
  type: 'text' | 'file'
  content?: string
  fileId?: string
  fileName?: string
  fileSize?: number
  fileType?: FileType
  fileUrl?: string
  fileThumbUrl?: string
  avatar: string
  name: string
  time: number
  useRead: number
  isSelf: boolean
}

const { title } = defineProps<{
  title?: string
}>()

const chatBodyRef = ref<HTMLElement | null>(null)
const messages = ref<ChatMessageType[]>([])
const loading = ref(false)
const hasNewMessage = ref(false)
const isAtBottom = ref(true)

const messageStore = useMessageStore()
const { CurrentMessageBoxList } = storeToRefs(messageStore)

// // 模拟加载历史消息
// const loadHistoryMessages = async () => {
//   if (loading.value) return
//   loading.value = true

//   try {
//     const chatBody = chatBodyRef.value
//     if (!chatBody) return

//     // 保存当前滚动位置
//     const oldScrollTop = chatBody.scrollTop
//     const oldScrollHeight = chatBody.scrollHeight

//     // 模拟API请求延迟
//     await new Promise((resolve) => setTimeout(resolve, 1000))

//     // 模拟历史消息数据
//     const newMessages: ChatMessageType[] = Array.from({ length: 20 }, (_, index) => ({
//       id: `history-${index}`,
//       type: Math.random() > 0.5 ? 'text' : 'file',
//       content: `消息 ${index}`,
//       fileId: `file-${index}`,
//       fileName: Math.random() > 0.5 ? `文件csum.photos/400/300?${index}.jpg` : `文件${index}.jpg`,
//       fileSize: Math.random() > 0.5 ? 1024 * 1024 : 1024 * 1024,
//       fileType: Math.random() > 0.5 ? 'image' : 'pdf',
//       fileUrl: `https://picsum.photos/400/300?random=${index}`,
//       avatar: `https://picsum.photos/40/40?random=${index}`,
//       name: `用户${index}`,
//       time: Date.now() - index * 60000,
//       isSelf: Math.random() > 0.5,
//       useRead: Math.random() > 0.5 ? 1 : 0,
//     }))

//     // 将新消息插入到列表前面
//     messages.value = [...newMessages, ...messages.value]

//     // 等待DOM更新和图片加载
//     await nextTick()

//     // 计算新的滚动位置
//     const newScrollHeight = chatBody.scrollHeight
//     console.log('newScrollHeight', newScrollHeight)
//     console.log('oldScrollHeight', oldScrollHeight)
//     console.log('oldScrollTop', oldScrollTop)
//     const heightDifference = newScrollHeight - oldScrollHeight
//     console.log('heightDifference', heightDifference)
//     chatBody.scrollTop = oldScrollTop + heightDifference
//     console.log('newScrollTop', oldScrollTop + heightDifference)
//   } finally {
//     loading.value = false
//   }
// }

// // 加载新消息的辅助函数
// const loadNewMessages = async () => {
//   // 模拟API请求延迟
//   await new Promise((resolve) => setTimeout(resolve, 1000))

//   // 模拟新消息数据
//   const index = dayjs().valueOf()
//   const newMessages: ChatMessageType[] = [
//     {
//       id: `history-${index}`,
//       type: Math.random() > 0.5 ? 'text' : 'file',
//       content: `消息 ${index}`,
//       fileId: `file-${index}`,
//       fileName: Math.random() > 0.5 ? `文件csum.photos/400/300?${index}.jpg` : `文件${index}.jpg`,
//       fileSize: Math.random() > 0.5 ? 1024 * 1024 : 1024 * 1024,
//       fileType: Math.random() > 0.5 ? 'image' : 'pdf',
//       fileUrl: `https://picsum.photos/400/300?random=${index}`,
//       avatar: `https://picsum.photos/40/40?random=${index}`,
//       name: `用户${index}`,
//       time: Date.now(),
//       isSelf: Math.random() > 0.5,
//       useRead: Math.random() > 0.5 ? 1 : 0,
//     },
//   ]

//   // 将新消息添加到列表末尾
//   messages.value = [...messages.value, ...newMessages]

//   // 等待DOM更新
//   await nextTick()

//   // 检查是否在底部
//   const chatBody = chatBodyRef.value
//   if (!chatBody) return

//   // 如果距离底部小于50px，自动滚动到底部
//   if (isAtBottom.value) {
//     chatBody.scrollTop = chatBody.scrollHeight
//     hasNewMessage.value = false
//   } else {
//     // 否则显示新消息提示
//     hasNewMessage.value = true
//   }
// }

// 处理滚动事件
const handleScroll = () => {
  if (!chatBodyRef.value) return

  const { scrollTop, scrollHeight, clientHeight } = chatBodyRef.value
  const distanceToBottom = scrollHeight - scrollTop - clientHeight

  // 检查是否在底部
  isAtBottom.value = distanceToBottom < 50
  if (isAtBottom.value) {
    hasNewMessage.value = false
  }
}

// 滚动防抖
let scrollTimer: number | null = null
const handleScrollWithDebounce = () => {
  if (scrollTimer) {
    clearTimeout(scrollTimer)
  }

  scrollTimer = window.setTimeout(() => {
    if (!chatBodyRef.value) return

    const { scrollTop } = chatBodyRef.value
    // 只有当滚动完全停止且距离顶部小于100时才加载
    if (scrollTop < 100 && !loading.value) {
      // loadHistoryMessages()
    }
  }, 150) // 150ms的防抖时间
}

// 滚动到底部
const scrollToBottom = () => {
  if (!chatBodyRef.value) return
  chatBodyRef.value.scrollTop = chatBodyRef.value.scrollHeight
  hasNewMessage.value = false
}

// 处理文件预览
const handlePreview = (file: { url?: string; thumbUrl?: string }) => {
  // TODO: 实现文件预览功能
  console.log('预览文件:', file)
}

// 初始化
onMounted(async () => {
  // 等待DOM更新
  await nextTick()

  // 加载初始数据
  // await loadHistoryMessages()

  // 滚动到底部
  const chatBody = chatBodyRef.value
  if (chatBody) {
    chatBody.scrollTop = chatBody.scrollHeight
  }

  // 添加滚动监听
  chatBodyRef.value?.addEventListener('scroll', handleScrollWithDebounce)

  // 定时加载新消息
  // setInterval(loadNewMessages, 10000)
})

// 清理
onUnmounted(() => {
  // 清理文件URL
  messages.value.forEach((message) => {
    if (message.fileUrl) {
      URL.revokeObjectURL(message.fileUrl)
    }
  })

  // 清理滚动监听
  if (scrollTimer) {
    clearTimeout(scrollTimer)
  }
  chatBodyRef.value?.removeEventListener('scroll', handleScrollWithDebounce)
})
</script>

<style lang="scss" scoped>
.chat-room {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--vxe-ui-layout-background-color);
  position: relative;
}

.chat-header {
  padding: 15px;
  background: var(--vxe-ui-modal-header-background-color);
  border-bottom: 1px solid var(--vxe-ui-input-border-color);
  flex-shrink: 0;
  height: 56px;
  overflow: hidden;
}

.chat-title {
  font-size: 16px;
  font-weight: 500;
  color: var(--vxe-ui-font-color);
}

.chat-body {
  flex: 1;
  overflow-y: auto;
  padding: 16px 0;
  position: relative;
}

.loading-more {
  position: absolute;
  top: 16px;
  left: 0;
  right: 0;
  text-align: center;
  padding: 8px;
  color: #999;
  font-size: 12px;
  height: 32px;
  line-height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s;
  pointer-events: none;
  z-index: 1;

  &.loading {
    opacity: 1;
  }

  i {
    margin-right: 4px;
  }
}

.message-list {
  min-height: 100%;
  display: flex;
  flex-direction: column;
  padding-top: 16px; // 减小顶部padding
}

.new-message-tip {
  position: absolute;
  bottom: 16px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.6);
  color: #fff;
  padding: 8px 16px;
  border-radius: 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  transition: opacity 0.3s;
  z-index: 100;

  &:hover {
    opacity: 0.8;
  }

  i {
    font-size: 14px;
  }
}

.chat-input {
  flex-shrink: 0;
}
</style>
