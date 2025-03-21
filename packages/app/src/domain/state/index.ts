import { DeepPartial } from 'react-hook-form'
import { mergeDeep } from 'remeda'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import { ZUSTAND_APP_STORE_LOCAL_STORAGE_KEY, ZUSTAND_APP_STORE_LOCAL_STORAGE_VERSION } from '@/config/consts'
import { filterOutUndefinedKeys } from '@/utils/object'
import { Serializable } from '@/utils/types'

import { AppConfig, getAppConfig } from '../../config/feature-flags'
import {
  ActionsSettings,
  ActionsSettingsSlice,
  PersistedActionsSettingsSlice,
  initActionsSettingsSlice,
  persistActionsSettingsSlice,
  unPersistActionsSettingsSlice,
} from './actions-settings'
import { AnalyticsSlice, initAnalyticsSlice, persistAnalyticsSlice } from './analytics'
import { BannersVisibilitySlice, initBannersVisibilitySlice, persistBannersVisibilitySlice } from './bannersVisibility'
import { ComplianceSlice, PersistedComplianceSlice, initComplianceSlice, persistComplianceSlice } from './compliance'
import { DialogSlice, initDialogSlice } from './dialogs'
import {
  PersistedSandboxSlice,
  SandboxSlice,
  initSandboxSlice,
  persistSandboxSlice,
  unPersistSandboxSlice,
} from './sandbox'

export type StoreState = {
  appConfig: AppConfig
} & DialogSlice &
  SandboxSlice &
  ActionsSettingsSlice &
  ComplianceSlice &
  AnalyticsSlice &
  BannersVisibilitySlice

export type PersistedState = Serializable<
  PersistedSandboxSlice & PersistedActionsSettingsSlice & PersistedComplianceSlice
>

export const storeImplementation = persist<StoreState, [], [], PersistedState>(
  function initializer(...a): StoreState {
    return {
      ...initDialogSlice(...a),
      ...initActionsSettingsSlice(...a),
      ...initComplianceSlice(...a),
      ...initAnalyticsSlice(...a),
      ...initSandboxSlice(...a),
      ...initBannersVisibilitySlice(...a),
      appConfig: getAppConfig(),
    }
  },
  {
    name: ZUSTAND_APP_STORE_LOCAL_STORAGE_KEY,
    version: ZUSTAND_APP_STORE_LOCAL_STORAGE_VERSION,
    partialize: (state): PersistedState => ({
      ...persistSandboxSlice(state),
      ...persistActionsSettingsSlice(state),
      ...persistComplianceSlice(state),
      ...persistAnalyticsSlice(state),
      ...persistBannersVisibilitySlice(state),
    }),
    merge: (_persistedState, currentState) => {
      const persistedState = (_persistedState ?? {}) as DeepPartial<PersistedState>
      const { sandbox, actionsSettings, ...rest } = persistedState

      const processedPersistedState = filterOutUndefinedKeys({
        ...rest,
        actionsSettings: unPersistActionsSettingsSlice(persistedState).actionsSettings,
        sandbox: unPersistSandboxSlice(persistedState).sandbox,
      })

      return mergeDeep(currentState, processedPersistedState) as StoreState
    },
  },
)

export const useStore = create<StoreState>()(storeImplementation)

export function useActionsSettings(): ActionsSettings {
  return useStore((state) => state.actionsSettings)
}
