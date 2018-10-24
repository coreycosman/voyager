<template lang="pug">
  div.my-delegations
    h3.tab-header
      | Your Validators
      |
      i.material-icons.info-button(v-tooltip.top="bondInfo") info_outline
    panel-sort(:sort='sort', :properties="properties")
    data-empty-search(v-if="yourValidators.length === 0")
    template(v-else)
      ol
        li-validator(
          v-for='validator in yourValidators'
          :key='`Your/${validator.id}`'
          :validator='validator'
        )
    .check-out-message
      | Check out
      |
      router-link(:to="{name: 'Validators'}") the validator list
      |
      | to spread some of your Atoms around.

    div(v-if="undelegatedValidators.length")
      h3.tab-header
        | Your Undelegated Validators
        |
        i.material-icons.info-button(v-tooltip.top="unbondInfo") info_outline
      ol
        li-validator(
          v-for='validator in undelegatedValidators'
          :key='`Undelegated/${validator.id}`'
          :validator='validator'
        )
</template>

<script>
import { mapGetters } from "vuex"
import LiValidator from "staking/LiValidator"
import { TmDataEmpty } from "@tendermint/ui"
import DataEmptySearch from "common/TmDataEmptySearch"
import PanelSort from "staking/PanelSort"
export default {
  name: `tab-my-delegations`,
  props: [`properties`],
  components: {
    LiValidator,
    TmDataEmpty,
    DataEmptySearch,
    PanelSort
  },
  data: () => ({
    sort: {
      property: `percent_of_vote`,
      order: `desc`
    },
    bondInfo: `Validators you are currently bonded to`,
    unbondInfo: `Your bonded validators in unbonding process`
  }),
  computed: {
    ...mapGetters([`delegates`, `delegation`, `committedDelegations`]),
    undelegatedValidators(
      { delegates: { delegates }, delegation: { unbondingDelegations } } = this
    ) {
      const unbonding = new Set(Object.keys(unbondingDelegations))
      return delegates.filter(({ id }) => unbonding.has(id))
    },
    yourValidators({ committedDelegations, delegates: { delegates } } = this) {
      const committed = new Set(Object.keys(committedDelegations))
      return delegates.filter(({ id }) => committed.has(id))
    }
  }
}
</script>
<style lang="stylus">
@require '~variables'

.my-delegations
  .tm-data-msg
    margin-left 2rem

.tab-header
  margin 1rem 1rem 0 2rem
  font-size 14px
  color var(--dim)
  font-weight 500

.info-button
  color var(--link)

.check-out-message
  background var(--app-fg)
  border 1px solid var(--bc-dim)
  border-radius 0.25rem
  font-size sm
  margin-bottom 4rem
  margin-left 2rem
  padding 0.5rem
  text-align center
</style>
