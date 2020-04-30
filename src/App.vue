<template>
  <div class="app">
    <h1>Hello There!</h1>
    <button @click="scanCard">Scan card</button>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex'
import { Plugins } from '@capacitor/core'
var TangemSdk = require('tangem_sdk')

const { SplashScreen } = Plugins

export default {
  data() {
    return {

    }
  },
  created() {
    this.getInfo()
  },
  mounted() {
    console.log(TangemSdk)
  },
  computed: {
    ...mapState([
      'info'
    ])
  },
  components: {

  },
  watch: {
     async info() {
      if (
        this.info.platform === 'ios'
        || this.info.platform === 'android'
      ) {
        document.querySelector('body').classList.add('touchscroll')
        SplashScreen.hide()
      }

      else {
        document.querySelector('body').classList.remove('touchscroll')
      }
    },
  },
  methods: {
    ...mapActions([
      'getInfo'
    ])
  }
}
</script>

<style lang="scss">
@import './assets/scss/vamp';


</style>