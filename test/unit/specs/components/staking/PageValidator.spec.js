import Delegation from "renderer/vuex/modules/delegation"
import DelegationModal from "staking/DelegationModal"
import UndelegationModal from "staking/UndelegationModal"
import TmModal from "common/TmModal"
import setup from "../../../helpers/vuex-setup"
import PageValidator from "renderer/components/staking/PageValidator"
import lcdClientMock from "renderer/connectors/lcdClientMock.js"
import { createLocalVue, mount } from "@vue/test-utils"
import Vuelidate from "vuelidate"
import BigNumber from "bignumber.js"

const validator = {
  operator_address: lcdClientMock.validators[0],
  pub_key: `cosmoschiapudding123456789`,
  tokens: `19`,
  delegator_shares: `19`,
  description: {
    details: `Herr Schmidt`,
    website: `www.schmidt.de`,
    moniker: `herr_schmidt_revoked`,
    country: `DE`
  },
  revoked: false,
  status: 2,
  bond_height: `0`,
  bond_intra_tx_counter: 6,
  proposer_reward_pool: null,
  commission: {
    rate: `0.05`,
    max_rate: `0.1`,
    max_change_rate: `0.005`,
    update_time: `1970-01-01T00:00:00Z`
  },
  prev_bonded_shares: `0`,
  voting_power: `10`
}

const validatorTo = {
  operator_address: `cosmosvaladdr15ky9du8a2wlstz6fpx3p4mqpjyrm5ctplpn3au`,
  pub_key: `cosmosvalpub123456789`,
  tokens: `10`,
  delegator_shares: `10`,
  description: {
    website: `www.greg.com`,
    details: `Good Guy Greg`,
    moniker: `good_greg`,
    country: `USA`
  },
  revoked: false,
  status: 2,
  bond_height: `0`,
  bond_intra_tx_counter: 6,
  proposer_reward_pool: null,
  commission: {
    rate: `0`,
    max_rate: `0`,
    max_change_rate: `0`,
    update_time: `1970-01-01T00:00:00Z`
  },
  prev_bonded_shares: `0`
}

const getterValues = {
  bondingDenom: `atom`,
  config: {
    bondingDenom: `atom`,
    desktop: false
  },
  delegates: {
    delegates: [validator, validatorTo],
    globalPower: 4200
  },
  delegation: {
    committedDelegates: { [lcdClientMock.validators[0]]: 0 },
    unbondingDelegations: {}
  },
  committedDelegations: {
    [lcdClientMock.validators[0]]: 0
  },
  keybase: `keybase`,
  oldBondedAtoms: 50,
  totalAtoms: 100,
  user: { atoms: 42 },
  wallet: { address: `cosmos15ky9du8a2wlstz6fpx3p4mqpjyrm5ctpesxxn9` },
  connected: true
}

describe(`PageValidator`, () => {
  let wrapper, store
  let { mount } = setup()

  const localVue = createLocalVue()
  localVue.use(Vuelidate)

  beforeEach(() => {
    let instance = mount(PageValidator, {
      localVue,
      doBefore: ({ router, store }) => {
        router.push(`/staking/validators/${lcdClientMock.validators[0]}`)
        store.commit(`setCommittedDelegation`, {
          candidateId: lcdClientMock.validators[0],
          value: `123.45678`
        })
        store.commit(`setConnected`, true)
        store.commit(`setDelegates`, [validator, validatorTo])
      }
    })
    wrapper = instance.wrapper
    store = instance.store
  })

  it(`has the expected html structure`, async () => {
    // after importing the @tendermint/ui components from modules
    // the perfect scroll plugin needs a $nextTick and a wrapper.update
    // to work properly in the tests (snapshots weren't matching)
    // this has occured across multiple tests
    await wrapper.vm.$nextTick()
    wrapper.update()
    expect(wrapper.vm.$el).toMatchSnapshot()
  })

  it(`should return one delegate based on route params`, () => {
    expect(wrapper.vm.validator.operator_address).toEqual(
      lcdClientMock.validators[0]
    )
  })

  it(`shows a default avatar`, () => {
    expect(wrapper.vm.$el).toMatchSnapshot()
  })

  it(`shows an error if the validator couldn't be found`, () => {
    let instance = mount(PageValidator, {
      doBefore: ({ router }) => {
        router.push(`/staking/validators/${lcdClientMock.validators[0]}`)
      },
      getters: {
        config: () => ({ desktop: false }),
        delegates: () => ({
          delegates: []
        })
      }
    })

    wrapper = instance.wrapper

    expect(wrapper.vm.$el).toMatchSnapshot()
  })

  it(`shows the selfBond`, async () => {
    await store.commit(`setSelfBond`, {
      validator: {
        operator_address: lcdClientMock.validators[0],
        delegator_shares: `4242`
      },
      ratio: 0.01
    })
    wrapper.update()
    expect(wrapper.find(`#validator-profile__self-bond`).text()).toBe(`1.00 %`)
  })

  it(`should show the validator status`, () => {
    expect(wrapper.vm.status).toBe(`This validator is actively validating`)
    // Jailed
    store.state.delegates.delegates = [
      Object.assign({}, validator, {
        revoked: true
      })
    ]
    wrapper.update()
    expect(wrapper.vm.status).toBe(
      `This validator has been jailed and is not currently validating`
    )
    // Is not a validator
    store.state.delegates.delegates = [
      Object.assign({}, validator, {
        voting_power: 0
      })
    ]
    wrapper.update()
    expect(wrapper.vm.status).toBe(
      `This validator does not have enough voting power yet and is inactive`
    )
  })

  // TODO enable when we decide on limits are defined
  // it("switches color indicators", async () => {
  //   store.state.delegates.delegates = [
  //     Object.assign({}, delegate, {
  //       commission: "0"
  //     })
  //   ]
  //   wrapper.update()
  //   expect(wrapper.find("#validator-profile__commission").classes()).toContain(
  //     "green"
  //   )
  //
  //   store.state.delegates.delegates = [
  //     Object.assign({}, delegate, {
  //       commission: "0.02"
  //     })
  //   ]
  //   wrapper.update()
  //   expect(wrapper.find("#validator-profile__commission").classes()).toContain(
  //     "yellow"
  //   )
  //
  //   store.state.delegates.delegates = [
  //     Object.assign({}, delegate, {
  //       commission: "1"
  //     })
  //   ]
  //   wrapper.update()
  //   expect(wrapper.find("#validator-profile__commission").classes()).toContain(
  //     "red"
  //   )
  //
  //   store.state.delegates.globalPower = 1000
  //   store.state.delegates.delegates = [
  //     Object.assign({}, delegate, {
  //       tokens: "1000"
  //     })
  //   ]
  //   wrapper.update()
  //   expect(wrapper.find("#validator-profile__power").classes()).toContain("red")
  //
  //   store.state.delegates.delegates = [
  //     Object.assign({}, delegate, {
  //       tokens: "10"
  //     })
  //   ]
  //   wrapper.update()
  //   expect(wrapper.find("#validator-profile__power").classes()).toContain(
  //     "yellow"
  //   )
  //
  //   store.state.delegates.delegates = [
  //     Object.assign({}, delegate, {
  //       tokens: "1"
  //     })
  //   ]
  //   wrapper.update()
  //   expect(wrapper.find("#validator-profile__power").classes()).toContain(
  //     "green"
  //   )
  // })

  it(`shows a validator as candidate if he has no voting_power`, () => {
    store.state.delegates.delegates = [
      Object.assign({}, validator, {
        voting_power: `0`
      })
    ]
    wrapper.update()
    expect(wrapper.vm.status).toMatchSnapshot()
    // expect(wrapper.find(".validator-profile__status").classes()).toContain(
    //   "yellow"
    // )
  })

  it(`shows that a validator is revoked`, () => {
    store.state.delegates.delegates = [
      Object.assign({}, validator, {
        revoked: true
      })
    ]
    wrapper.update()
    wrapper.vm.status = expect(wrapper.vm.status).toMatchSnapshot()
    // expect(wrapper.find(".validator-profile__status").classes()).toContain(
    //   "red"
    // )
  })

  it(`disables delegation and undelegation buttons if not connected`, () => {
    expect(
      wrapper.vm.$el.querySelector(`#delegation-btn`).getAttribute(`disabled`)
    ).toBeNull()
    expect(
      wrapper.vm.$el.querySelector(`#undelegation-btn`).getAttribute(`disabled`)
    ).toBeNull()
    store.state.connection.connected = false
    wrapper.update()
    expect(
      wrapper.vm.$el.querySelector(`#delegation-btn`).getAttribute(`disabled`)
    ).not.toBeNull()
    expect(
      wrapper.vm.$el.querySelector(`#undelegation-btn`).getAttribute(`disabled`)
    ).not.toBeNull()
  })
})

describe(`delegationTargetOptions`, () => {
  it(`always shows wallet in the first position`, () => {
    const $store = {
      commit: jest.fn(),
      dispatch: jest.fn(),
      getters: {
        ...getterValues,
        committedDelegations: {},
        delegation: {
          committedDelegates: {},
          unbondingDelegations: {}
        }
      }
    }

    const {
      vm: { delegationTargetOptions }
    } = mount(PageValidator, {
      mocks: {
        $route: {
          params: { validator: validator.operator_address }
        },
        $store
      }
    })

    let options = delegationTargetOptions()
    expect(options).toHaveLength(1)
    expect(options[0].address).toEqual($store.getters.wallet.address)

    expect(options).toMatchSnapshot()
  })

  it(`hides displayed validator if bonded`, () => {
    const $store = {
      commit: jest.fn(),
      dispatch: jest.fn(),
      getters: {
        ...getterValues,
        committedDelegations: {
          [lcdClientMock.validators[0]]: 10
        },
        delegation: {
          committedDelegates: {
            [lcdClientMock.validators[0]]: 10
          },
          unbondingDelegations: {}
        }
      }
    }

    const {
      vm: { delegationTargetOptions }
    } = mount(PageValidator, {
      mocks: {
        $route: {
          params: { validator: validator.operator_address }
        },
        $store
      }
    })

    let options = delegationTargetOptions()
    expect(options).toHaveLength(1)
    expect(options).not.toContainEqual(
      expect.objectContaining({ address: validator.operator_address })
    )
    expect(options[0].address).toEqual($store.getters.wallet.address)

    expect(options).toMatchSnapshot()
  })

  it(`shows bonded validators for redelegation options`, () => {
    const $store = {
      commit: jest.fn(),
      dispatch: jest.fn(),
      getters: {
        ...getterValues,
        committedDelegations: {
          [lcdClientMock.validators[0]]: 10,
          cosmosvaladdr15ky9du8a2wlstz6fpx3p4mqpjyrm5ctplpn3au: 5
        },
        delegation: {
          committedDelegates: {
            [lcdClientMock.validators[0]]: 10,
            cosmosvaladdr15ky9du8a2wlstz6fpx3p4mqpjyrm5ctplpn3au: 5
          },
          unbondingDelegations: {}
        }
      }
    }

    const {
      vm: { delegationTargetOptions }
    } = mount(PageValidator, {
      mocks: {
        $route: {
          params: { validator: validator.operator_address }
        },
        $store
      }
    })

    let options = delegationTargetOptions()
    expect(options).toHaveLength(2)
    expect(options).not.toContainEqual(
      expect.objectContaining({ address: validator.operator_address })
    )
    expect(options[0].address).toEqual($store.getters.wallet.address)
    expect(options).toContainEqual(
      expect.objectContaining({ address: validatorTo.operator_address })
    )

    expect(options).toMatchSnapshot()
  })
})

describe(`onDelegation`, () => {
  describe(`make sure we have enough atoms to delegate`, () => {
    it(`is enough`, () => {
      const localVue = createLocalVue()
      localVue.use(Vuelidate)

      const $store = {
        commit: jest.fn(),
        dispatch: jest.fn(),
        getters: getterValues
      }

      const wrapper = mount(PageValidator, {
        localVue,
        mocks: {
          $route: { params: { validator: lcdClientMock.validators[0] } },
          $store
        }
      })

      wrapper.find(`#delegation-btn`).trigger(`click`)
      expect(wrapper.contains(DelegationModal)).toEqual(true)
    })

    it(`is not enough`, () => {
      const $store = {
        commit: jest.fn(),
        dispatch: jest.fn(),
        getters: Object.assign({}, getterValues, { oldBondedAtoms: 100 })
      }

      const wrapper = mount(PageValidator, {
        mocks: {
          $route: { params: { validator: lcdClientMock.validators[0] } },
          $store
        }
      })

      wrapper.find(`#delegation-btn`).trigger(`click`)
      expect(wrapper.vm.showCannotModal).toBe(true)
      expect(wrapper.contains(TmModal)).toEqual(true)
      expect(wrapper.text()).toContain(`delegate.`) // ...no atoms to delegate.
      expect(wrapper.vm.$el).toMatchSnapshot()

      wrapper.find(`#no-atoms-modal__btn`).trigger(`click`)
      expect(wrapper.vm.showCannotModal).toBe(false)
      expect(wrapper.contains(TmModal)).toEqual(false)
      expect(wrapper.text()).not.toContain(`delegate.`) // ...no atoms to delegate.
      expect(wrapper.vm.$el).toMatchSnapshot()
    })
  })

  describe(`submitDelegation`, () => {
    describe(`delegation`, () => {
      describe(`unit`, () => {
        it(`success`, async () => {
          const $store = {
            commit: jest.fn(),
            dispatch: jest.fn(),
            getters: getterValues
          }

          const {
            vm: { submitDelegation }
          } = mount(PageValidator, {
            mocks: {
              $route: {
                params: {
                  validator: lcdClientMock.validators[0],
                  delegator_shares: `19`
                }
              },
              $store
            }
          })

          let stakingTransactions = {}
          stakingTransactions.delegations = [
            { atoms: 10, validator: validator }
          ]

          $store.dispatch.mockClear()

          await submitDelegation({
            amount: 10,
            from: `cosmos15ky9du8a2wlstz6fpx3p4mqpjyrm5ctpesxxn9`
          })

          expect($store.dispatch.mock.calls).toEqual([
            [`submitDelegation`, { stakingTransactions }]
          ])

          expect($store.commit.mock.calls).toEqual([
            [
              `notify`,
              {
                body: `You have successfully delegated your ${
                  getterValues.bondingDenom
                }s`,
                title: `Successful delegation!`
              }
            ]
          ])
        })

        it(`error`, async () => {
          const $store = {
            commit: jest.fn(),
            dispatch: jest.fn(),
            getters: getterValues
          }

          const {
            vm: { submitDelegation }
          } = mount(PageValidator, {
            mocks: {
              $route: {
                params: {
                  validator: lcdClientMock.validators[0],
                  delegator_shares: `19`
                }
              },
              $store
            }
          })

          let stakingTransactions = {}
          stakingTransactions.delegations = [
            { atoms: 10, validator: validator }
          ]

          $store.dispatch.mockClear()
          $store.dispatch = jest.fn(() => {
            throw new Error(`message`)
          })

          await submitDelegation({
            amount: 10,
            from: `cosmos15ky9du8a2wlstz6fpx3p4mqpjyrm5ctpesxxn9`
          })

          expect($store.dispatch.mock.calls).toEqual([
            [`submitDelegation`, { stakingTransactions }]
          ])

          expect($store.commit.mock.calls).toEqual([
            [
              `notifyError`,
              {
                body: `message`,
                title: `Error while delegating ${getterValues.bondingDenom}s`
              }
            ]
          ])
        })

        it(`error with data`, async () => {
          const $store = {
            commit: jest.fn(),
            dispatch: jest.fn(),
            getters: getterValues
          }

          const {
            vm: { submitDelegation }
          } = mount(PageValidator, {
            mocks: {
              $route: {
                params: {
                  validator: lcdClientMock.validators[0],
                  delegator_shares: `19`
                }
              },
              $store
            }
          })

          let stakingTransactions = {}
          stakingTransactions.delegations = [
            { atoms: 10, validator: validator }
          ]

          $store.dispatch.mockClear()
          $store.dispatch = jest.fn(() => {
            throw new Error(`unexpected error`)
          })

          await submitDelegation({
            amount: 10,
            from: `cosmos15ky9du8a2wlstz6fpx3p4mqpjyrm5ctpesxxn9`
          })

          expect($store.dispatch.mock.calls).toEqual([
            [`submitDelegation`, { stakingTransactions }]
          ])

          expect($store.commit.mock.calls).toEqual([
            [
              `notifyError`,
              {
                body: `unexpected error`,
                title: `Error while delegating ${getterValues.bondingDenom}s`
              }
            ]
          ])
        })
      })

      describe(`composition`, () => {
        it(`delegation.submitDelegation`, async () => {
          const delegation = Delegation({})

          const dispatch = jest.fn((type, payload) => {
            if (type === `submitDelegation`) {
              delegation.actions[type]($store, payload)
            }
          })

          const $store = {
            commit: jest.fn(),
            dispatch,
            getters: getterValues,
            rootState: getterValues,
            state: {
              committedDelegates: { [lcdClientMock.validators[0]]: 0 },
              unbondingDelegations: {}
            }
          }

          const {
            vm: { submitDelegation }
          } = mount(PageValidator, {
            mocks: {
              $route: { params: { validator: lcdClientMock.validators[0] } },
              $store
            }
          })

          $store.dispatch.mockClear()

          await submitDelegation({
            amount: 10,
            from: `cosmos15ky9du8a2wlstz6fpx3p4mqpjyrm5ctpesxxn9`
          })

          expect($store.dispatch.mock.calls).toEqual([
            [
              `submitDelegation`,
              {
                stakingTransactions: {
                  delegations: [
                    {
                      atoms: 10,
                      validator: {
                        bond_height: `0`,
                        bond_intra_tx_counter: 6,
                        commission: {
                          rate: `0.05`,
                          max_rate: `0.1`,
                          max_change_rate: `0.005`,
                          update_time: `1970-01-01T00:00:00Z`
                        },
                        delegator_shares: `19`,
                        description: {
                          country: `DE`,
                          details: `Herr Schmidt`,
                          moniker: `herr_schmidt_revoked`,
                          website: `www.schmidt.de`
                        },
                        selfBond: 0.01,
                        id: lcdClientMock.validators[0],
                        keybase: undefined,
                        operator_address: lcdClientMock.validators[0],
                        percent_of_vote: `65.52%`,
                        prev_bonded_shares: `0`,
                        proposer_reward_pool: null,
                        pub_key: `cosmoschiapudding123456789`,
                        revoked: false,
                        status: 2,
                        tokens: `19`,
                        voting_power: BigNumber(19)
                      }
                    }
                  ]
                }
              }
            ],
            [
              `sendTx`,
              {
                begin_unbondings: undefined,
                begin_redelegates: undefined,
                delegations: [
                  {
                    delegation: { amount: `10`, denom: `atom` },
                    delegator_addr: `cosmos15ky9du8a2wlstz6fpx3p4mqpjyrm5ctpesxxn9`,
                    validator_addr: lcdClientMock.validators[0]
                  }
                ],
                to: `cosmos15ky9du8a2wlstz6fpx3p4mqpjyrm5ctpesxxn9`,
                type: `updateDelegations`
              }
            ]
          ])

          expect($store.commit.mock.calls).toEqual([
            [`setAtoms`, 32],
            [
              `notify`,
              {
                body: `You have successfully delegated your ${
                  getterValues.bondingDenom
                }s`,
                title: `Successful delegation!`
              }
            ]
          ])
        })
      })
    })

    describe(`redelegation`, () => {
      describe(`unit`, () => {
        it(`success`, async () => {
          const $store = {
            commit: jest.fn(),
            dispatch: jest.fn(),
            getters: getterValues
          }

          const {
            vm: { submitDelegation }
          } = mount(PageValidator, {
            mocks: {
              $route: {
                params: {
                  validator: `cosmosvaladdr15ky9du8a2wlstz6fpx3p4mqpjyrm5ctplpn3au`,
                  delegator_shares: `19`
                }
              },
              $store
            }
          })

          let stakingTransactions = {}
          stakingTransactions.redelegations = [
            { atoms: 5, validatorSrc: validator, validatorDst: validatorTo }
          ]

          $store.dispatch.mockClear()

          await submitDelegation({
            amount: 5,
            from: lcdClientMock.validators[0]
          })

          expect($store.dispatch.mock.calls).toEqual([
            [`submitDelegation`, { stakingTransactions }]
          ])

          expect($store.commit.mock.calls).toEqual([
            [
              `notify`,
              {
                title: `Successful redelegation!`,
                body: `You have successfully redelegated your ${
                  getterValues.bondingDenom
                }s`
              }
            ]
          ])
        })

        it(`error`, async () => {
          const $store = {
            commit: jest.fn(),
            dispatch: jest.fn(),
            getters: getterValues
          }

          const {
            vm: { submitDelegation }
          } = mount(PageValidator, {
            mocks: {
              $route: {
                params: {
                  validator: `cosmosvaladdr15ky9du8a2wlstz6fpx3p4mqpjyrm5ctplpn3au`,
                  delegator_shares: `19`
                }
              },
              $store
            }
          })

          let stakingTransactions = {}
          stakingTransactions.redelegations = [
            { atoms: 5, validatorSrc: validator, validatorDst: validatorTo }
          ]

          $store.dispatch.mockClear()
          $store.dispatch = jest.fn(() => {
            throw new Error(`message`)
          })

          await submitDelegation({
            amount: 5,
            from: lcdClientMock.validators[0]
          })

          expect($store.dispatch.mock.calls).toEqual([
            [`submitDelegation`, { stakingTransactions }]
          ])

          expect($store.commit.mock.calls).toEqual([
            [
              `notifyError`,
              {
                title: `Error while redelegating ${getterValues.bondingDenom}s`,
                body: `message`
              }
            ]
          ])
        })

        it(`error with data`, async () => {
          const $store = {
            commit: jest.fn(),
            dispatch: jest.fn(),
            getters: getterValues
          }

          const {
            vm: { submitDelegation }
          } = mount(PageValidator, {
            mocks: {
              $route: {
                params: {
                  validator: `cosmosvaladdr15ky9du8a2wlstz6fpx3p4mqpjyrm5ctplpn3au`,
                  delegator_shares: `19`
                }
              },
              $store
            }
          })

          let stakingTransactions = {}
          stakingTransactions.redelegations = [
            { atoms: 5, validatorSrc: validator, validatorDst: validatorTo }
          ]

          $store.dispatch.mockClear()
          $store.dispatch = jest.fn(() => {
            throw new Error(`unexpected error`)
          })

          await submitDelegation({
            amount: 5,
            from: lcdClientMock.validators[0]
          })

          expect($store.dispatch.mock.calls).toEqual([
            [`submitDelegation`, { stakingTransactions }]
          ])

          expect($store.commit.mock.calls).toEqual([
            [
              `notifyError`,
              {
                body: `unexpected error`,
                title: `Error while redelegating ${getterValues.bondingDenom}s`
              }
            ]
          ])
        })
      })

      describe(`composition`, () => {
        it(`redelegation.submitDelegation`, async () => {
          const delegation = Delegation({})

          const dispatch = jest.fn((type, payload) => {
            if (type === `submitDelegation`) {
              delegation.actions[type]($store, payload)
            }
          })

          const $store = {
            commit: jest.fn(),
            dispatch,
            getters: getterValues,
            rootState: getterValues,
            state: {
              committedDelegates: { [lcdClientMock.validators[0]]: 10 },
              unbondingDelegations: {}
            }
          }

          const {
            vm: { submitDelegation }
          } = mount(PageValidator, {
            mocks: {
              $route: {
                params: {
                  validator: `cosmosvaladdr15ky9du8a2wlstz6fpx3p4mqpjyrm5ctplpn3au`
                }
              },
              $store
            }
          })

          $store.dispatch.mockClear()

          await submitDelegation({
            amount: 5,
            from: lcdClientMock.validators[0]
          })

          expect($store.dispatch.mock.calls).toEqual([
            [
              `submitDelegation`,
              {
                stakingTransactions: {
                  redelegations: [
                    {
                      atoms: 5,
                      validatorSrc: validator,
                      validatorDst: validatorTo
                    }
                  ]
                }
              }
            ],
            [
              `sendTx`,
              {
                delegations: undefined,
                begin_unbondings: undefined,
                begin_redelegates: [
                  {
                    delegator_addr: `cosmos15ky9du8a2wlstz6fpx3p4mqpjyrm5ctpesxxn9`,
                    validator_src_addr: lcdClientMock.validators[0],
                    validator_dst_addr: `cosmosvaladdr15ky9du8a2wlstz6fpx3p4mqpjyrm5ctplpn3au`,
                    shares: `50000000000.0000000000`
                  }
                ],
                to: `cosmos15ky9du8a2wlstz6fpx3p4mqpjyrm5ctpesxxn9`,
                type: `updateDelegations`
              }
            ]
          ])

          expect($store.commit.mock.calls).toEqual([
            [
              `notify`,
              {
                title: `Successful redelegation!`,
                body: `You have successfully redelegated your atoms`
              }
            ]
          ])
        })
      })
    })
  })
})

describe(`onUnstake`, () => {
  const localVue = createLocalVue()
  localVue.use(Vuelidate)

  describe(`make sure there are enough atoms to unstake`, () => {
    it(`is enough`, () => {
      const $store = {
        commit: jest.fn(),
        dispatch: jest.fn(),
        getters: Object.assign({}, getterValues, {
          committedDelegations: { [lcdClientMock.validators[0]]: 10 }
        })
      }

      const wrapper = mount(PageValidator, {
        localVue,
        mocks: {
          $route: { params: { validator: lcdClientMock.validators[0] } },
          $store
        }
      })

      wrapper.find(`#undelegation-btn`).trigger(`click`)
      expect(wrapper.vm.myBond.isGreaterThan(0)).toBe(true)
      expect(wrapper.vm.showUndelegationModal).toBe(true)
      expect(wrapper.contains(UndelegationModal)).toEqual(true)
    })

    it(`is not enough`, () => {
      const $store = {
        commit: jest.fn(),
        dispatch: jest.fn(),
        getters: Object.assign({}, getterValues, {
          committedDelegations: {}
        })
      }

      const wrapper = mount(PageValidator, {
        localVue,
        mocks: {
          $route: { params: { validator: lcdClientMock.validators[0] } },
          $store
        }
      })

      wrapper.find(`#undelegation-btn`).trigger(`click`)
      expect(wrapper.vm.showCannotModal).toBe(true)
      expect(wrapper.text()).toContain(`delegated to`)
      expect(wrapper.vm.$el).toMatchSnapshot()

      wrapper.find(`#no-atoms-modal__btn`).trigger(`click`)

      expect(wrapper.text()).not.toContain(`delegated to`)
      expect(wrapper.vm.$el).toMatchSnapshot()
    })
  })

  describe(`submitUndelegation`, () => {
    describe(`unit`, () => {
      it(`success`, async () => {
        const $store = {
          commit: jest.fn(),
          dispatch: jest.fn(),
          getters: getterValues
        }

        const {
          vm: { submitUndelegation }
        } = mount(PageValidator, {
          mocks: {
            $route: { params: { validator: lcdClientMock.validators[0] } },
            $store
          }
        })

        $store.dispatch.mockClear()

        await submitUndelegation({ amount: 10 })

        expect($store.dispatch.mock.calls).toEqual([
          [
            `submitDelegation`,
            { stakingTransactions: { unbondings: [{ atoms: -10, validator }] } }
          ]
        ])

        expect($store.commit.mock.calls).toEqual([
          [
            `notify`,
            {
              body: `You have successfully undelegated 10 atoms.`,
              title: `Successful Undelegation!`
            }
          ]
        ])
      })

      it(`error`, async () => {
        const $store = {
          commit: jest.fn(),
          dispatch: jest.fn(),
          getters: getterValues
        }

        const {
          vm: { submitUndelegation }
        } = mount(PageValidator, {
          mocks: {
            $route: { params: { validator: lcdClientMock.validators[0] } },
            $store
          }
        })

        $store.dispatch.mockClear()
        $store.dispatch = jest.fn(() => {
          throw new Error(`message`)
        })

        await submitUndelegation({ amount: 10 })

        expect($store.dispatch.mock.calls).toEqual([
          [
            `submitDelegation`,
            { stakingTransactions: { unbondings: [{ atoms: -10, validator }] } }
          ]
        ])

        expect($store.commit.mock.calls).toEqual([
          [
            `notifyError`,
            {
              body: `message`,
              title: `Error while undelegating atoms`
            }
          ]
        ])
      })

      it(`error with data`, async () => {
        const $store = {
          commit: jest.fn(),
          dispatch: jest.fn(),
          getters: getterValues
        }

        const {
          vm: { submitUndelegation }
        } = mount(PageValidator, {
          mocks: {
            $route: { params: { validator: lcdClientMock.validators[0] } },
            $store
          }
        })

        $store.dispatch.mockClear()
        $store.dispatch = jest.fn(() => {
          throw new Error(`unexpected error`)
        })

        await submitUndelegation({ amount: 10 })

        expect($store.dispatch.mock.calls).toEqual([
          [
            `submitDelegation`,
            {
              stakingTransactions: { unbondings: [{ atoms: -10, validator }] }
            }
          ]
        ])

        expect($store.commit.mock.calls).toEqual([
          [
            `notifyError`,
            {
              body: `unexpected error`,
              title: `Error while undelegating atoms`
            }
          ]
        ])
      })
    })

    describe(`composition`, () => {
      it(`delegation.submitDelegation`, async () => {
        const delegation = Delegation({})

        const dispatch = jest.fn((type, payload) => {
          if (type === `submitDelegation`) {
            delegation.actions[type]($store, payload)
          }
        })

        const $store = {
          commit: jest.fn(),
          dispatch,
          getters: getterValues,
          rootState: getterValues,
          state: {
            committedDelegates: { [lcdClientMock.validators[0]]: 10 },
            unbondingDelegations: {}
          }
        }

        const {
          vm: { submitUndelegation }
        } = mount(PageValidator, {
          mocks: {
            $route: { params: { validator: lcdClientMock.validators[0] } },
            $store
          }
        })

        $store.dispatch.mockClear()

        await submitUndelegation({ amount: 10 })

        expect($store.dispatch.mock.calls).toEqual([
          [
            `submitDelegation`,
            {
              stakingTransactions: {
                unbondings: [
                  {
                    atoms: -10,
                    validator
                  }
                ]
              }
            }
          ],
          [
            `sendTx`,
            {
              begin_unbondings: [
                {
                  delegator_addr: `cosmos15ky9du8a2wlstz6fpx3p4mqpjyrm5ctpesxxn9`,
                  shares: `10.0000000000`,
                  validator_addr: lcdClientMock.validators[0]
                }
              ],
              delegations: undefined,
              to: `cosmos15ky9du8a2wlstz6fpx3p4mqpjyrm5ctpesxxn9`,
              type: `updateDelegations`
            }
          ]
        ])

        expect($store.commit.mock.calls).toEqual([
          [
            `notify`,
            {
              body: `You have successfully undelegated 10 atoms.`,
              title: `Successful Undelegation!`
            }
          ]
        ])
      })
    })
  })
})
