<template>
  <div class="app">
    <h1>TSS + Tangem</h1>

    <p v-if="submitted">Successfully submitted</p>

    <div v-else>
      <label v-if="!fields">
        What's TSS contract would you like to load?
        <input type="text" v-model="contract" placeholder="Contract hash">
      </label>

      <button @click="loadContract" v-if="!fields">Load Contract</button>

      <label v-for="field in fields" :key="field.name" :class="field.name">
        {{field.description}}
        <input type="text" v-model="field.value" :placeholder="field.name">
      </label>

      <button @click="submitContract" v-if="fields">{{ submitting ? '...' : 'Sign & Submit' }}</button>
    </div>

    <!-- <button @click="scanCard" v-else-if="!publicKey">Scan</button> -->

    <!-- <div class="actions" v-else>
      <p>{{publicKey}}</p>

      <textarea rows="10" placeholder="Paste unsigned XDR" v-if="!signedXdr" v-model="unsignedXdr"></textarea>
      <button @click="sign" v-if="!signedXdr">Sign Transaction</button>

      <textarea rows="10" v-model="signedXdr" v-if="signedXdr" readonly></textarea>
      <button @click="submit" v-if="signedXdr">{{ submitting ? '...' : 'Submit' }}</button>
    </div> -->
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex'
import { Plugins } from '@capacitor/core'
import { StrKey, Server, TransactionBuilder, BASE_FEE, Networks, Operation, Transaction } from 'stellar-sdk'
import hexToArrayBuffer from 'hex-to-array-buffer'
import Promise from 'bluebird'
import axios from 'axios'
import { each } from 'lodash'

const { SplashScreen } = Plugins
const { TangemSdk } = window
const horizon = 'https://horizon-testnet.stellar.org'
const server = new Server(horizon)

export default {
  data() {
    return {
      tangemCard: null,
      unsignedXdr: null,
      signedXdr: null,
      contract: null,
      fields: null,
      submitted: false,
      submitting: false
    }
  },
  created() {
    this.getInfo()
  },
  mounted() {
    this.contract = '5e14318ef516fa1b7aa517008f01e160035dde100fac999d3d18d00df43bb3ce'
  },
  computed: {
    ...mapState([
      'info'
    ]),
    publicKey() {
      if (this.tangemCard) return StrKey.encodeEd25519PublicKey(
        hexToArrayBuffer(this.tangemCard.walletPublicKey)
      ); return null
    }
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
        this.tangemCard = {walletPublicKey: '77E4BEE74A1FBE10319E7C9AA6EBD9C90F765B119C81E96A4DC386E86D5D5C55'},

        document.querySelector('body').classList.remove('touchscroll')
      }
    },
    submitted() {
      if (this.submitted) setTimeout(() => {
        this.submitted = false
        this.unsignedXdr = null
        this.signedXdr = null
        this.fields = null
      }, 5000)
    },
  },
  methods: {
    ...mapActions([
      'getInfo'
    ]),

    async loadContract() {
      try {
        await axios.get(`https://turing-signing-server-0.stellar.buzz/contract/${this.contract}`)
        .then(({data}) => {
          this.fields = data.fields

          if (
            this.info.platform === 'ios'
            || this.info.platform === 'android'
          ) {
            TangemSdk.scanCard({
              success: (result) => {
                this.tangemCard = result

                each(this.fields, (field) => {
                  if (
                    field.name === 'to'
                    || field.name === 'source'
                  ) this.$set(field, 'value', this.publicKey)
                })
              },
              error: (error) => {throw error}
            })
          }

          else {
            each(this.fields, (field) => {
              if (
                field.name === 'to'
                || field.name === 'source'
              ) this.$set(field, 'value', this.publicKey)
            })
          }
        })
      }

      catch(err) {
        console.error(err)
      }
    },

    async submitContract() {
      const data = {}
      each(this.fields, (field) => data[field.name] = field.value)

      this.submitting = true

      try {
          this.unsignedXdr = await axios.post(`https://turing-signing-server-0.stellar.buzz/contract/${this.contract}/run/collate`, data, {
          params: {
            signatures: 3
          }
        })
        .then(({data}) => data)

        this.signedXdr = await new Promise((resolve, reject) => {
          const transaction = new Transaction(this.unsignedXdr, Networks.TESTNET)

          if (
            this.info.platform === 'ios'
            || this.info.platform === 'android'
          ) {
            TangemSdk.sign({
              success: (result) => {
                const signature = btoa(
                  String.fromCharCode(
                    ...new Uint8Array(
                      hexToArrayBuffer(
                        result.signature
                      )
                    )
                  )
                )

                transaction.addSignature(this.publicKey, signature)
                resolve(transaction.toXDR())
              },
              error: (error) => reject(error)
            }, this.tangemCard.cardId, [
              transaction.hash().toString('hex')
            ])
          }

          else {
            resolve(transaction.toXDR())
          }
        })

        const transaction = new Transaction(this.signedXdr, Networks.TESTNET)

        await server.submitTransaction(transaction)
        .then((res) => this.submitted = true)
      }

      catch(err) {
        console.error(err)
      }

      finally {
        this.submitting = false
      }
    },
  }
}
</script>

<style lang="scss">
@import './assets/scss/vamp';

.app {
  // display: flex;
  // align-items: center;
  // justify-content: center;
  // flex-direction: column;
  padding: 0 10px;
  max-width: 500px;
  margin: 0 auto;
}
h1 {
  font-size: 24px;
  padding: 20px 0;
}
button {
  background-color: $ui-9;
  padding: 10px 20px;
  color: $ui-1;
}
p {
  overflow: scroll;
  margin-bottom: 20px;
  line-height: 1.5;
}
.actions {
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 500px;
}
label {

  &.to,
  &.source {
    display: none;
  }

  input {
    margin-top: 5px;
  }
}
textarea,
input {
  background-color: $ui-9;
  padding: 10px;
  margin-bottom: 20px;
  color: $ui-1;
  width: 100%;
}
</style>