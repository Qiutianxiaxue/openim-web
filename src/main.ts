import './assets/main.scss'
import 'uno.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import i18n from './plugins/i18n'
import './plugins/dayjs'
import inputListener from './directives/inputListener'

import App from './App.vue'
import router from './router'
import VxeUI from 'vxe-pc-ui'
import 'vxe-pc-ui/lib/style.css'
import VxeZhCN from 'vxe-pc-ui/lib/language/zh-CN' // 中文(简体)
import VxeEnUS from 'vxe-pc-ui/lib/language/en-US' // 英文(美国)
import { useThemeStore } from './stores/theme'

const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

// 初始化 VXE-UI 多语言
VxeUI.setI18n('zh-CN', VxeZhCN)
VxeUI.setI18n('en-US', VxeEnUS)

const app = createApp(App)

app.use(pinia)
app.use(router)
app.use(i18n)
app.use(VxeUI)
app.directive('input-listener', inputListener) // 注册全局指令

// 初始化主题
const themeStore = useThemeStore()
document.documentElement.className = themeStore.theme
VxeUI.setTheme(themeStore.theme)

app.mount('#app')
