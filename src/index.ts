import type { App } from 'vue'
import ChatWindow from './components/ChatWindow.vue'
import './assets/main.scss'
import 'uno.css'
import VxeUI from 'vxe-pc-ui'
import 'vxe-pc-ui/lib/style.css'
import VxeZhCN from 'vxe-pc-ui/lib/language/zh-CN' // 中文(简体)
import VxeEnUS from 'vxe-pc-ui/lib/language/en-US' // 英文(美国)
import inputListener from './directives/inputListener'
import i18n from './plugins/i18n'
import { useThemeStore } from './stores/theme'

export { ChatWindow, inputListener, useThemeStore }

export const setupVXE = (app: App) => {
  // 初始化 VXE-UI 多语言
  VxeUI.setI18n('zh-CN', VxeZhCN)
  VxeUI.setI18n('en-US', VxeEnUS)

  // 注册 VXE-UI
  app.use(VxeUI)
}

export const setupDependencies = (app: App) => {
  app.use(i18n)

  // 初始化主题
  const themeStore = useThemeStore()
  document.documentElement.className = themeStore.theme
  VxeUI.setTheme(themeStore.theme)
}

export default {
  install: (app: App) => {
    app.component('ChatWindow', ChatWindow)
    app.directive('input-listener', inputListener) // 注册全局指令
    setupVXE(app)
    setupDependencies(app)
  },
}
