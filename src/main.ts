import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import i18n from './plugins/i18n'
import './plugins/dayjs'

import App from './App.vue'
import router from './router'
import VxeUIAll from 'vxe-pc-ui'
import 'vxe-pc-ui/lib/style.css'
import VxeZhCN from 'vxe-pc-ui/lib/language/zh-CN' // 中文(简体)
import VxeEnUS from 'vxe-pc-ui/lib/language/en-US' // 英文(美国)

const app = createApp(App)
const pinia = createPinia()

pinia.use(piniaPluginPersistedstate)
VxeUIAll.setI18n('zh-CN', VxeZhCN)
VxeUIAll.setI18n('en-US', VxeEnUS)
app.use(pinia)
app.use(router)
app.use(i18n)
app.use(VxeUIAll)

app.mount('#app')
