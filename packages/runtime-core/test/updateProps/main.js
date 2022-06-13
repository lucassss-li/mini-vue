import { createApp } from '../../../../dist/vue-esm.js'
import updateComponent from './updateComponent.js'
const root = document.querySelector('#app')
createApp(updateComponent).mount(root)
