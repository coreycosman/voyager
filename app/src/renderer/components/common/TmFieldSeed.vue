<template>
  <tm-field
    :value="value"
    class="tm-field-seed"
    type="textarea"
    @input="update($event)"
  />
</template>

<script>
import autosize from "autosize"
import { TmField } from "@tendermint/ui"
export default {
  name: `tm-field-seed`,
  components: { TmField },
  props: {
    value: {
      type: String,
      required: true
    }
  },
  watch: {
    value: {
      handler: async function() {
        await this.$nextTick()
        autosize.update(this.$el)
      }
    }
  },
  mounted() {
    // adjust the textarea element height to match content
    autosize(this.$el)
  },
  methods: {
    update(value) {
      this.$emit(`input`, value)
    }
  }
}
</script>
<style>
.tm-field:disabled.tm-field-seed {
  border: 1px solid var(--bc);
}
</style>
