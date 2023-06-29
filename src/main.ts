import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
// import router from './router'

import { library } from '@fortawesome/fontawesome-svg-core'
/* import specific icons */
import { faJoint, faCannabis, faBong, faBolt, faTrashAlt, faHourglassHalf, faTemperatureHalf, faNoteSticky, faClockFour } from '@fortawesome/free-solid-svg-icons'
import { registerSW } from 'virtual:pwa-register'

/* add icons to the library */
library.add(faJoint, faCannabis, faBong, faBolt, faTrashAlt, faHourglassHalf, faTemperatureHalf, faNoteSticky, faClockFour)

const app = createApp(App).component('font-awesome-icon', FontAwesomeIcon)

// app.use(router)

app.mount('#app')

registerSW({ immediate: true })