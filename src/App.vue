<script setup lang="ts">
import { RouterView } from 'vue-router'
import GlobalInputListener from '@/components/GlobalInputListener.vue'

const handleInput = (text: string) => {
  console.log('收到输入:', text)
}
</script>

<template>
  <GlobalInputListener :show-input-box="false" @input="handleInput" />
  <RouterView />
</template>

<style></style>
