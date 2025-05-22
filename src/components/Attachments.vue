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

// 判断是否为图片
const isImage = (item: AttachmentItem) => {
  return item.fileType === 'image' ||
    (item.url && /\.(jpg|jpeg|png|gif|webp)$/i.test(item.url)) ||
    (item.thumbUrl && /\.(jpg|jpeg|png|gif|webp)$/i.test(item.thumbUrl))
}

// 获取文件图标
const getFileIcon = (type?: FileType) => {
  const iconMap: Record<FileType, string> = {
    word: 'el-icon-document',
    excel: 'el-icon-document',
    ppt: 'el-icon-document',
    pdf: 'el-icon-document',
    txt: 'el-icon-document',
    image: 'el-icon-picture',
    audio: 'el-icon-headset',
    video: 'el-icon-video-camera',
    zip: 'el-icon-folder',
    file: 'el-icon-document'
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
</script>

<template>
  <div class="attachments" @dragover.prevent="handleDragOver" @dragleave.prevent="handleDragLeave"
    @drop.prevent="handleDrop" :class="{ 'is-dragover': isDragover }">
    <div class="attachments-list" :class="props.overflow">
      <div v-for="(item, index) in props.items" :key="item.uid" class="attachment-item">
        <div class="attachment-card">
          <!-- 图片预览 -->
          <div v-if="isImage(item)" class="attachment-preview" @click="previewImage(item)">
            <img :src="item.url || item.thumbUrl" :alt="item.name" />
          </div>
          <!-- 文件图标 -->
          <div v-else class="attachment-icon">
            <i :class="getFileIcon(item.fileType)"></i>
          </div>
          <!-- 文件信息 -->
          <div class="attachment-info">
            <div class="attachment-name" :title="item.name">{{ item.name }}</div>
            <div class="attachment-size">{{ formatFileSize(item.fileSize) }}</div>
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


<style scoped>
.attachments {
  width: 100%;
  position: relative;
}

.attachments.is-dragover::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(64, 158, 255, 0.1);
  border: 2px dashed #409eff;
  border-radius: 4px;
  z-index: 1;
}

.attachments-list {
  display: flex;
  gap: 8px;
  padding: 8px;
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
  width: 120px;
  height: 120px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  overflow: hidden;
  background: #fff;
  transition: all 0.3s;
}

.attachment-card:hover {
  border-color: #409eff;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.attachment-preview {
  width: 100%;
  height: 80px;
  overflow: hidden;
}

.attachment-preview img {
  width: 100%;
  height: 100%;
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
</style>
