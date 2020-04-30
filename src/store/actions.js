import { Plugins } from '@capacitor/core'

const { Device } = Plugins

export default {
  async getInfo({commit}) {
    commit('setInfo', await Device.getInfo())
  },
}