<script setup lang="ts">
import type { ChatItem } from '@/types/message'
import { ref, computed } from 'vue'
import { VxeUI, type VxePulldownEvents, type VxePulldownPropTypes } from 'vxe-pc-ui'
import { useMessageStore } from '@/stores/message'
import { storeToRefs } from 'pinia'
import { formatChatTime } from '@/utils/time'
import ContextMenu from '@imengyu/vue3-context-menu'

const messageStore = useMessageStore()
const { RecentMessageList, CurrentMessageBoxKey } = storeToRefs(messageStore)

// 搜索关键词
const searchKeyword = ref<string>('')

// 工具下拉菜单显示状态
const showToolsPull = ref(false)
const pullOptions = ref<VxePulldownPropTypes.Options>([
  { label: '添加好友', value: 'addFriend' },
  { label: '添加群聊', value: 'addGroup' },
  { label: '创建聊天', value: 'createChat' },
  { label: '创建群聊', value: 'createGroup' },
])

const optionClickEvent: VxePulldownEvents.OptionClick = ({ option }) => {
  switch (option.value) {
    case 'addFriend':
      addFriend()
      break
    case 'addGroup':
      addGroup()
      break
    case 'createChat':
      createChat()
      break
    case 'createGroup':
      createGroup()
      break
  }
}

// 处理工具下拉菜单显示状态变化
const handleClickShowToolsPull = () => {
  showToolsPull.value = !showToolsPull.value
}

// 过滤后的聊天列表
const filteredChatList = computed(() => {
  let filteredList: ChatItem[] = []
  if (!searchKeyword.value) {
    filteredList = RecentMessageList.value
  } else {
    const keyword = searchKeyword.value.toLowerCase()
    filteredList = RecentMessageList.value.filter((chat) =>
      chat.chats_name.toLowerCase().includes(keyword),
    )
  }

  return filteredList.sort((a, b) => {
    // 优先显示置顶聊天
    if (a.is_top && !b.is_top) return -1
    if (!a.is_top && b.is_top) return 1
    // 按最后发送时间排序
    return new Date(b.last_send_time).getTime() - new Date(a.last_send_time).getTime()
  })
})

// 处理新建聊天
const addFriend = () => {
  // TODO: 实现新建聊天功能
  console.log('新建聊天')
}
const addGroup = () => {}
const createChat = () => {}
const createGroup = () => {}

// 处理聊天选择
const handleChatSelect = (chat: ChatItem) => {
  CurrentMessageBoxKey.value = chat.chats_key
  // TODO: 触发聊天选择事件
  messageStore.markMessagesAsRead(chat.chats_key)
}
const handleChatContextClick = (e: MouseEvent, chat: ChatItem) => {
  //prevent the browser's default menu
  e.preventDefault()
  //show your menu
  const contextmenu = {
    x: e.x,
    y: e.y,
    theme: 'flat',
    items: [
      {
        label: '删除',
        preserveIconWidth: false,
        onClick: () => {
          VxeUI.modal
            .confirm({
              title: '删除聊天',
              content: `确定删除与 ${chat.chats_name} 的聊天记录吗？`,
              draggable: false,
            })
            .then((res) => {
              // 删除聊天记录
              if (res === 'confirm') {
                messageStore.deleteChats(chat.chats_key)
              }
            })
        },
      },
      {
        label: chat.is_top ? '取消置顶' : '设为置顶',
        preserveIconWidth: false,
        divided: true,
        onClick: () => {
          messageStore.setChatsTop(chat.chats_key, !chat.is_top)
        },
      },
      {
        label: chat.is_mute ? '取消免打扰' : '设为免打扰',
        preserveIconWidth: false,
        divided: true,
        onClick: () => {
          messageStore.setChatsMute(chat.chats_key, !chat.is_mute)
        },
      },
      {
        label: '全部已读',
        preserveIconWidth: false,
        onClick: () => {
          messageStore.markMessagesAsRead(chat.chats_key)
        },
      },
    ],
  }

  //这个函数与 this.$contextmenu 一致
  ContextMenu.showContextMenu(contextmenu)
}
</script>

<template>
  <vxe-layout-container vertical class="recent-message-list">
    <vxe-layout-header>
      <div class="search-area">
        <vxe-layout-container>
          <vxe-layout-body>
            <vxe-input
              v-model="searchKeyword"
              placeholder="搜索"
              type="search"
              clearable
            ></vxe-input>
          </vxe-layout-body>
          <vxe-layout-aside :width="45" class="centered-aside">
            <vxe-pulldown
              transfer
              :options="pullOptions"
              trigger="click"
              @option-click="optionClickEvent"
            >
              <template #default>
                <vxe-button icon="vxe-icon-add" @click="handleClickShowToolsPull"></vxe-button>
              </template>
            </vxe-pulldown>
          </vxe-layout-aside>
        </vxe-layout-container>
      </div>
    </vxe-layout-header>

    <vxe-layout-body>
      <vxe-list
        height="100%"
        :data="filteredChatList"
        :virtual-y-config="{ enabled: true }"
        auto-resize
      >
        <template #default="{ items }">
          <div
            class="chat-item"
            v-for="item in items"
            :key="item.chats_key"
            @click="handleChatSelect(item)"
            @contextmenu.prevent="handleChatContextClick($event, item)"
            :class="{ active: CurrentMessageBoxKey === item.chats_key, top: item.is_top }"
          >
            <vxe-avatar
              :src="item.chats_icon"
              :width="48"
              :height="48"
              v-if="item.is_mute"
              :dot="item.unread_count > 0"
            ></vxe-avatar>
            <vxe-avatar
              :src="item.chats_icon"
              :width="48"
              :height="48"
              v-else
              :count="item.unread_count"
            ></vxe-avatar>
            <div class="chat-info">
              <div class="chat-header">
                <span class="chat-name">{{ item.chats_name }}</span>
                <span class="chat-time">{{ formatChatTime(item.last_send_time) }}</span>
              </div>
              <div class="chat-message">{{ item.last_message_content }}</div>
            </div>
          </div>
        </template>
      </vxe-list>
    </vxe-layout-body>
  </vxe-layout-container>
</template>

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
  &.top {
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
    overflow: hidden;
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
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        width: 120px;
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
