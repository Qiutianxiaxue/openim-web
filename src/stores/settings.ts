import { defineStore } from 'pinia'
import { ref } from 'vue'
import i18n from '../plugins/i18n'

type Language = 'zh-CN' | 'en-US'

export const useSettingsStore = defineStore(
  'settings',
  () => {
    const language = ref<Language>((localStorage.getItem('language') as Language) || 'zh-CN')

    function setLanguage(lang: Language) {
      language.value = lang
      i18n.global.locale.value = lang
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
