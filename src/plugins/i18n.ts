import { createI18n } from 'vue-i18n'
import zhCN from '../locales/zh-CN'
import enUS from '../locales/en-US'

const i18n = createI18n({
  legacy: false, // 使用 Composition API 模式
  locale: localStorage.getItem('language') || 'zh-CN', // 默认语言
  fallbackLocale: 'en-US', // 备用语言
  messages: {
    'zh-CN': zhCN,
    'en-US': enUS,
  },
})

export default i18n
