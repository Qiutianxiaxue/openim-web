<script setup lang="ts">
import { ref } from 'vue'
import { ChatWindow } from '../index'
import type { Message } from '../types/message'

const chatRef = ref()
const messageInput = ref('')

// 处理发送消息
function handleSend() {
  if (!messageInput.value.trim()) return
  chatRef.value?.sendMessage(messageInput.value)
  messageInput.value = ''
}

// 事件处理函数
function handleConnect() {
  console.log('已连接到聊天服务器')
}

function handleDisconnect(reason: string) {
  console.log('断开连接:', reason)
}

function handleError(error: Error) {
  console.error('发生错误:', error)
}

function handleMessage(message: Message) {
  console.log('收到新消息:', message)
}

function handleMessageSent(message: Message) {
  console.log('消息已发送:', message)
}

function handleMessageReceived(message: Message) {
  console.log('消息已接收:', message)
}

function handleTyping(userId: string) {
  console.log('用户正在输入:', userId)
}

function handleStatusChange(userId: string, status: 'online' | 'offline') {
  console.log('状态变更:', userId, status)
}
</script>

<template>
  <div class="chat-example">
    <chat-window ref="chatRef" api-url="https://api.example.com" ws-url="wss://ws.example.com" token="your-token"
      user-id="user123" theme="light" language="zh-CN" :width="800" :height="500" @connect="handleConnect"
      @disconnect="handleDisconnect" @error="handleError" @message="handleMessage" @message-sent="handleMessageSent"
      @message-received="handleMessageReceived" @typing="handleTyping" @online-status-change="handleStatusChange" />

    <div class="input-area">
      <input v-model="messageInput" type="text" placeholder="输入消息..." @keyup.enter="handleSend" />
      <button @click="handleSend">发送</button>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.chat-example {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 16px;
  max-width: 800px;
  margin: 0 auto;
}

.input-area {
  display: flex;
  gap: 8px;

  input {
    flex: 1;
    padding: 8px;
    border: 1px solid var(--vxe-border-color);
    border-radius: 4px;

    &:focus {
      outline: none;
      border-color: var(--vxe-primary-color);
    }
  }

  button {
    padding: 8px 16px;
    background-color: var(--vxe-primary-color);
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;

    &:hover {
      opacity: 0.9;
    }
  }
}
</style>
