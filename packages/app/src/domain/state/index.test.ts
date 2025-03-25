import { expect } from 'vitest'
import { create } from 'zustand'

import { ZUSTAND_APP_STORE_LOCAL_STORAGE_KEY } from '@/config/consts'
import { makeFunctionsComparisonStable } from '@/test/integration/object-utils'

import { Percentage } from '@sparkdotfi/common-universal'
import { StoreState, storeImplementation } from '.'

describe(storeImplementation.name, () => {
  afterEach(() => localStorage.clear())

  it('initializes store', () => {
    const store = create(storeImplementation)
    expect(store.getState()).toMatchSnapshot()
  })

  it('persists state', () => {
    expect(localStorage.getItem(ZUSTAND_APP_STORE_LOCAL_STORAGE_KEY)).toBeNull()

    const store = create(storeImplementation)
    store.setState((s) => s) // triggers state persistence into local storage

    expect(JSON.parse(localStorage.getItem(ZUSTAND_APP_STORE_LOCAL_STORAGE_KEY) as any)).toMatchSnapshot()
  })

  it('deserializes initial state back from the local storage', () => {
    expect(localStorage.getItem(ZUSTAND_APP_STORE_LOCAL_STORAGE_KEY)).toBeNull()

    let expectedState: StoreState
    {
      const store = create(storeImplementation)
      expectedState = store.getState() // extract initial state which should be always fully correct
      store.setState(() => ({})) // triggers state persistence into local storage
    }

    // second store creation should deserialize persisted state from local storage
    expect(localStorage.getItem(ZUSTAND_APP_STORE_LOCAL_STORAGE_KEY)).not.toBeNull()
    const store = create(storeImplementation)
    const stateDeserializedFromLocalStorage = store.getState()

    expect(makeFunctionsComparisonStable(stateDeserializedFromLocalStorage)).toEqual(
      makeFunctionsComparisonStable(expectedState),
    )
  })

  it('deserializes sandbox slice correctly', () => {
    expect(localStorage.getItem(ZUSTAND_APP_STORE_LOCAL_STORAGE_KEY)).toBeNull()

    let expectedState: StoreState
    {
      const store = create(storeImplementation)
      store.setState((s) => ({
        sandbox: {
          ...s.sandbox,

          network: {
            name: 'name',
            forkUrl: 'forkUrl',
            originChainId: 1,
            forkChainId: 2,
            createdAt: new Date(),
            ephemeralAccountPrivateKey: '0x123',
          },
        },
      })) // triggers state persistence into local storage
      expectedState = store.getState() // extract whole state which should be always fully correct
    }

    // second store creation should deserialize persisted state from local storage
    expect(localStorage.getItem(ZUSTAND_APP_STORE_LOCAL_STORAGE_KEY)).not.toBeNull()
    const store = create(storeImplementation)
    const stateDeserializedFromLocalStorage = store.getState()

    expect(makeFunctionsComparisonStable(stateDeserializedFromLocalStorage)).toEqual(
      makeFunctionsComparisonStable(expectedState),
    )
  })

  it('deserializes modified state back from the local storage', () => {
    expect(localStorage.getItem(ZUSTAND_APP_STORE_LOCAL_STORAGE_KEY)).toBeNull()

    let expectedState: StoreState
    {
      const store = create(storeImplementation)
      // modify maxSlippage and trigger state persistence into local storage
      store.setState((s) => ({
        actionsSettings: {
          ...s.actionsSettings,
          exchangeMaxSlippage: Percentage(0.1),
        },
      }))
      expectedState = store.getState()
    }

    // second store creation should deserialize persisted state from local storage
    expect(localStorage.getItem(ZUSTAND_APP_STORE_LOCAL_STORAGE_KEY)).not.toBeNull()
    const store = create(storeImplementation)
    const stateDeserializedFromLocalStorage = store.getState()

    expect(makeFunctionsComparisonStable(stateDeserializedFromLocalStorage)).toEqual(
      makeFunctionsComparisonStable(expectedState),
    )
  })

  it('ignores previous version of the persisted store', () => {
    expect(localStorage.getItem(ZUSTAND_APP_STORE_LOCAL_STORAGE_KEY)).toBeNull()

    let expectedState: StoreState // initial state without any modification is expected
    {
      const store = create(storeImplementation)
      expectedState = store.getState()
      // modify maxSlippage and trigger state persistence into local storage
      store.setState((s) => ({
        actionsSettings: {
          ...s.actionsSettings,
          exchangeMaxSlippage: Percentage(0.1),
        },
      }))
    }

    // modify "version" parameter stored inside local storage to make it obsolete
    const rawPersistedState = localStorage.getItem(ZUSTAND_APP_STORE_LOCAL_STORAGE_KEY)
    const persistedState = JSON.parse(rawPersistedState!) as any
    persistedState.version = 0
    localStorage.setItem(ZUSTAND_APP_STORE_LOCAL_STORAGE_KEY, JSON.stringify(persistedState))

    // second store creation should deserialize persisted state from local storage
    const store = create(storeImplementation)
    const stateDeserializedFromLocalStorage = store.getState()

    expect(makeFunctionsComparisonStable(stateDeserializedFromLocalStorage)).toEqual(
      makeFunctionsComparisonStable(expectedState),
    )
  })
})
