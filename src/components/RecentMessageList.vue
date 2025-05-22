<template>
  <vxe-layout-container vertical class="recent-message-list">
    <vxe-layout-header>
      <div class="search-area">
        <vxe-layout-container>
          <vxe-layout-body>
            <vxe-input v-model="searchKeyword" placeholder="搜索" type="search" clearable></vxe-input>
          </vxe-layout-body>
          <vxe-layout-aside :width="40" class="centered-aside">
            <vxe-button circle icon="vxe-icon-add" @click="handleNewChat"></vxe-button>
          </vxe-layout-aside>
        </vxe-layout-container>
      </div>
    </vxe-layout-header>

    <vxe-layout-body>
      <vxe-list height="100%" :data="filteredChatList" :virtual-y-config="{ enabled: true }" auto-resize>
        <template #default="{ items }">
          <div class="chat-item" v-for="item in items" :key="item.id" @click="handleChatSelect(item)"
            :class="{ active: selectedChatId === item.id }">
            <img :src="item.avatar" alt="Avatar" class="chat-avatar" />
            <div class="chat-info">
              <div class="chat-header">
                <span class="chat-name">{{ item.name }}</span>
                <span class="chat-time">{{ item.time }}</span>
              </div>
              <div class="chat-message">{{ item.lastMessage }}</div>
            </div>
          </div>
        </template>
      </vxe-list>
    </vxe-layout-body>
  </vxe-layout-container>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

// 定义聊天项类型
interface ChatItem {
  id: number
  name: string
  avatar: string
  lastMessage: string
  time: string
}

// 搜索关键词
const searchKeyword = ref('')

// 选中的聊天ID
const selectedChatId = ref<number | null>(null)

// 模拟数据
const chatList = ref<ChatItem[]>([])

// 生成模拟聊天列表数据
const generateDummyChatList = (count: number): ChatItem[] => {
  const list: ChatItem[] = []
  for (let i = 1; i <= count; i++) {
    list.push({
      id: i,
      name: `用户 ${i}`,
      avatar: `https://vxeui.com/logo.png`,
      lastMessage: `这是用户 ${i} 的最后一条消息。`,
      time: `今天 ${Math.floor(Math.random() * 24).toString().padStart(2, '0')}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}`,
    })
  }
  return list
}

// 初始化聊天列表数据
chatList.value = generateDummyChatList(2000)

// 过滤后的聊天列表
const filteredChatList = computed(() => {
  if (!searchKeyword.value) return chatList.value
  const keyword = searchKeyword.value.toLowerCase()
  return chatList.value.filter(chat =>
    chat.name.toLowerCase().includes(keyword) ||
    chat.lastMessage.toLowerCase().includes(keyword)
  )
})

// 处理新建聊天
const handleNewChat = () => {
  // TODO: 实现新建聊天功能
  console.log('新建聊天')
}

// 处理聊天选择
const handleChatSelect = (chat: ChatItem) => {
  selectedChatId.value = chat.id
  // TODO: 触发聊天选择事件
  console.log('选择聊天:', chat)
}
</script>

<style lang="scss">
.recent-message-list {
  background-color: var(--vxe-ui-modal-header-background-color) !important;
  border-right: 1px solid var(--vxe-ui-input-border-color);

  .vxe-list--virtual-wrapper {
    overflow: overlay !important;

    /* 自定义滚动条样式 */
    /* 隐藏默认滚动条，但保留宽度 */
    &::-webkit-scrollbar {
      width: 8px;
      /* 垂直滚动条宽度 */
      height: 8px;
      /* 水平滚动条高度 */
      background-color: transparent;
    }

    /* 滚动条滑块 */
    &::-webkit-scrollbar-thumb {
      background-color: var(--vxe-ui-font-tinge-color);
      /* 滑块颜色 */
      border-radius: 6px;
      /* 滑块圆角 */
      visibility: visible;
      /* 限制背景仅应用于内容区域 */
      background-clip: content-box;
    }

    /* 滚动条轨道 */
    &::-webkit-scrollbar-track {
      background-color: transparent;
      /* 轨道颜色 */
    }
  }

  .vxe-layout-body--inner,
  .vxe-layout-container {
    overflow: hidden;
  }

}

.search-area {
  height: 56px;
  padding: 10px;
  overflow: hidden;
  background-color: var(--vxe-ui-modal-header-background-color);
  border-bottom: 1px solid var(--vxe-ui-input-border-color);

  .vxe-layout-container {
    background-color: var(--vxe-ui-modal-header-background-color) !important;
  }
}


.chat-item {
  display: flex;
  padding: 12px 16px;
  height: 72px;
  gap: 12px;
  cursor: pointer;
  transition: background-color 0.3s;

  &:hover {
    background-color: var(--vxe-ui-base-hover-background-color);
  }

  &.active {
    background-color: var(--vxe-ui-base-active-background-color);
  }

  .chat-avatar {
    width: 48px;
    height: 48px;
    border-radius: 8px;
    object-fit: cover;
  }

  .chat-info {
    flex: 1;
    min-width: 0;

    .chat-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 4px;

      .chat-name {
        font-weight: 500;
        color: var(--vxe-ui-font-color);
      }

      .chat-time {
        font-size: 12px;
        color: var(--vxe-ui-font-lighten-color);
      }
    }

    .chat-message {
      font-size: 13px;
      color: var(--vxe-ui-font-lighten-color);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }
}


.centered-aside {
  display: flex;
  align-items: center;
  justify-content: center;

  .vxe-button {
    align-items: center;
    height: 100%;
    justify-content: center;
  }
}
</style>
