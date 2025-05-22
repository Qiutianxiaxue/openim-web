# OpenIM Web

一个基于 Vue 3 的即时通讯组件库，提供简单易用的聊天界面和功能。

## 特性

- 🚀 基于 Vue 3 + TypeScript
- 💪 支持明暗主题切换
- 🌍 支持中英文国际化
- 📱 响应式设计
- 🎨 可自定义样式
- 🔌 完整的事件系统

## 安装

```bash
# npm
npm install openim-web

# yarn
yarn add openim-web

# pnpm
pnpm add openim-web
```

## 快速开始

### 全局注册

```typescript
// main.ts
import { createApp } from 'vue'
import App from './App.vue'
import OpenIMWeb from 'openim-web'
import 'openim-web/dist/style.css'

const app = createApp(App)
app.use(OpenIMWeb)
app.mount('#app')
```

### 组件中使用

```vue
<template>
  <chat-window
    api-url="https://api.example.com"
    ws-url="wss://ws.example.com"
    token="your-token"
    user-id="user123"
    theme="light"
    language="zh-CN"
    :width="800"
    :height="500"
    @connect="handleConnect"
    @message="handleMessage"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ChatWindow } from 'openim-web'
import type { Message } from 'openim-web'

const chatRef = ref()

// 发送消息
function handleSend() {
  chatRef.value?.sendMessage('Hello!')
}

// 处理连接事件
function handleConnect() {
  console.log('已连接到聊天服务器')
}

// 处理消息事件
function handleMessage(message: Message) {
  console.log('收到新消息:', message)
}
</script>
```

## Props

| 属性名       | 类型               | 必填 | 默认值  | 说明                 |
| ------------ | ------------------ | ---- | ------- | -------------------- |
| apiUrl       | string             | 是   | -       | API 服务器地址       |
| wsUrl        | string             | 是   | -       | WebSocket 服务器地址 |
| token        | string             | 是   | -       | 用户认证令牌         |
| userId       | string             | 是   | -       | 用户ID               |
| theme        | 'light' \| 'dark'  | 否   | 'light' | 主题                 |
| language     | 'zh-CN' \| 'en-US' | 否   | 'zh-CN' | 语言                 |
| avatar       | string             | 否   | -       | 用户头像             |
| nickname     | string             | 否   | -       | 用户昵称             |
| width        | string \| number   | 否   | '100%'  | 组件宽度             |
| height       | string \| number   | 否   | '100%'  | 组件高度             |
| borderRadius | string \| number   | 否   | '8px'   | 圆角大小             |

## 事件

| 事件名               | 参数                                          | 说明                   |
| -------------------- | --------------------------------------------- | ---------------------- |
| connect              | -                                             | 连接成功时触发         |
| disconnect           | reason: string                                | 断开连接时触发         |
| error                | error: Error                                  | 发生错误时触发         |
| message              | message: Message                              | 收到新消息时触发       |
| message-sent         | message: Message                              | 消息发送成功时触发     |
| message-received     | message: Message                              | 消息接收成功时触发     |
| typing               | userId: string                                | 用户正在输入时触发     |
| online-status-change | userId: string, status: 'online' \| 'offline' | 用户在线状态变更时触发 |

## 方法

| 方法名      | 参数                                | 说明     |
| ----------- | ----------------------------------- | -------- |
| sendMessage | content: string, type?: MessageType | 发送消息 |

## 类型定义

```typescript
type MessageType = 'text' | 'image' | 'file' | 'audio' | 'video' | 'location' | 'custom'

interface Message {
  id: string
  type: MessageType
  content: string
  senderId: string
  receiverId: string
  timestamp: number
  status: 'sending' | 'sent' | 'delivered' | 'read' | 'failed'
  metadata?: Record<string, unknown>
}
```

## 开发

```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev

# 构建库
pnpm build:lib

# 运行测试
pnpm test:unit
```

## 许可证

[MIT](LICENSE)
