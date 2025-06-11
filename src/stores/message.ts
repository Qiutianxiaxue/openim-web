import { ref, type Ref } from 'vue'
import { defineStore } from 'pinia'
import type { ChatItem, ChatsMessage } from '@/types/message'
import { wsService } from '@/services/websocket'
import { deepClone } from '@/utils/deepClone'
export const useMessageStore = defineStore(
  'message',
  () => {
    const RecentMessageList: Ref<ChatItem[]> = ref([]) // 最近消息列表
    // 当前消息对话框
    const CurrentMessageBoxKey: Ref<string> = ref('') // 当前消息窗口ID
    const CurrentMessageBoxInfo: Ref<ChatItem> = ref({} as ChatItem) // 当前消息窗口信息
    const CurrentMessageBoxIsAtBottom: Ref<boolean> = ref(true) // 当前消息窗口是否在最底部
    const CurrentMessageBoxList: Ref<ChatsMessage[]> = ref([]) // 当前消息窗口的消息列表数据

    function refreshRecentMessageList(MessageList: ChatItem[]) {
      RecentMessageList.value = MessageList // 刷新最近消息列表
      if (MessageList.length > 0 && CurrentMessageBoxKey.value === '') {
        setCurrentMessageBox(MessageList[0]) // 如果当前对话框ID为空，则设置为最新消息的对话框
      } else {
        CurrentMessageBoxKey.value = '' // 如果没有消息，则清空当前对话框ID
        CurrentMessageBoxInfo.value = {} as ChatItem // 清空当前对话框信息
        CurrentMessageBoxList.value = [] // 清空当前对话框消息列表
      }
    } // 刷新最新消息列表，并计算是否需要设置图标闪烁，角标信息等，如果模拟切换到当前对话框的方法，方便设置为已读
    function updateRecentMessageList(chatItem: ChatItem) {
      // 更新消息列表的一样数据，如果不存在该会话则会自动创建一个新的会话
      if (!chatItem) return // 如果没有消息，则返回
      // 深度拷贝
      const RecentMessageListData = deepClone(RecentMessageList.value) // 深度拷贝，避免引用类型数据被修改
      const index = RecentMessageListData.findIndex(
        (item: ChatItem) => item.chats_key === chatItem.chats_key,
      ) // 查找当前消息对话框在最近消息列表中的位置
      if (index === -1) {
        // 如果不存在，则添加到最近消息列表
        RecentMessageListData.unshift(chatItem) // 添加到最近消息列表
      } else {
        console.log('updateRecentMessageList', chatItem, index)
        // 如果存在，则更新最近消息列表
        RecentMessageListData.splice(index, 1, chatItem)
      }
      RecentMessageList.value = RecentMessageListData // 更新最近消息列表
    }
    function updateRecentMessageSetMute(isMute: boolean, chats_key: string) {
      // 更新消息列表的一样数据，如果不存在该会话则会自动创建一个新的会话
      const RecentMessageListData = deepClone(RecentMessageList.value) // 深度拷贝，避免引用类型数据被修改
      const chatItem = RecentMessageListData.find((item) => item.chats_key === chats_key) // 查找当前消息对话框在最近消息列表中的位置
      if (chatItem) {
        chatItem.is_mute = isMute // 更新免打扰状态
      }
      RecentMessageList.value = RecentMessageListData // 更新最近消息列表
    }
    function updateRecentMessageSetTop(isTop: boolean, chats_key: string) {
      // 更新消息列表的一样数据，如果不存在该会话则会自动创建一个新的会话
      const RecentMessageListData = deepClone(RecentMessageList.value) // 深度拷贝，避免引用类型数据被修改
      const chatItem = RecentMessageListData.find((item) => item.chats_key === chats_key) // 查找当前消息对话框在最近消息列表中的位置
      if (chatItem) {
        chatItem.is_top = isTop // 更新置顶状态
      }
      RecentMessageList.value = RecentMessageListData // 更新最近消息列表
    }
    function setCurrentMessageBox(chatItem?: ChatItem) {
      if (!chatItem) {
        // 切换当前对话框，并设置当前对话框全部消息已读
        CurrentMessageBoxKey.value = '' // 如果没有消息，则清空当前对话框ID
        CurrentMessageBoxInfo.value = {} as ChatItem // 清空当前对话框信息
        CurrentMessageBoxList.value = [] // 清空当前对话框消息列表
        return
      }
      // 切换当前对话框，并设置当前对话框全部消息已读
      CurrentMessageBoxKey.value = chatItem.chats_key // 设置当前对话框ID
      CurrentMessageBoxInfo.value = chatItem // 设置当前对话框信息
      CurrentMessageBoxList.value = [] // 清空当前对话框消息列表
      getCurrentMessageBoxList() // 加载当前对话框的消息列表
      //@todo 这里可以添加逻辑来将当前对话框的所有消息标记为已读
    }
    function deleteRecentMessage(chats_key: string) {
      // 删除最近消息列表中的一条消息
      const RecentMessageListData = deepClone(RecentMessageList.value) // 深度拷贝，避免引用类型数据被修改
      const index = RecentMessageListData.findIndex((item) => item.chats_key === chats_key) // 查找当前消息对话框在最近消息列表中的位置
      if (index !== -1) {
        // 如果存在，则更新最近消息列表
        RecentMessageListData.splice(index, 1) // 删除最近消息列表
        if (CurrentMessageBoxKey.value === chats_key) {
          // 如果当前对话框ID与删除的对话框ID相同，则清空当前对话框
          CurrentMessageBoxKey.value = '' // 清空当前对话框ID
          CurrentMessageBoxInfo.value = {} as ChatItem // 清空当前对话框信息
          CurrentMessageBoxList.value = [] // 清空当前对话框消息列表
        }
      }
      RecentMessageList.value = RecentMessageListData // 更新最近消息列表
    }
    function getCurrentMessageBoxList() {
      console.log('getCurrentMessageBoxList')
      wsService.sendService('ChatsMessage/getMessagesPaginated', {
        chatsKey: CurrentMessageBoxKey.value,
      })
    } // 切换对话框时加载最后40条消息
    function pushCurrentMessageBoxList(message: ChatsMessage) {
      CurrentMessageBoxList.value.push(message) // 往当前对话框消息列表追加消息，有新消息一般常用
    } // 往当前对话框消息列表追加消息，有新消息一般常用
    function unshiftCurrentMessageBoxList() {} // 往当前对话框消息列表前面追加消息，一般是往前滚动的时候使用

    function getChatsList() {
      // 获取对话框列表
      wsService.sendService('Chats/getChatsList', {})
    }
    function setChatsTop(chatsKey: string, isTop: boolean) {
      // 设置对话框置顶
      wsService.sendService('Chats/setChatsTop', { chatsKey, isTop })
    }
    function setChatsMute(chatsKey: string, isMute: boolean) {
      // 设置对话框免打扰
      wsService.sendService('Chats/setChatsMute', { chatsKey, isMute })
    }
    function deleteChats(chatsKey: string) {
      // 删除对话框
      wsService.sendService('Chats/deleteChats', { chatsKey })
    }
    function markMessagesAsRead(chatsKey: string, messageIds: string[] = []) {
      // 标记对话框的所有消息为已读
      wsService.sendService('ChatsMessage/markMessagesAsRead', { chatsKey, messageIds })
    }

    wsService.open(() => {
      wsService.sendService('Chats/getChatsList', {})
    })
    // 监听消息
    wsService.onMessage((data) => {
      if (!data || !data.service) return // 确保数据和服务存在
      // 更新消息列表
      if (data.service === 'Chats/getChatsList') {
        if (data.payload && Array.isArray((data.payload.data as { chats: ChatItem[] }).chats)) {
          refreshRecentMessageList((data.payload.data as { chats: ChatItem[] }).chats) // 刷新最近消息列表
        } else {
          refreshRecentMessageList([]) // 如果没有有效的chats数据，传递空数组
        }
      }
      if (data.service === 'Chats/createOrGetChats') {
        const payloadData = data.payload?.data as { value?: unknown } | undefined
        if (payloadData && payloadData.value) {
          const chatItem = payloadData.value as ChatItem
          updateRecentMessageList(chatItem) // 更新消息列表
          if (CurrentMessageBoxKey.value === '') {
            setCurrentMessageBox(chatItem) // 设置当前对话框
          }
        }
      }
      if (data.service === 'ChatsMessage/markMessagesAsRead') {
        const payloadData = data.payload?.data as { value?: unknown } | undefined
        if (payloadData && payloadData.value) {
          const chatItem = payloadData.value as ChatItem

          updateRecentMessageList(chatItem) // 更新消息列表
          if (CurrentMessageBoxKey.value === '') {
            setCurrentMessageBox(chatItem) // 设置当前对话框
          }
        }
      }
      if (data.service === 'MessageSending/sendRealTimeMessage') {
        const payloadData = data.payload?.data as { chats?: unknown; message?: unknown } | undefined
        if (payloadData && payloadData.chats) {
          const chatItem = payloadData.chats as ChatItem
          console.log('sendRealTimeMessage', chatItem)

          updateRecentMessageList(chatItem) // 更新消息列表
          if (CurrentMessageBoxKey.value === '') {
            setCurrentMessageBox(chatItem) // 设置当前对话框
          } else if (CurrentMessageBoxKey.value === chatItem.chats_key) {
            if (payloadData.message) {
              pushCurrentMessageBoxList(payloadData.message as ChatsMessage) // 往当前对话框消息列表追加消息，有新消息一般常用
            }
            const isWindowFocused = () => document.hasFocus() // 判断窗口是否处于聚焦状态
            if (isWindowFocused() && CurrentMessageBoxIsAtBottom.value) {
              // 如果窗口处于聚焦状态且当前对话框在最底部，则标记当前对话框的所有消息为已读
              markMessagesAsRead(chatItem.chats_key) // 标记消息为已读
            }
          }
        }
      }
      if (data.service === 'ChatsMessage/getMessagesPaginated') {
        const payloadData = data.payload?.data as { messages?: unknown } | undefined
        if (payloadData && payloadData.messages) {
          const chatItem = payloadData.messages as ChatsMessage[]
          CurrentMessageBoxList.value = chatItem // 更新当前对话框消息列表
        }
      }
      if (data.service === 'Chats/setChatsTop') {
        const payloadData = data.payload?.data as { value: boolean; chatsKey: string } | undefined
        if (payloadData && payloadData.chatsKey) {
          updateRecentMessageSetTop(payloadData.value, payloadData.chatsKey) // 更新消息列表置顶状态
        }
      }
      if (data.service === 'Chats/setChatsMute') {
        const payloadData = data.payload?.data as { value: boolean; chatsKey: string } | undefined
        if (payloadData && payloadData.chatsKey) {
          updateRecentMessageSetMute(payloadData.value, payloadData.chatsKey) // 更新消息列表免打扰状态
        }
      }
      if (data.service === 'Chats/deleteChats') {
        const payloadData = data.payload?.data as { chatsKey: string } | undefined
        if (payloadData && payloadData.chatsKey) {
          deleteRecentMessage(payloadData.chatsKey) // 删除对话框
        }
      }
    })
    window.addEventListener('focus', () => {
      if (CurrentMessageBoxKey.value !== '') {
        // 如果当前对话框ID不为空，则标记当前对话框的所有消息为已读
        markMessagesAsRead(CurrentMessageBoxKey.value) // 标记消息为已读
        RecentMessageList.value = deepClone(RecentMessageList.value) // 深拷贝一次最近消息列表，让前端重新渲染
      }
    })
    setInterval(
      () => {
        RecentMessageList.value = deepClone(RecentMessageList.value) // 每分钟深拷贝一次最近消息列表，让前端重新渲染
      },
      1000 * 60 * 10,
    )

    return {
      RecentMessageList,
      CurrentMessageBoxKey,
      CurrentMessageBoxInfo,
      CurrentMessageBoxList,
      refreshRecentMessageList,
      updateRecentMessageList,
      setCurrentMessageBox,
      getCurrentMessageBoxList,
      pushCurrentMessageBoxList,
      unshiftCurrentMessageBoxList,

      getChatsList,
      setChatsTop,
      setChatsMute,
      deleteChats,
      markMessagesAsRead,
    }
  },
  {
    persist: {
      // 持久化
      pick: ['RecentMessageList'],
    },
  },
)
