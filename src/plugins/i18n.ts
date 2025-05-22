import { createI18n } from 'vue-i18n'

type Locale = 'zh-CN' | 'en-US'
type Messages = Record<Locale, Record<string, Record<string, string>>>

// 动态导入所有语言文件
const messages: Messages = {
  'zh-CN': {},
  'en-US': {},
}

// 导入所有语言文件
const modules = import.meta.glob('../locales/*/*.json', { eager: true })

// 处理导入的模块
Object.entries(modules).forEach(([path, module]) => {
  const locale = path.split('/')[2] as Locale // 获取语言代码 (zh-CN 或 en-US)
  const namespace = path.split('/')[3].replace('.json', '') // 获取命名空间
  messages[locale][namespace] = (module as { default: Record<string, string> }).default
})

const i18n = createI18n({
  legacy: false, // 使用 Composition API 模式
  locale: localStorage.getItem('language') || 'zh-CN', // 默认语言
  fallbackLocale: 'en-US', // 备用语言
  messages,
})

export default i18n
