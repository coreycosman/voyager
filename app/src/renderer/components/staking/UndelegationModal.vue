<template>
  <div
    v-click-outside="close"
    id="undelegation-modal"
    class="undelegation-modal"
  >
    <div class="undelegation-modal-header">
      <img
        class="icon undelegation-modal-atom"
        src="~assets/images/cosmos-logo.png"
      /><span class="tm-modal-title">Undelegate</span>
      <div class="tm-modal-icon tm-modal-close" @click="close()">
        <i class="material-icons">close</i>
      </div>
    </div>
    <tm-form-group
      :error="$v.amount.$invalid"
      class="undelegation-modal-form-group"
      field-label="Amount"
    >
      <tm-field
        id="denom"
        :placeholder="bondingDenom"
        type="text"
        readonly="readonly"
      />
      <tm-field
        v-focus
        id="amount"
        :max="maximum"
        :min="0"
        v-model="amount"
        type="number"
      />
      <tm-form-msg
        v-if="!$v.amount.between && amount > 0"
        :max="$v.amount.$params.between.max"
        :min="$v.amount.$params.between.min"
        name="Amount"
        type="between"
      />
    </tm-form-group>
    <tm-form-group
      class="undelegation-modal-form-group"
      field-id="to"
      field-label="To"
    >
      <tm-field id="to" v-model="to" readonly="readonly" />
      <hr />
    </tm-form-group>
    <tm-form-group
      class="undelegation-modal-form-group"
      field-id="password"
      field-label="Account password"
    >
      <tm-field
        id="password"
        v-model="password"
        :type="showPassword ? `text` : `password`"
        placeholder="password..."
      />
      <input
        id="showPasswordCheckbox"
        v-model="showPassword"
        type="checkbox"
        @input="togglePassword"
      />
      <label for="showPasswordCheckbox">Show password</label>
    </tm-form-group>
    <div class="undelegation-modal-footer">
      <tm-btn
        id="submit-undelegation"
        :disabled="$v.$invalid"
        color="primary"
        value="Undelegate"
        size="lg"
        @click.native="onUndelegate"
      />
    </div>
  </div>
</template>

<script>
import { mapGetters } from "vuex"
import ClickOutside from "vue-click-outside"
import { required, between } from "vuelidate/lib/validators"
import Modal from "common/TmModal"
import { TmBtn, TmField, TmFormGroup, TmFormMsg } from "@tendermint/ui"

const isInteger = amount => Number.isInteger(amount)

export default {
  name: `undelegation-modal`,
  directives: {
    ClickOutside
  },
  components: {
    Modal,
    TmBtn,
    TmField,
    TmFormGroup,
    TmFormMsg
  },
  props: {
    maximum: {
      type: Number,
      required: true
    },
    to: {
      type: String,
      required: true
    }
  },
  data: () => ({
    amount: 0,
    password: ``,
    showPassword: false
  }),
  computed: {
    ...mapGetters([`bondingDenom`])
  },
  validations() {
    return {
      amount: {
        required,
        isInteger,
        between: between(1, this.maximum)
      },
      password: {
        required
      }
    }
  },
  methods: {
    close() {
      this.$emit(`update:showUndelegationModal`, false)
    },
    togglePassword() {
      this.showPassword = !this.showPassword
    },
    onUndelegate() {
      this.$emit(`submitUndelegation`, {
        amount: this.amount,
        password: this.password
      })
      this.close()
    }
  }
}
</script>

<style>
.undelegation-modal {
  background: var(--app-nav);
  display: flex;
  flex-direction: column;
  height: 50%;
  justify-content: space-between;
  left: 50%;
  padding: 2rem;
  position: fixed;
  top: 50%;
  width: 40%;
  z-index: var(--z-modal);
}

.undelegation-modal-header {
  align-items: center;
  display: flex;
}

.undelegation-modal-atom {
  height: 4rem;
  width: 4rem;
}

.undelegation-modal-form-group {
  display: block;
  padding: 0;
}

.undelegation-modal #amount {
  margin-top: -32px;
}

.undelegation-modal #denom {
  text-align: right;
  width: 72px;
  margin-left: 80%;
  border: none;
}

.undelegation-modal-footer {
  display: flex;
  justify-content: flex-end;
}

.undelegation-modal-footer button {
  margin-left: 1rem;
}
</style>
