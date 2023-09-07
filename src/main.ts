import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
// import router from './router'

import { library } from '@fortawesome/fontawesome-svg-core'
/* import specific icons */
import { faJoint, faCannabis, faBong, faBolt, faTrashAlt, faHourglassHalf, faTemperatureHalf, faNoteSticky, faClockFour } from '@fortawesome/free-solid-svg-icons'

// @ts-ignore
import { registerSW } from 'virtual:pwa-register'

import ElementPlus from 'element-plus'
import 'element-plus/theme-chalk/dark/css-vars.css'
import 'element-plus/dist/index.css'

/* add icons to the library */
library.add(faJoint, faCannabis, faBong, faBolt, faTrashAlt, faHourglassHalf, faTemperatureHalf, faNoteSticky, faClockFour)

const app = createApp(App)

app.component('font-awesome-icon', FontAwesomeIcon)

// app.use(router)
app.use(ElementPlus)

app.mount('#app')

registerSW({ immediate: true })
