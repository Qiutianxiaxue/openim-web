<script setup lang="ts">
import { RouterView } from 'vue-router'
import { onMounted, onUnmounted } from 'vue'
import { wsService } from './services/websocket'

onMounted(async () => {
  try {
    wsService.connect('ws://127.0.0.1:38081', {
      'client-type': 'EnterpriseCenterWEB',
      Appid: '1001',
      ClientId: '1021312301',
      Timestamp: '1739166426',
      Authorization: 'Bearer QCceaf6ef73e8ae2b582e04c5',
    })

    // 订阅主题
    wsService.open((data) => {
      console.log('WebSocket 连接成功', data)
    })
    // 监听消息
    wsService.onMessage((data) => {
      console.log('收到消息:', data)
    })
  } catch (error) {
    console.error('WebSocket 连接失败:', error)
  }
})

onUnmounted(() => {
  // 在应用关闭时断开连接
  wsService.disconnect()
})
</script>

<template>
  <RouterView />
</template>

<style></style>
