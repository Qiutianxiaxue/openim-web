<script setup lang="ts">
import { ref } from 'vue'
import { ChatWindow } from '../index'

const chatRef = ref()

</script>

<template>
  <chat-window ref="chatRef" api-url="https://api.example.com" ws-url="wss://ws.example.com" token="your-token"
    user-id="user123" theme="light" language="zh-CN" />
</template>

<style lang="scss" scoped></style>
