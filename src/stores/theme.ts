import { defineStore } from 'pinia'
import { ref } from 'vue'
import VxeUI from 'vxe-pc-ui'

type Theme = 'light' | 'dark'

export const useThemeStore = defineStore(
  'theme',
  () => {
    const theme = ref<Theme>('light')

    function setTheme(newTheme: Theme) {
      theme.value = newTheme
      VxeUI.setTheme(newTheme)
      document.documentElement.className = newTheme
    }

    function toggleTheme() {
      setTheme(theme.value === 'light' ? 'dark' : 'light')
    }

    return {
      theme,
      setTheme,
      toggleTheme,
    }
  },
  {
    persist: true,
  },
)
