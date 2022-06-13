import { createApp } from '../../../../dist/vue-esm.js'
import app from './app.js'
const root = document.querySelector('#app')
createApp(app).mount(root)
