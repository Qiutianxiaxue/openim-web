<template>
  <div v-input-listener="{ onKeydown: handleKeydown }" class="fixed top-0 left-0 w-full h-full">
    <!-- 按键提示 -->
    <Teleport to="body">
      <div v-if="showInput && !isTyping"
        class="fixed top-4 right-4 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg z-[9999]">
        <div class="text-sm text-gray-600 dark:text-gray-300">
          按键: {{ lastKey }}
        </div>
        <div class="text-sm text-gray-600 dark:text-gray-300 mt-2">
          组合键: {{ modifiers.join(' + ') }}
        </div>
      </div>
    </Teleport>

    <!-- 输入框 -->
    <Teleport to="body">
      <div v-if="isTyping && showInputBox"
        class="fixed top-4 right-4 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg z-[9999]">
        <input ref="inputRef" v-model="inputText" type="text"
          class="w-64 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="输入内容..." @keydown.esc="cancelTyping" @keydown.enter="submitInput" @keydown.stop
          @blur="handleInputBlur" />
        <div class="mt-2 text-xs text-gray-500 dark:text-gray-400">
          按 Enter 确认，Esc 取消
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick, onUnmounted } from 'vue'

const props = defineProps<{
  showInputBox?: boolean // 是否显示输入框
}>()

const emit = defineEmits<{
  (e: 'input', text: string): void // 输入事件
}>()

const showInput = ref(false)
const lastKey = ref('')
const modifiers = ref<string[]>([])
const isTyping = ref(false)
const inputText = ref('')
const inputRef = ref<HTMLInputElement | null>(null)

const handleKeydown = async (event: KeyboardEvent) => {
  console.log('按键事件触发:', event.ctrlKey, event.key)

  // 如果正在输入，不处理按键事件
  if (isTyping.value) {
    return
  }

  // 忽略功能键
  if (event.key === 'Control' || event.key === 'Shift' || event.key === 'Alt' || event.key === 'Meta') {
    return
  }

  // 检查是否有修饰键
  const hasModifiers = event.ctrlKey || event.altKey || event.metaKey

  if (!hasModifiers) {
    // 如果没有修饰键，开始输入模式
    isTyping.value = true
    inputText.value = '' // 清空输入框
    showInput.value = false

    if (props.showInputBox) {
      // 显示输入框模式
      await nextTick()
      inputRef.value?.focus()
    }
    // 不显示输入框模式下，第一个字符会在 handleKeyPress 中处理
  } else {
    // 如果有修饰键，显示按键提示
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
}

const handleInputBlur = () => {
  // 延迟关闭，以便能够处理点击输入框内部的情况
  setTimeout(() => {
    cancelTyping()
  }, 100)
}

const cancelTyping = () => {
  isTyping.value = false
  inputText.value = ''
}

const submitInput = () => {
  if (inputText.value.trim()) {
    console.log('提交输入:', inputText.value)
    emit('input', inputText.value)
  }
  cancelTyping()
}

// 添加组件挂载时的调试信息
onMounted(() => {
  console.log('GlobalInputListener 组件已挂载')
})

// 监听键盘事件，用于不显示输入框模式下的输入收集
const handleKeyPress = (event: KeyboardEvent) => {
  if (isTyping.value && !props.showInputBox) {
    if (event.key === 'Enter') {
      submitInput()
    } else if (event.key === 'Escape') {
      cancelTyping()
    } else if (event.key.length === 1) { // 只处理可打印字符
      // 处理数字键的特殊字符
      let char = event.key
      if (event.shiftKey) {
        // 数字键的特殊字符映射
        const specialChars: { [key: string]: string } = {
          '1': '!',
          '2': '@',
          '3': '#',
          '4': '$',
          '5': '%',
          '6': '^',
          '7': '&',
          '8': '*',
          '9': '(',
          '0': ')',
          '-': '_',
          '=': '+',
          '[': '{',
          ']': '}',
          '\\': '|',
          ';': ':',
          "'": '"',
          ',': '<',
          '.': '>',
          '/': '?',
          '`': '~'
        }
        char = specialChars[event.key] || event.key.toUpperCase()
      }
      inputText.value += char
    }
  }
}

onMounted(() => {
  window.addEventListener('keypress', handleKeyPress)
})

onUnmounted(() => {
  window.removeEventListener('keypress', handleKeyPress)
})
</script>

<style scoped>
.fixed {
  pointer-events: none;
  /* 确保不会影响其他元素的交互 */
}

/* 输入框需要可以交互 */
input {
  pointer-events: auto;
}

/* 确保输入框容器可以交互 */
div[v-if="isTyping"] {
  pointer-events: auto;
}
</style>