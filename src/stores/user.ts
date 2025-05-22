import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

interface UserState {
  id: string
  name: string
  avatar: string
  token: string
}

export const useUserStore = defineStore(
  'user',
  () => {
    const id = ref('')
    const name = ref('')
    const avatar = ref('')
    const token = ref('')

    const isLoggedIn = computed(() => !!token.value)
    const userInfo = computed(() => ({
      id: id.value,
      name: name.value,
      avatar: avatar.value,
    }))

    function setUserInfo(userInfo: Partial<UserState>) {
      if (userInfo.id) id.value = userInfo.id
      if (userInfo.name) name.value = userInfo.name
      if (userInfo.avatar) avatar.value = userInfo.avatar
      if (userInfo.token) token.value = userInfo.token
    }

    function clearUserInfo() {
      id.value = ''
      name.value = ''
      avatar.value = ''
      token.value = ''
    }

    async function login(username: string, _password: string) {
      // 这里添加实际的登录逻辑
      const userInfo = {
        id: '1',
        name: username,
        avatar: 'https://example.com/avatar.jpg',
        token: 'sample-token',
      }
      setUserInfo(userInfo)
      return userInfo
    }

    async function logout() {
      clearUserInfo()
    }

    return {
      id,
      name,
      avatar,
      token,
      isLoggedIn,
      userInfo,
      setUserInfo,
      clearUserInfo,
      login,
      logout,
    }
  },
  {
    persist: true,
  },
)
