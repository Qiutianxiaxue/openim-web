import type { App } from 'vue'
import ChatWindow from './components/ChatWindow.vue'
import './assets/main.scss'

export { ChatWindow }

export default {
  install(app: App) {
    app.component('ChatWindow', ChatWindow)
  },
}
