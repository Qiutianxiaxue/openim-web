<template>
  <div v-input-listener="{ onKeydown: handleKeydown }" class="fixed top-0 left-0 w-full h-full">
    <div v-if="showInput" class="fixed top-4 right-4 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg z-50">
      <div class="text-sm text-gray-600 dark:text-gray-300">
        按键: {{ lastKey }}
      </div>
      <div class="text-sm text-gray-600 dark:text-gray-300 mt-2">
        组合键: {{ modifiers.join(' + ') }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const showInput = ref(false)
const lastKey = ref('')
const modifiers = ref<string[]>([])

const handleKeydown = (event: KeyboardEvent) => {
  console.log('按键事件触发:', event.key) // 添加调试日志

  // 忽略功能键
  if (event.key === 'Control' || event.key === 'Shift' || event.key === 'Alt' || event.key === 'Meta') {
    return
  }

  showInput.value = true
  lastKey.value = event.key

  // 获取修饰键
  modifiers.value = []
  if (event.ctrlKey) modifiers.value.push('Ctrl')
  if (event.shiftKey) modifiers.value.push('Shift')
  if (event.altKey) modifiers.value.push('Alt')
  if (event.metaKey) modifiers.value.push('Meta')

  // 3秒后隐藏提示
  setTimeout(() => {
    showInput.value = false
  }, 3000)
}

// 添加组件挂载时的调试信息
onMounted(() => {
  console.log('GlobalInputListener 组件已挂载')
})
</script>

<style scoped>
.fixed {
  pointer-events: none;
  /* 确保不会影响其他元素的交互 */
}
</style>