import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Language } from '@/types/language'

export const useSettingsStore = defineStore(
  'settings',
  () => {
    const language = ref<Language>((localStorage.getItem('language') as Language) || 'zh-CN')

    function setLanguage(lang: Language) {
      language.value = lang
      localStorage.setItem('language', lang)
    }

    return {
      language,
      setLanguage,
    }
  },
  {
    persist: true,
  },
)
