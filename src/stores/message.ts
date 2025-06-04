import { ref, type Ref } from 'vue'
import { defineStore } from 'pinia'
import type { ChatItem, ChatsMessage } from '@/types/message'

export const useMessageStore = defineStore('message', () => {
  const RecentMessageList: Ref<ChatItem[]> = ref([]) // 最近消息列表
  // 当前消息对话框
  const CurrentMessageBoxId: Ref<string> = ref('') // 当前消息窗口ID
  const CurrentMessageBoxInfo: Ref<ChatItem> = ref({} as ChatItem) // 当前消息窗口信息
  const CurrentMessageBoxList: Ref<ChatsMessage[]> = ref([]) // 当前消息窗口的消息列表数据

  function refreshRecentMessageList(MessageList: ChatItem[]) {
    RecentMessageList.value = MessageList // 刷新最近消息列表
    if (MessageList.length > 0 && CurrentMessageBoxId.value === '') {
      setCurrentMessageBox(MessageList[0]) // 如果当前对话框ID为空，则设置为最新消息的对话框
    } else {
      CurrentMessageBoxId.value = '' // 如果没有消息，则清空当前对话框ID
      CurrentMessageBoxInfo.value = {} as ChatItem // 清空当前对话框信息
      CurrentMessageBoxList.value = [] // 清空当前对话框消息列表
    }
  } // 刷新最新消息列表，并计算是否需要设置图标闪烁，角标信息等，如果模拟切换到当前对话框的方法，方便设置为已读
  function updateRecentMessageList() {} // 更新消息列表的一样数据，如果不存在该会话则会自动创建一个新的会话
  function setCurrentMessageBox(chatItem?: ChatItem) {
    if (!chatItem) {
      // 切换当前对话框，并设置当前对话框全部消息已读
      CurrentMessageBoxId.value = '' // 如果没有消息，则清空当前对话框ID
      CurrentMessageBoxInfo.value = {} as ChatItem // 清空当前对话框信息
      CurrentMessageBoxList.value = [] // 清空当前对话框消息列表
      return
    }
    // 切换当前对话框，并设置当前对话框全部消息已读
    CurrentMessageBoxId.value = chatItem.chats_id // 设置当前对话框ID
    CurrentMessageBoxInfo.value = chatItem // 设置当前对话框信息
    CurrentMessageBoxList.value = [] // 清空当前对话框消息列表
    getCurrentMessageBoxList() // 加载当前对话框的消息列表
    //@todo 这里可以添加逻辑来将当前对话框的所有消息标记为已读
  }
  function getCurrentMessageBoxList() {} // 切换对话框时加载最后40条消息
  function pushCurrentMessageBoxList() {} // 往当前对话框消息列表追加消息，有新消息一般常用
  function unshiftCurrentMessageBoxList() {} // 往当前对话框消息列表前面追加消息，一般是往前滚动的时候使用

  return {
    RecentMessageList,
    CurrentMessageBoxId,
    CurrentMessageBoxInfo,
    CurrentMessageBoxList,
    refreshRecentMessageList,
    updateRecentMessageList,
    setCurrentMessageBox,
    getCurrentMessageBoxList,
    pushCurrentMessageBoxList,
    unshiftCurrentMessageBoxList,
  }
})
