<template>
  <div class="message-input">
    <div class="input-toolbar">
      <div class="toolbar-left">
        <button class="toolbar-btn" ref="emojiBtnRef" @click.stop="toggleEmojiPicker">
          <i class="icon-emoji">😊</i>
        </button>
        <button class="toolbar-btn" @click.stop="() => triggerFileInput('image')">
          <i class="icon-image">🖼️</i>
        </button>
        <button class="toolbar-btn" @click.stop="() => triggerFileInput('file')">
          <i class="icon-file">📎</i>
        </button>
      </div>
      <div class="toolbar-right">
        <button class="send-btn" :disabled="!canSend" @click.stop="handleSend">
          发送
        </button>
      </div>
    </div>

    <div class="input-area">
      <div ref="editorRef" class="editor" contenteditable="true" :placeholder="placeholder" @input="handleInput"
        @paste="handlePaste" @keydown.enter.exact.prevent="handleEnter"
        @keydown.ctrl.enter.exact.prevent="handleCtrlEnter"></div>
    </div>

    <!-- 表情选择器 -->
    <Teleport to="body">
      <div v-if="showEmojiPicker" class="emoji-picker" :style="emojiPickerStyle" @click.stop>
        <div class="emoji-list">
          <span v-for="emoji in emojis" :key="emoji" class="emoji-item" @mousedown.prevent="insertEmoji(emoji)">
            {{ emoji }}
          </span>
        </div>
      </div>
    </Teleport>

    <!-- 文件选择器 -->
    <input ref="fileInputRef" type="file" :accept="fileInputAccept" multiple class="hidden"
      @change="handleFileSelect" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { md5 } from '../utils/md5'

defineProps<{
  maxLength?: number
  placeholder?: string
}>()

const emit = defineEmits<{
  (e: 'send', message: { type: string; content: string | File; fileType?: string; fileId?: string }): void
}>()

// 状态变量
const editorRef = ref<HTMLElement | null>(null)
const fileInputRef = ref<HTMLInputElement | null>(null)
const showEmojiPicker = ref(false)
const fileInputAccept = ref('image/*')
const content = ref('')

// 表情列表
const emojis = [
  '😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣',
  '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰',
  '😘', '😗', '😙', '😚', '😋', '😛', '😝', '😜',
  '🤪', '🤨', '🧐', '🤓', '😎', '🤩', '🥳', '😏'
]

// 计算属性
const canSend = computed(() => {
  return content.value.trim().length > 0
})

// 方法
const handleInput = (e: Event) => {
  const target = e.target as HTMLElement
  content.value = target.innerText
}

const handlePaste = async (e: ClipboardEvent) => {
  e.preventDefault()
  const items = e.clipboardData?.items

  if (!items) return

  for (const item of items) {
    if (item.type.indexOf('image') !== -1) {
      const file = item.getAsFile()
      if (file) {
        await handleFile(file)
      }
    } else if (item.type === 'text/plain') {
      item.getAsString((text) => {
        insertText(text)
      })
    }
  }
}

const handleFile = async (file: File) => {
  // 生成文件唯一标识
  const fileId = md5(file.name + file.size + file.lastModified)

  // 如果是图片，可以预览
  if (file.type.startsWith('image/')) {
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = document.createElement('img')
      img.src = e.target?.result as string
      img.className = 'preview-image'
      img.style.maxWidth = '200px'
      img.style.maxHeight = '200px'

      // 获取当前选区
      const selection = window.getSelection()
      const range = selection?.getRangeAt(0)

      if (range) {
        // 在光标位置插入图片
        range.deleteContents()
        range.insertNode(img)
        // 移动光标到图片后面
        range.setStartAfter(img)
        range.setEndAfter(img)
        selection?.removeAllRanges()
        selection?.addRange(range)
      } else {
        editorRef.value?.appendChild(img)
      }
    }
    reader.readAsDataURL(file)
  }

  emit('send', {
    type: 'file',
    content: file,
    fileType: file.type,
    fileId
  })
}

const handleFileSelect = (e: Event) => {
  const target = e.target as HTMLInputElement
  const files = target.files
  if (files) {
    Array.from(files).forEach(handleFile)
  }
  // 清空 input 值，允许重复选择相同文件
  target.value = ''
}

const triggerFileInput = (type: 'image' | 'file' = 'image') => {
  if (fileInputRef.value) {
    fileInputAccept.value = type === 'image' ? 'image/*' : '*/*'
    fileInputRef.value.click()
  }
}

const emojiBtnRef = ref<HTMLElement | null>(null)
const emojiPickerStyle = ref<{
  top: string
  left: string
  transform?: string
}>({
  top: '0px',
  left: '0px'
})

const updateEmojiPickerPosition = () => {
  if (emojiBtnRef.value && showEmojiPicker.value) {
    const rect = emojiBtnRef.value.getBoundingClientRect()
    emojiPickerStyle.value = {
      top: `${rect.top + window.scrollY - 8}px`,
      left: `${rect.left + window.scrollX}px`,
      transform: 'translateY(-100%)'
    }
  }
}

const toggleEmojiPicker = () => {
  showEmojiPicker.value = !showEmojiPicker.value
  if (showEmojiPicker.value) {
    nextTick(() => {
      updateEmojiPickerPosition()
      // 保持输入框焦点
      editorRef.value?.focus()
    })
  }
}

const insertEmoji = (emoji: string) => {
  if (editorRef.value) {
    // 确保输入框有焦点
    editorRef.value.focus()

    const selection = window.getSelection()
    if (!selection) return

    // 获取当前选区
    const range = selection.getRangeAt(0)

    // 检查选区是否在编辑器内
    if (!editorRef.value.contains(range.commonAncestorContainer)) {
      // 如果不在编辑器内，将光标移动到末尾
      const newRange = document.createRange()
      newRange.selectNodeContents(editorRef.value)
      newRange.collapse(false)
      selection.removeAllRanges()
      selection.addRange(newRange)
    }

    // 在光标位置插入表情
    range.deleteContents()
    const textNode = document.createTextNode(emoji)
    range.insertNode(textNode)

    // 创建新的范围并设置到表情后面
    const newRange = document.createRange()
    newRange.setStartAfter(textNode)
    newRange.setEndAfter(textNode)

    // 清除当前选区并设置新的选区
    selection.removeAllRanges()
    selection.addRange(newRange)

    // 强制更新选区
    editorRef.value.focus()
    selection.removeAllRanges()
    selection.addRange(newRange)

    // 更新内容
    content.value = editorRef.value.innerText
  }
}

const insertText = (text: string) => {
  if (editorRef.value) {
    const selection = window.getSelection()
    const range = selection?.getRangeAt(0)
    if (range) {
      range.deleteContents()
      range.insertNode(document.createTextNode(text))
      // 移动光标到插入文本后
      range.setStartAfter(range.endContainer)
      range.setEndAfter(range.endContainer)
      selection?.removeAllRanges()
      selection?.addRange(range)
    } else {
      editorRef.value.innerText += text
    }
    content.value = editorRef.value.innerText
  }
}

const handleEnter = () => {
  if (canSend.value) {
    handleSend()
  }
}

const handleCtrlEnter = () => {
  insertText('\n')
}

const handleSend = () => {
  if (!canSend.value) return

  emit('send', {
    type: 'text',
    content: content.value
  })

  // 清空输入框
  if (editorRef.value) {
    editorRef.value.innerText = ''
    content.value = ''
  }
}

// 点击外部关闭表情选择器
const handleClickOutside = (e: MouseEvent) => {
  const target = e.target as HTMLElement
  if (!target.closest('.emoji-picker') && !target.closest('.toolbar-btn')) {
    showEmojiPicker.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  window.addEventListener('resize', updateEmojiPickerPosition)
  window.addEventListener('scroll', updateEmojiPickerPosition)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  window.removeEventListener('resize', updateEmojiPickerPosition)
  window.removeEventListener('scroll', updateEmojiPickerPosition)
})
</script>

<style scoped>
.message-input {
  position: relative;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  background: #fff;
  z-index: 1;
}

.input-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px;
  border-bottom: 1px solid #e0e0e0;
}

.toolbar-left {
  display: flex;
  gap: 8px;
}

.toolbar-btn {
  padding: 4px 8px;
  border: none;
  background: none;
  cursor: pointer;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.toolbar-btn:hover {
  background-color: #f5f5f5;
}

.send-btn {
  padding: 6px 16px;
  border: none;
  border-radius: 4px;
  background-color: #1890ff;
  color: white;
  cursor: pointer;
  transition: background-color 0.2s;
}

.send-btn:disabled {
  background-color: #d9d9d9;
  cursor: not-allowed;
}

.input-area {
  padding: 12px;
}

.editor {
  min-height: 80px;
  max-height: 200px;
  overflow-y: auto;
  outline: none;
  line-height: 1.5;
}

.editor:empty:before {
  content: attr(placeholder);
  color: #999;
}

.emoji-picker {
  position: fixed;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  padding: 8px;
  z-index: 9999;
  min-width: 300px;
}

.emoji-list {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 4px;
}

.emoji-item {
  cursor: pointer;
  padding: 4px;
  text-align: center;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.emoji-item:hover {
  background-color: #f5f5f5;
}

.hidden {
  display: none;
}

.preview-image {
  display: inline-block;
  margin: 4px;
  border-radius: 4px;
  object-fit: contain;
}
</style>
