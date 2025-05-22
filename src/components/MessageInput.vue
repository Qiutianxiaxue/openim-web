<template>
  <div class="message-input">
    <div class="input-toolbar">
      <div class="toolbar-left">
        <button class="toolbar-btn" ref="emojiBtnRef" @click.stop="toggleEmojiPicker">
          <i class="iconfont icon-biaoqing"></i>
        </button>
        <button class="toolbar-btn" @click.stop="() => triggerFileInput('image')">
          <i class="iconfont icon-tupian"></i>
        </button>
        <button class="toolbar-btn" @click.stop="() => triggerFileInput('file')">
          <i class="iconfont icon-wenjianjia"></i>
        </button>
        <button class="toolbar-btn" @click.stop="() => triggerChat()">
          <i class="iconfont icon-xiaoxi"></i>
        </button>
      </div>
    </div>

    <div class="input-area">
      <div ref="editorRef" class="editor" contenteditable="true" :placeholder="placeholder" @input="handleInput"
        @mouseup="saveLastRange" @keyup="saveLastRange" @paste="handlePaste" @keydown.enter.exact.prevent="handleEnter"
        @keydown.ctrl.enter.exact.prevent="handleCtrlEnter" @dragover.prevent="handleDragOver"
        @dragleave.prevent="handleDragLeave" @drop.prevent="handleDrop"></div>
    </div>

    <div class="send-area">
      <vxe-button status="primary" :disabled="!canSend" @click.stop="handleSend" content="发送"></vxe-button>
    </div>

    <!-- 表情选择器 -->
    <Teleport to="body">
      <div v-if="showEmojiPicker" class="emoji-picker" :style="emojiPickerStyle" @click.stop @mousedown.prevent>
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
  // 检查是否有文本内容
  const hasText = content.value.trim().length > 0
  // 检查是否有文件预览
  const hasFiles = previewFiles.value.length > 0
  // 检查编辑器中是否有图片或文件预览元素
  const hasPreviewElements = editorRef.value?.querySelector('.preview-image, .file-preview') !== null

  return hasText || hasFiles || hasPreviewElements
})

// 方法
const handleInput = (e: Event) => {
  const target = e.target as HTMLElement
  content.value = target.innerText

  // 当内容为空时，强制清空 innerHTML，确保 :empty 伪类生效
  if (content.value.trim() === '') {
    // 使用 nextTick 确保在 DOM 更新后再清空
    nextTick(() => {
      if (target.innerText.trim() === '') { // 再次检查，避免意外清空
        target.innerHTML = '';
      }
    })
  }
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

// 添加文件处理函数
const processFile = async (file: File) => {
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
      const imageUrl = e.target?.result as string
      img.src = imageUrl

      // 将图片文件信息添加到 previewFiles
      const previewFile: PreviewFile = {
        uid: fileId,
        name: file.name,
        fileSize: file.size,
        fileType: 'image',
        url: imageUrl,
        file: file
      }
      previewFiles.value.push(previewFile)

      // 图片加载完成后确保样式生效
      img.onload = () => {
        insertElementAtCursor(img)
      }
    }
    reader.readAsDataURL(file)
  } else {
    // 非图片文件，创建文件预览元素
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
    const previewElement = createFilePreviewElement(previewFile)
    insertElementAtCursor(previewElement)
  }

  emit('send', {
    type: 'file',
    content: file,
    fileType: file.type,
    fileId
  })
}

// 在光标位置插入元素
const insertElementAtCursor = (element: HTMLElement) => {
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

  // 在光标位置插入元素
  range.deleteContents()
  range.insertNode(element)

  // 移动光标到元素后面
  range.setStartAfter(element)
  range.setEndAfter(element)
  selection.removeAllRanges()
  selection.addRange(range)

  // 更新内容
  content.value = editorRef.value?.innerText || ''
}

// 创建文件预览元素
const createFilePreviewElement = (previewFile: PreviewFile) => {
  const previewElement = document.createElement('span')
  previewElement.className = 'file-preview'
  previewElement.contentEditable = 'false'
  previewElement.dataset.fileId = String(previewFile.uid)

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
  nameSpan.className = 'preview-name'
  // 获取文件名（不含扩展名）和扩展名
  const fileNameParts = previewFile.name.split('.')
  const extension = fileNameParts.length > 1 ? fileNameParts.pop() : ''
  const name = fileNameParts.join('.')
  nameSpan.textContent = name
  nameSpan.title = previewFile.name

  const extensionSpan = document.createElement('span')
  extensionSpan.className = 'preview-extension'
  extensionSpan.textContent = extension ? '.' + extension : ''
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

  return previewElement
}

// 修改 handleFile 函数
const handleFile = async (file: File) => {
  await processFile(file)
}

// 修改 handlePaste 函数
const handlePaste = async (e: ClipboardEvent) => {
  e.preventDefault()
  const items = e.clipboardData?.items

  if (!items) return

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

  for (const item of items) {
    // 粘贴文件
    if (item.kind === 'file') {
      const file = item.getAsFile()
      if (file) {
        await processFile(file)
      }
    } else if (item.type === 'text/plain') {
      // 粘贴文本
      item.getAsString((text) => {
        insertText(text)
      })
    }
  }
}

// 修改 handleDrop 函数
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
    await processFile(file)
  }
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
    // 先清空 input 的值，确保可以重复选择相同文件
    fileInputRef.value.value = ''
    // 设置 accept 属性
    fileInputRef.value.accept = type === 'image' ? 'image/*' : '*/*'
    // 触发点击
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
const triggerChat = () => { }

const lastRange = ref<Range | null>(null)

// 保存最后的光标位置
const saveLastRange = () => {
  const selection = window.getSelection()
  if (selection && selection.rangeCount > 0) {
    const range = selection.getRangeAt(0)
    // 确保保存的 range 在编辑器内
    if (editorRef.value?.contains(range.commonAncestorContainer)) {
      lastRange.value = range.cloneRange() // 克隆 Range 以免被修改
    }
  }
}

const insertEmoji = (emoji: string) => {
  if (editorRef.value) {
    // 确保输入框有焦点
    editorRef.value.focus()

    const selection = window.getSelection()
    if (!selection) return

    let range: Range | null = null

    // 尝试获取当前选区
    if (selection.rangeCount > 0) {
      const currentRange = selection.getRangeAt(0)
      // 检查当前选区是否在编辑器内
      if (editorRef.value.contains(currentRange.commonAncestorContainer)) {
        range = currentRange
      }
    }

    // 如果没有有效的当前选区，尝试使用保存的最后光标位置
    if (!range && lastRange.value) {
      range = lastRange.value
      selection.removeAllRanges()
      selection.addRange(range)
    } else if (!range) {
      // 如果没有有效的当前选区也没有保存的光标位置，则将光标定位到末尾
      range = document.createRange()
      range.selectNodeContents(editorRef.value)
      range.collapse(false)
      selection.removeAllRanges()
      selection.addRange(range)
    }

    if (!range) return // 理论上不会发生，但为了类型安全

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

    // 更新保存的最后光标位置
    saveLastRange()

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
  if (!editorRef.value) return

  const nodes = editorRef.value.childNodes
  let textBuffer = ''
  const messagesToSend: Array<{
    type: string
    content: string | File
    fileType?: string
    fileId?: string
  }> = []

  const emitBufferedText = () => {
    const trimmedText = textBuffer.trim()
    if (trimmedText) {
      messagesToSend.push({
        type: 'text',
        content: trimmedText
      })
    }
    textBuffer = '' // Clear buffer after emitting
  }

  nodes.forEach(node => {
    if (node.nodeType === Node.TEXT_NODE) {
      // 如果是文本节点，添加到文本缓冲区
      textBuffer += node.textContent || ''
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      const element = node as HTMLElement
      if (element.classList.contains('file-preview') && element.dataset.fileId) {
        // 如果是文件预览元素
        emitBufferedText() // 发送之前累积的文本

        const fileId = element.dataset.fileId
        // 从 previewFiles 中找到对应的 File 对象
        const previewFile = previewFiles.value.find(f => String(f.uid) === fileId)

        if (previewFile?.file) {
          // 添加文件消息
          messagesToSend.push({
            type: 'file',
            content: previewFile.file, // 发送原始 File 对象
            fileType: previewFile.fileType || fileTypeFromFile(previewFile.file), // 优先使用存储的类型，否则从 File 对象获取
            fileId: String(previewFile.uid)
          })
        }
      } else if (element.classList.contains('preview-image')) {
        // 如果是图片元素
        emitBufferedText() // 发送之前累积的文本

        // 从 previewFiles 中找到对应的图片文件
        const imgSrc = element.getAttribute('src')
        const previewFile = previewFiles.value.find(f => f.url === imgSrc)

        if (previewFile?.file) {
          // 添加图片消息
          messagesToSend.push({
            type: 'file',
            content: previewFile.file,
            fileType: 'image',
            fileId: String(previewFile.uid)
          })
        }
      }
    }
  })

  // 发送末尾剩余的文本
  emitBufferedText()

  // 遍历messagesToSend数组，依次发送消息
  messagesToSend.forEach(message => {
    emit('send', message)
  })

  // 清空输入框和预览列表
  editorRef.value.innerText = ''
  content.value = ''
  // 释放可能存在的图片预览URL
  previewFiles.value.forEach(file => {
    if (file.url) {
      URL.revokeObjectURL(file.url)
    }
  })
  previewFiles.value = []
  lastRange.value = null // 清空保存的光标位置
}

// 辅助函数：从 File 对象获取文件类型 (如果 previewFile.fileType 不存在)
const fileTypeFromFile = (file: File): FileType => {
  return getFileType(file.type)
}

// 点击外部关闭表情选择器
const handleClickOutside = (e: MouseEvent) => {
  const target = e.target as HTMLElement
  if (!target.closest('.emoji-picker') && !target.closest('.toolbar-btn')) {
    showEmojiPicker.value = false
    // 在关闭表情选择器时保存最后的光标位置
    saveLastRange()
  }
}

// 在输入框失去焦点时保存光标位置
onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  window.addEventListener('resize', updateEmojiPickerPosition)
  window.addEventListener('scroll', updateEmojiPickerPosition)
  editorRef.value?.addEventListener('blur', saveLastRange)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  window.removeEventListener('resize', updateEmojiPickerPosition)
  window.removeEventListener('scroll', updateEmojiPickerPosition)
  editorRef.value?.removeEventListener('blur', saveLastRange)
  previewFiles.value.forEach(file => {
    if (file.url) {
      URL.revokeObjectURL(file.url)
    }
  })
})

// 处理拖拽相关事件
const handleDragOver = (e: DragEvent) => {
  e.preventDefault()
  e.stopPropagation()
}

const handleDragLeave = (e: DragEvent) => {
  e.preventDefault()
  e.stopPropagation()
}
</script>

<style lang="scss">
.chat-window {
  .message-input {
    position: relative;
    border-radius: 4px;
    background: var(--vxe-ui-modal-header-background-color);
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

    i {
      font-size: 20px;
      color: #666;
    }

    &:hover {
      background-color: var(--vxe-ui-base-hover-background-color);
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
    font-size: 16px;
    color: var(--vxe-ui-font-color);

    &:empty:before {
      content: attr(placeholder);
      color: var(--vxe-ui-input-placeholder-color);
      font-size: 16px;
    }
  }

  .send-area {
    padding: 8px 12px;
    display: flex;
    justify-content: flex-end;
    flex-shrink: 0;
  }

  .send-btn {
    padding: 8px 24px;
    border: none;
    border-radius: 4px;
    background-color: #1890ff;
    color: white;
    cursor: pointer;
    transition: background-color 0.2s;
    font-size: 16px;

    &:disabled {
      background-color: #d9d9d9;
      cursor: not-allowed;
    }

    &:hover:not(:disabled) {
      background-color: #40a9ff;
    }
  }

  .hidden {
    display: none;
  }

  .file-preview {
    display: inline-block;
    margin: 4px;
    vertical-align: bottom;
    user-select: none;
    background: var(--vxe-ui-font-tinge-color);
    border: 1px solid var(--vxe-ui-font-tinge-color);
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
    vertical-align: bottom;
  }
}

/* 表情弹出框样式 */
.emoji-picker {
  position: fixed;
  background: var(--vxe-ui-modal-header-background-color);
  border: 1px solid var(--vxe-ui-base-popup-border-color);
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
  padding: 8px;
  text-align: center;
  border-radius: 4px;
  transition: background-color 0.2s;
  font-size: 18px;
  line-height: 1;

  &:hover {
    background-color: var(--vxe-ui-base-hover-background-color);
  }
}
</style>
