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
        @keydown.ctrl.enter.exact.prevent="handleCtrlEnter" @dragover.prevent="handleDragOver"
        @dragleave.prevent="handleDragLeave" @drop.prevent="handleDrop"></div>
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
import type { FileType } from '@/types/FileType'

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

// 预览文件列表
interface PreviewFile {
  uid: string | number
  name: string
  fileSize: number
  fileType?: FileType
  url?: string
  thumbUrl?: string
  showDelIcon?: boolean
  file?: File
}

const previewFiles = ref<PreviewFile[]>([])

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

// 处理拖拽相关事件
const handleDragOver = (e: DragEvent) => {
  e.preventDefault()
  e.stopPropagation()
}

const handleDragLeave = (e: DragEvent) => {
  e.preventDefault()
  e.stopPropagation()
}

// 获取文件类型
const getFileType = (mimeType: string): FileType => {
  if (mimeType.startsWith('image/')) return 'image'
  if (mimeType.startsWith('video/')) return 'video'
  if (mimeType.startsWith('audio/')) return 'audio'
  if (mimeType.includes('pdf')) return 'pdf'
  if (mimeType.includes('word') || mimeType.includes('doc')) return 'word'
  if (mimeType.includes('excel') || mimeType.includes('sheet')) return 'excel'
  if (mimeType.includes('powerpoint') || mimeType.includes('presentation')) return 'ppt'
  if (mimeType.includes('zip') || mimeType.includes('rar')) return 'zip'
  if (mimeType.includes('text')) return 'txt'
  return 'file'
}

const handleDrop = async (e: DragEvent) => {
  e.preventDefault()
  e.stopPropagation()

  const files = e.dataTransfer?.files
  if (!files) return

  // 确保编辑器有焦点
  editorRef.value?.focus()

  // 获取当前选区
  const selection = window.getSelection()
  if (!selection) return

  let range: Range
  try {
    range = selection.getRangeAt(0)
  } catch {
    // 如果没有选区，创建一个新的选区并定位到末尾
    range = document.createRange()
    range.selectNodeContents(editorRef.value!)
    range.collapse(false)
    selection.removeAllRanges()
    selection.addRange(range)
  }

  // 检查选区是否在编辑器内
  if (!editorRef.value?.contains(range.commonAncestorContainer)) {
    // 如果不在编辑器内，将光标移动到末尾
    range = document.createRange()
    range.selectNodeContents(editorRef.value!)
    range.collapse(false)
    selection.removeAllRanges()
    selection.addRange(range)
  }

  // 处理拖入的文件
  for (const file of Array.from(files)) {
    // 如果是图片，调用 handleFile 处理
    if (file.type.startsWith('image/')) {
      await handleFile(file)
    } else {
      // 其他文件类型，创建并插入文件预览元素
      const fileId = md5(file.name + file.size + file.lastModified)
      const previewFile: PreviewFile = {
        uid: fileId,
        name: file.name,
        fileSize: file.size,
        fileType: getFileType(file.type),
        showDelIcon: true,
        file: file
      }

      // 将文件添加到待发送列表
      previewFiles.value.push(previewFile)

      // 创建预览元素
      const previewElement = document.createElement('span')
      previewElement.className = 'file-preview'
      previewElement.contentEditable = 'false'
      previewElement.dataset.fileId = fileId

      // 创建左右布局容器
      const previewLayout = document.createElement('div')
      previewLayout.className = 'preview-layout'

      // 创建左侧图标区域
      const previewIconArea = document.createElement('div')
      previewIconArea.className = 'preview-icon-area'
      const icon = document.createElement('i')
      icon.className = getFileIcon(previewFile.fileType)
      previewIconArea.appendChild(icon)
      previewLayout.appendChild(previewIconArea)

      // 创建右侧信息区域
      const previewInfoArea = document.createElement('div')
      previewInfoArea.className = 'preview-info-area'

      // 右侧第一行：文件名和扩展名
      const firstLine = document.createElement('div')
      firstLine.className = 'preview-first-line'

      const nameSpan = document.createElement('span')
      nameSpan.className = 'preview-name' // 修改类名
      // 获取文件名（不含扩展名）和扩展名
      const fileNameParts = previewFile.name.split('.')
      const extension = fileNameParts.length > 1 ? fileNameParts.pop() : '' // 确保有扩展名再弹出
      const name = fileNameParts.join('.')
      nameSpan.textContent = name // 只显示文件名
      nameSpan.title = previewFile.name // 添加title用于显示完整文件名

      const extensionSpan = document.createElement('span')
      extensionSpan.className = 'preview-extension' // 新增类名
      extensionSpan.textContent = extension ? '.' + extension : '' // 显示点和扩展名
      extensionSpan.title = extension ? '.' + extension : ''

      firstLine.appendChild(nameSpan)
      firstLine.appendChild(extensionSpan)

      previewInfoArea.appendChild(firstLine)

      // 右侧第二行：文件大小
      const secondLine = document.createElement('div')
      secondLine.className = 'preview-second-line'

      const sizeSpan = document.createElement('span')
      sizeSpan.className = 'preview-size'
      sizeSpan.textContent = formatFileSize(previewFile.fileSize)
      secondLine.appendChild(sizeSpan)

      previewInfoArea.appendChild(secondLine)

      previewLayout.appendChild(previewInfoArea)
      previewElement.appendChild(previewLayout)

      // 在光标位置插入预览
      range.deleteContents()
      range.insertNode(previewElement)

      // 移动光标到预览后面
      range.setStartAfter(previewElement)
      range.setEndAfter(previewElement)
      selection.removeAllRanges()
      selection.addRange(range)
    }
  }

  // 更新内容
  content.value = editorRef.value?.innerText || ''
}

// 添加文件大小格式化函数
const formatFileSize = (size: number) => {
  if (size < 1024) {
    return size + 'B'
  } else if (size < 1024 * 1024) {
    return (size / 1024).toFixed(2) + 'KB'
  } else if (size < 1024 * 1024 * 1024) {
    return (size / (1024 * 1024)).toFixed(2) + 'MB'
  } else {
    return (size / (1024 * 1024 * 1024)).toFixed(2) + 'GB'
  }
}

// 添加文件图标获取函数
const getFileIcon = (type?: FileType) => {
  const iconMap: Record<FileType, string> = {
    word: 'vxe-icon-file-word',
    excel: 'vxe-icon-file-excel',
    ppt: 'vxe-icon-file-ppt',
    pdf: 'vxe-icon-file-pdf',
    txt: 'vxe-icon-file-txt',
    image: 'vxe-icon-file-image',
    audio: 'vxe-icon-file-txt',
    video: 'vxe-icon-square-caret-right',
    zip: 'vxe-icon-file-zip',
    file: 'vxe-icon-file-txt'
  }
  return iconMap[type || 'file']
}

const handleFile = async (file: File) => {
  // 生成文件唯一标识
  const fileId = md5(file.name + file.size + file.lastModified)

  // 如果是图片，可以预览
  if (file.type.startsWith('image/')) {
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = document.createElement('img')
      img.className = 'preview-image'

      // 先设置样式
      img.style.height = '72px'
      img.style.width = 'auto'
      img.style.maxWidth = '100%'
      img.style.objectFit = 'contain'
      img.style.display = 'inline-block'
      img.style.margin = '4px'
      img.style.borderRadius = '4px'

      // 然后设置图片源
      img.src = e.target?.result as string

      // 图片加载完成后确保样式生效
      img.onload = () => {
        // 获取当前选区
        const selection = window.getSelection()
        if (!selection) return

        let range: Range
        try {
          range = selection.getRangeAt(0)
        } catch {
          // 如果没有选区，创建一个新的选区并定位到末尾
          range = document.createRange()
          range.selectNodeContents(editorRef.value!)
          range.collapse(false)
          selection.removeAllRanges()
          selection.addRange(range)
        }

        // 在光标位置插入图片
        range.deleteContents()
        range.insertNode(img)
        // 移动光标到图片后面
        range.setStartAfter(img)
        range.setEndAfter(img)
        selection.removeAllRanges()
        selection.addRange(range)

        // 更新内容
        content.value = editorRef.value?.innerText || ''
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
    // 直接调用 handleFile 处理选中的文件
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

  // 发送文本消息
  if (content.value.trim()) {
    emit('send', {
      type: 'text',
      content: content.value
    })
  }

  // 发送文件消息
  const fileElements = editorRef.value?.querySelectorAll('.file-preview')
  fileElements?.forEach(element => {
    const fileId = element.getAttribute('data-file-id')
    const file = previewFiles.value.find(f => f.uid === fileId)
    if (file?.file) {
      emit('send', {
        type: 'file',
        content: file.file,
        fileType: file.fileType,
        fileId: String(file.uid)
      })
    }
  })

  // 清空输入框和预览
  if (editorRef.value) {
    editorRef.value.innerText = ''
    content.value = ''
  }
  previewFiles.value = []
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
  previewFiles.value.forEach(file => {
    if (file.url) {
      URL.revokeObjectURL(file.url)
    }
  })
})
</script>

<style lang="scss">
.chat-window {
  .message-input {
    position: relative;
    border: 1px solid #e0e0e0;
    border-radius: 4px;
    background: #fff;
    z-index: 1;
    display: flex;
    flex-direction: column;
    height: 100%;
  }

  .input-toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px;
    border-bottom: 1px solid #e0e0e0;
    flex-shrink: 0;
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

    &:hover {
      background-color: #f5f5f5;
    }
  }

  .send-btn {
    padding: 6px 16px;
    border: none;
    border-radius: 4px;
    background-color: #1890ff;
    color: white;
    cursor: pointer;
    transition: background-color 0.2s;

    &:disabled {
      background-color: #d9d9d9;
      cursor: not-allowed;
    }
  }

  .input-area {
    padding: 12px;
    flex: 1;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }

  .editor {
    flex: 1;
    overflow-y: auto;
    outline: none;
    line-height: 1.5;
    min-height: 0;
    white-space: pre-wrap;
    word-break: break-all;

    &:empty:before {
      content: attr(placeholder);
      color: #999;
    }
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

    &:hover {
      background-color: #f5f5f5;
    }
  }

  .hidden {
    display: none;
  }

  .file-preview {
    display: inline-block;
    margin: 4px;
    vertical-align: middle;
    user-select: none;
    background: #f5f5f5;
    border: 1px solid #e0e0e0;
    border-radius: 4px;
    padding: 8px;
    pointer-events: none;
    height: 72px;
    width: 230px;
    overflow: hidden;

    &.is-image {
      padding: 0;
      border: none;
      background: none;
      height: auto;
      width: auto;
      max-height: 72px;
    }
  }

  .preview-layout {
    display: flex;
    align-items: center;
    height: 100%;
  }

  .preview-icon-area {
    width: 56px;
    height: 72px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    margin-right: 8px;

    i {
      font-size: 42px;
      color: #909399;
    }
  }

  .preview-info-area {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    height: 100%;
    overflow: hidden;
  }

  .preview-first-line {
    display: flex;
    align-items: baseline;
  }

  .preview-name {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    margin-right: 4px;
  }

  .preview-extension {
    flex-shrink: 0;
    white-space: nowrap;
  }

  .preview-second-line {
    margin-top: 4px;
    font-size: 12px;
    color: #909399;
  }

  .file-preview.is-image .preview-content img {
    width: auto;
    height: auto;
    max-height: 72px;
    object-fit: contain;
    margin-right: 0;
    border-radius: 4px;
    display: block;
  }

  .preview-content i {
    display: none;
  }

  .preview-size {
    font-size: 12px;
    color: #909399;
  }

  /* 保留原有的 .preview-image 样式用于文件选择器上传的图片 */
  .preview-image {
    display: inline-block;
    margin: 4px;
    border-radius: 4px;
    object-fit: contain;
    height: 72px;
    width: auto;
    max-width: 100%;
    vertical-align: middle;
  }
}
</style>
