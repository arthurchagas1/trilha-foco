import './styles.css'
import { mountApp } from './app.js'

mountApp(document.querySelector('#app'), {
  getStorage: () => window.localStorage,
  createId: () => window.crypto.randomUUID(),
})
