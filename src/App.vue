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
    await wsService.connect('ws://10.0.2.219:38081', {
      'client-type': 'EnterpriseCenterWEB',
      Appid: '1001',
      ClientId: '1001',
      Timestamp: '1739166426',
      Authorization: 'Bearer QC0bb5fa88eba0f98635389a7'
    })

    // 订阅主题
    wsService.subscribe('test/#')

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
