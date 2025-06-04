<script setup lang="ts">
import { RouterView } from 'vue-router'
import GlobalInputListener from '@/components/GlobalInputListener.vue'
import { onMounted, onUnmounted } from 'vue'
import { wsService } from './services/websocket'

const handleInput = (text: string) => {
  console.log('收到输入:', text)
}

onMounted(async () => {
  try {
    wsService.connect('ws://127.0.0.1:38081', {
      'client-type': 'EnterpriseCenterWEB',
      Appid: '1001',
      ClientId: '1021312301',
      Timestamp: '1739166426',
      Authorization: 'Bearer QC5586bdd29fbc86b3a39df6b',
    })

    // 订阅主题
    wsService.open(() => {
      console.log('WebSocket 连接已打开11111111111111')
      setTimeout(() => {
        wsService.subscribe('test/#')
        wsService.subscribe('message/#')
      }, 1000)
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
  <GlobalInputListener :show-input-box="true" @input="handleInput" />
  <RouterView />
</template>

<style></style>
