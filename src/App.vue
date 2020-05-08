<template>
  <div class="app">
    <h1>Tangem Signer</h1>

    <p v-if="submitted">Successfully submitted</p>

    <button @click="scanCard" v-else-if="!publicKey">Initialize</button>

    <div class="actions" v-else>
      <p v-html="publicKey"></p>

      <textarea rows="10" placeholder="Paste unsigned XDR" v-if="!signedXdr" v-model="unsignedXdr"></textarea>
      <button @click="sign" v-if="!signedXdr">Sign Transaction</button>

      <textarea rows="10" v-model="signedXdr" v-if="signedXdr" readonly></textarea>
      <button @click="submit" v-if="signedXdr">{{ submitting ? '...' : 'Submit' }}</button>
    </div>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex'
import { Plugins } from '@capacitor/core'
import { StrKey, Server, TransactionBuilder, BASE_FEE, Networks, Operation, Transaction } from 'stellar-sdk'
import hexToArrayBuffer from 'hex-to-array-buffer'
import Promise from 'bluebird'

const { SplashScreen } = Plugins
const { TangemSdk } = window
const horizon = 'https://horizon-testnet.stellar.org'
const server = new Server(horizon)

export default {
  data() {
    return {
      // tangemCard: {walletPublicKey: '77E4BEE74A1FBE10319E7C9AA6EBD9C90F765B119C81E96A4DC386E86D5D5C55'},
      tangemCard: null,
      unsignedXdr: null,
      signedXdr: null,
      submitted: false,
      submitting: false
    }
  },
  created() {
    this.getInfo()
  },
  mounted() {

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
        document.querySelector('body').classList.remove('touchscroll')
      }
    },
    submitted() {
      if (this.submitted)
        setTimeout(() => {
          this.unsignedXdr = null
          this.signedXdr = null
          this.submitted = false
        }, 5000)
    }
  },
  methods: {
    ...mapActions([
      'getInfo'
    ]),

    scanCard() {
      TangemSdk.scanCard({
        success: (result) => this.tangemCard = JSON.parse(result),
        error: (error) => console.error(error)
      })
    },

    async sign() {
      this.signedXdr = await new Promise((resolve, reject) => {
        const transaction = new Transaction(this.unsignedXdr, Networks.TESTNET)

        TangemSdk.sign({
          success: (result) => {
            console.log(result)

            const signature = btoa(
              String.fromCharCode(
                ...new Uint8Array(
                  hexToArrayBuffer(
                    JSON.parse(result).signature
                  )
                )
              )
            )

            console.log(signature)

            transaction.addSignature(this.publicKey, signature)
            resolve(transaction.toXDR())
          },
          error: (error) => reject(error)
        }, this.tangemCard.cardId, [
          transaction.hash().toString('hex')
        ])
      })
    },

    submit() {
      this.submitting = true

      const transaction = new Transaction(this.signedXdr, Networks.TESTNET)
      server.submitTransaction(transaction)
      .then((res) => this.submitted = true)
      .catch((err) => console.error(err))
      .finally(() => this.submitting = false)
    }
  }
}
</script>

<style lang="scss">
@import './assets/scss/vamp';

.app {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  padding: 0 10px;
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
textarea {
  background-color: $ui-9;
  padding: 10px;
  margin-bottom: 20px;
  color: $ui-1;
}
</style>