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

## 使用

### 基础配置

在使用组件之前，需要先配置必要的依赖：

```typescript
// main.ts
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import App from './App.vue'
import OpenIMWeb from 'openim-web'
import 'openim-web/dist/style.css'

const app = createApp(App)

// 配置 Pinia
const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)
app.use(pinia)

// 注册组件库
app.use(OpenIMWeb)
app.mount('#app')
```

### 使用组件

```vue
<template>
  <ChatWindow api-url="https://api.example.com" ws-url="wss://ws.example.com" token="your-token" />
</template>

<script setup lang="ts">
import { ChatWindow } from 'openim-web'
</script>
```

## 依赖说明

本库需要以下依赖：

```json
{
  "dependencies": {
    "vue": "^3.0.0",
    "pinia": "^2.0.0",
    "pinia-plugin-persistedstate": "^4.0.0"
  }
}
```

### 重要说明

1. Pinia 配置

   - 必须在使用组件库之前配置 Pinia
   - 必须安装并配置 `pinia-plugin-persistedstate`
   - 建议在使用组件库之前注册 Pinia，以避免状态管理冲突

2. 样式文件

   - 必须引入 `openim-web/dist/style.css`
   - 确保样式文件在组件之前引入

3. 主题配置
   - 组件库支持亮色/暗色主题
   - 可以通过 Pinia store 控制主题切换

## 组件 Props

| 属性名  | 类型   | 必填 | 说明            |
| ------- | ------ | ---- | --------------- |
| api-url | string | 是   | OpenIM API 地址 |
| ws-url  | string | 是   | WebSocket 地址  |
| token   | string | 是   | 用户认证令牌    |

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
