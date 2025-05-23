import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useMessageStore = defineStore('message', () => {
  const RecentMessageList = ref([]) // 最近消息列表
  // 当前消息对话框
  const CurrentMessageBoxId = ref('') // 当前消息窗口ID
  const CurrentMessageBoxInfo = ref({}) // 当前消息窗口信息
  const CurrentMessageBoxList = ref([]) // 当前消息窗口的消息列表数据

  function refreshRecentMessageList() {} // 刷新最新消息列表，并计算是否需要设置图标闪烁，角标信息等，如果模拟切换到当前对话框的方法，方便设置为已读
  function updateRecentMessageList() {} // 更新消息列表的一样数据，如果不存在该会话则会自动创建一个新的会话
  function setCurrentMessageBox() {} // 切换当前对话框，并设置当前对话框全部消息已读
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
