<template lang="pug">
  div
    tm-data-loading(v-if="delegates.loading && sortedFilteredEnrichedDelegates.length === 0")
    tm-data-empty(v-else-if="!delegates.loading && delegates.delegates.length === 0")
    data-empty-search(v-else-if="!delegates.loading && sortedFilteredEnrichedDelegates.length === 0")
    div(v-else)
      panel-sort(:sort='sort', :properties="properties")
      ol(type="1")
        li-validator(v-for='i in sortedFilteredEnrichedDelegates' :key='i.id' :validator='i')
</template>

<script>
import { mapGetters, mapActions } from "vuex"
import num from "scripts/num"
import Mousetrap from "mousetrap"
import LiValidator from "staking/LiValidator"
import { TmDataEmpty, TmDataLoading } from "@tendermint/ui"
import DataEmptySearch from "common/TmDataEmptySearch"
import ModalSearch from "common/TmModalSearch"
import PanelSort from "staking/PanelSort"
import VmToolBar from "common/VmToolBar"
export default {
  name: `page-staking`,
  props: [`properties`, `somethingToSearch`, `sortedFilteredEnrichedDelegates`],
  components: {
    LiValidator,
    TmDataEmpty,
    DataEmptySearch,
    TmDataLoading,
    ModalSearch,
    PanelSort,
    VmToolBar
  },
  data: () => ({
    num: num,
    query: ``,
    sort: {
      property: `percent_of_vote`,
      order: `desc`
    }
  }),
  computed: {
    ...mapGetters([`delegates`, `filters`])
  },
  watch: {
    address: function(address) {
      address && this.updateDelegates()
    }
  },
  methods: {
    setSearch(bool = !this.filters[`delegates`].search.visible) {
      if (!this.somethingToSearch) return false
      this.$store.commit(`setSearchVisible`, [`delegates`, bool])
    },
    ...mapActions([`updateDelegates`])
  },
  async mounted() {
    Mousetrap.bind([`command+f`, `ctrl+f`], () => this.setSearch(true))
    Mousetrap.bind(`esc`, () => this.setSearch(false))

    // XXX temporary because querying the shares shows old shares after bonding
    // this.updateDelegates()
  }
}
</script>
<style lang="stylus">
@require '~variables'

@media screen and (min-width: 768px)
  padding-bottom 4rem

.fixed-button-bar
  padding 1rem 1rem 1rem 2rem

@media screen and (min-width: 1024px)
  .fixed-button-bar
    margin-left width-side
</style>
