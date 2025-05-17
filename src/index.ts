import type { App as VueApp } from 'vue'
import MainApp from './App.vue'

export const OpenIMWeb = {
  install: (app: VueApp) => {
    app.component('OpenIMWeb', MainApp)
  },
}

export { MainApp }
