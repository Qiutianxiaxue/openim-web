<script setup lang="ts">
import { ref } from 'vue'
import type { FileType } from '@/types/FileType'

defineOptions({
  name: 'AttachmentList'
})

interface AttachmentItem {
  uid: string | number
  name: string
  fileSize: number
  fileType?: FileType
  url?: string
  thumbUrl?: string
  showDelIcon?: boolean
  uploading?: boolean
  progress?: number
}

const props = withDefaults(defineProps<{
  items?: AttachmentItem[]
  overflow?: 'scrollX' | 'scrollY' | 'wrap'
  limit?: number
  hideUpload?: boolean
  accept?: string
  maxSize?: number // 单位：MB
}>(), {
  items: () => [],
  overflow: 'wrap',
  hideUpload: false,
  maxSize: 10
})

const emit = defineEmits<{
  (e: 'delete', item: AttachmentItem, index: number): void
  (e: 'upload', files: FileList): void
  (e: 'preview', item: AttachmentItem): void
}>()

const fileInputRef = ref<HTMLInputElement | null>(null)
const isDragover = ref(false)
const imageError = ref(false)

// 判断是否为图片
const isImage = (item: AttachmentItem) => {
  return item.fileType === 'image' ||
    (item.url && /\.(jpg|jpeg|png|gif|webp)$/i.test(item.url)) ||
    (item.thumbUrl && /\.(jpg|jpeg|png|gif|webp)$/i.test(item.thumbUrl))
}

// 获取文件图标
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

// 格式化文件大小
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

// 获取文件名（不含扩展名）
const getFileNameWithoutExt = (name: string) => {
  const parts = name.split('.')
  return parts.length > 1 ? parts.slice(0, -1).join('.') : name
}

// 获取文件扩展名
const getFileExtension = (name: string) => {
  const parts = name.split('.')
  return parts.length > 1 ? '.' + parts.pop() : ''
}

// 触发文件选择
const triggerUpload = () => {
  fileInputRef.value?.click()
}

// 处理拖拽相关事件
const handleDragOver = () => {
  isDragover.value = true
}

const handleDragLeave = () => {
  isDragover.value = false
}

const handleDrop = (e: DragEvent) => {
  isDragover.value = false
  const files = e.dataTransfer?.files
  if (files) {
    handleFiles(files)
  }
}

// 处理文件选择
const handleFileSelect = (e: Event) => {
  const target = e.target as HTMLInputElement
  if (target.files) {
    handleFiles(target.files)
    target.value = ''
  }
}

// 统一处理文件
const handleFiles = (files: FileList) => {
  // 检查文件大小
  const validFiles = Array.from(files).filter(file => {
    if (file.size > props.maxSize * 1024 * 1024) {
      console.warn(`文件 ${file.name} 超过大小限制 ${props.maxSize}MB`)
      return false
    }
    return true
  })

  if (validFiles.length > 0) {
    emit('upload', files)
  }
}

// 预览图片
const previewImage = (item: AttachmentItem) => {
  if (isImage(item)) {
    emit('preview', item)
  }
}

// 处理删除
const handleDelete = (item: AttachmentItem, index: number) => {
  emit('delete', item, index)
}

const handlePreview = (file: AttachmentItem) => {
  emit('preview', file)
}

const handleImageError = () => {
  imageError.value = true
}
</script>

<template>
  <div class="attachments" @dragover.prevent="handleDragOver" @dragleave.prevent="handleDragLeave"
    @drop.prevent="handleDrop" :class="{ 'is-dragover': isDragover }">
    <div class="attachments-list" :class="props.overflow">
      <div v-for="(item, index) in props.items" :key="item.uid" class="attachment-item">
        <div class="attachment-card" @click="handlePreview(item)">
          <!-- 图片类型 -->
          <div v-if="item.fileType === 'image'" class="attachment-preview image-preview">
            <vxe-image :src="item.url || item.thumbUrl" :height="200" loading="lazy"></vxe-image>
          </div>
          <!-- 视频类型 -->
          <div v-else-if="item.fileType === 'video'" class="attachment-preview video-preview">
            <img :src="item.thumbUrl" :alt="item.name" @error="handleImageError" />
            <div v-if="imageError" class="image-placeholder">
              <i class="el-icon-video-camera"></i>
            </div>
            <div class="video-play-icon">
              <i class="el-icon-video-play"></i>
            </div>
          </div>
          <!-- 其他类型文件 -->
          <div v-else class="attachment-preview file-preview">
            <div class="preview-layout">
              <div class="preview-icon-area">
                <i :class="getFileIcon(item.fileType)"></i>
              </div>
              <div class="preview-info-area">
                <div class="preview-first-line">
                  <span class="preview-name" :title="item.name">{{ getFileNameWithoutExt(item.name) }}</span>
                  <span class="preview-extension">{{ getFileExtension(item.name) }}</span>
                </div>
                <div class="preview-second-line">
                  <span class="preview-size">{{ formatFileSize(item.fileSize) }}</span>
                </div>
              </div>
            </div>
            <!-- 文件信息 -->
            <div class="attachment-info">
              <div class="attachment-name" :title="item.name">{{ item.name }}</div>
              <div class="attachment-size">{{ formatFileSize(item.fileSize) }}</div>
            </div>
          </div>

          <!-- 上传进度 -->
          <div v-if="item.uploading" class="attachment-progress">
            <div class="progress-bar">
              <div class="progress-inner" :style="{ width: item.progress + '%' }"></div>
            </div>
            <span class="progress-text">{{ item.progress }}%</span>
          </div>
          <!-- 删除按钮 -->
          <div v-if="item.showDelIcon" class="attachment-delete" @click.stop="handleDelete(item, index)">
            <i class="el-icon-delete"></i>
          </div>
        </div>
      </div>
      <!-- 上传按钮 -->
      <div v-if="!props.hideUpload && (!props.limit || props.items?.length < props.limit)" class="attachment-upload"
        @click="triggerUpload">
        <i class="el-icon-plus"></i>
        <span>上传文件</span>
        <span class="upload-tip">支持拖拽上传</span>
      </div>
    </div>
    <!-- 文件选择器 -->
    <input ref="fileInputRef" type="file" :accept="props.accept" multiple class="hidden" @change="handleFileSelect" />
  </div>
</template>


<style scoped lang="scss">
.attachments {
  width: 100%;
  position: relative;
}

.attachments-list {
  display: flex;
  gap: 8px;
}

.attachments-list.scrollX {
  overflow-x: auto;
  overflow-y: hidden;
  flex-wrap: nowrap;
}

.attachments-list.scrollY {
  overflow-y: auto;
  overflow-x: hidden;
  flex-direction: column;
}

.attachments-list.wrap {
  flex-wrap: wrap;
}

.attachment-item {
  flex-shrink: 0;
}

.attachment-card {
  position: relative;
  border-radius: 4px;
  overflow: hidden;
  background: var(--vxe-ui-layout-background-color);
  transition: all 0.3s;
}

.attachment-card:hover {
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.attachment-preview {
  overflow: hidden;

  &.image-preview {
    height: 200px;
  }
}

.attachment-preview img {
  width: auto;
  height: 200px;
  object-fit: cover;
}

.attachment-icon {
  width: 100%;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  color: #909399;
}

.attachment-info {
  padding: 4px 8px;
  font-size: 12px;
}

.attachment-name {
  color: #303133;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.attachment-size {
  color: #909399;
  margin-top: 2px;
}

.attachment-delete {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.5);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.3s;
}

.attachment-card:hover .attachment-delete {
  opacity: 1;
}

.attachment-upload {
  width: 120px;
  height: 120px;
  border: 1px dashed #d9d9d9;
  border-radius: 4px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s;
}

.attachment-upload:hover {
  border-color: #409eff;
  color: #409eff;
}

.attachment-upload i {
  font-size: 24px;
  margin-bottom: 4px;
}

.hidden {
  display: none;
}

.attachment-progress {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 4px;
  background: rgba(0, 0, 0, 0.5);
  color: #fff;
  font-size: 12px;
}

.progress-bar {
  height: 2px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 1px;
  overflow: hidden;
  margin-bottom: 2px;
}

.progress-inner {
  height: 100%;
  background: #409eff;
  transition: width 0.3s;
}

.progress-text {
  display: block;
  text-align: center;
}

.upload-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}

.video-play-icon {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 32px;
  height: 32px;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
}

.image-placeholder {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--vxe-ui-modal-header-background-color);
  color: var(--vxe-ui-font-color-secondary);

  i {
    font-size: 24px;
  }
}

.file-preview {
  width: 240px;
  height: 66px;
  padding: 4px;
  background: var(--vxe-ui-layout-background-color);
  border-radius: 4px;
  overflow: hidden;
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
  font-size: 14px;
  color: var(--vxe-ui-font-color);
}

.preview-extension {
  flex-shrink: 0;
  white-space: nowrap;
  font-size: 14px;
  color: var(--vxe-ui-font-color);
}

.preview-second-line {
  margin-top: 4px;
  font-size: 12px;
  color: #909399;
}
</style>
