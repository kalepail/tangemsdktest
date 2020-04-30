import Vue from 'vue'

import './assets/scss/style.scss'
import store from './store/index'
import App from './App'

Vue.config.productionTip = false

new Vue({
  store,
  render: h => h(App)
}).$mount('#app')