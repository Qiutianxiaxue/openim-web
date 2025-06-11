import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

interface UserState {
  user_id: string
  username: string
  nickname: string
  avatar: string
}

export const useUserStore = defineStore(
  'user',
  () => {
    const user_id = ref('')
    const nickname = ref('')
    const username = ref('')
    const avatar = ref('')

    const isLoggedIn = computed(() => !!user_id.value)
    const userInfo = computed(() => ({
      user_id: user_id.value,
      nickname: nickname.value,
      username: username.value,
      avatar: avatar.value,
    }))

    function setUserInfo(userInfo: Partial<UserState>) {
      user_id.value = userInfo.user_id || ''
      nickname.value = userInfo.nickname || ''
      username.value = userInfo.username || ''
      avatar.value = userInfo.avatar || ''
    }

    function clearUserInfo() {
      user_id.value = ''
      nickname.value = ''
      username.value = ''
      avatar.value = ''
    }

    async function logout() {
      clearUserInfo()
    }

    return {
      user_id,
      nickname,
      username,
      avatar,
      isLoggedIn,
      userInfo,
      setUserInfo,
      clearUserInfo,
      logout,
    }
  },
  {
    persist: true,
  },
)
