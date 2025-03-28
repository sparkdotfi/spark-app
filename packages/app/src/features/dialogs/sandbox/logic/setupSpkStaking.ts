import { infoSkyApiUrl, spark2ApiUrl } from '@/config/consts'
import { CheckedAddress } from '@sparkdotfi/common-universal'
import { http, HttpResponse } from 'msw'
import type { SetupWorker } from 'msw/browser'
import { mergeDeep } from 'remeda'

// Default mock data
const DEFAULT_WALLET_DATA = {
  amount_staked: '0',
  pending_amount_normalized: '0',
  pending_amount_rate: '0',
  cumulative_amount_normalized: '0',
  timestamp: Date.now(),
}

const DEFAULT_STATS_DATA = {
  tvl: '563000000',
  number_of_wallets: 78,
  apr: '0.0473',
}

export interface SpkStakingEndpointsConfig {
  walletData: typeof DEFAULT_WALLET_DATA
  statsData: typeof DEFAULT_STATS_DATA
}

export interface SetupSpkStakingParams {
  msw: SetupWorker
  account: CheckedAddress
  sandboxChainId: number
}

export async function setupSpkStaking({ msw, account, sandboxChainId }: SetupSpkStakingParams): Promise<{
  updateEndpoints: (newConfig: RecursivePartial<SpkStakingEndpointsConfig>) => void
}> {
  let currentConfig: SpkStakingEndpointsConfig = {
    walletData: DEFAULT_WALLET_DATA,
    statsData: DEFAULT_STATS_DATA,
  }

  msw.use(
    http.get(`${spark2ApiUrl}/spk-staking/${sandboxChainId}/${account}/`, () => {
      return HttpResponse.json(currentConfig.walletData)
    }),
    http.get(`${infoSkyApiUrl}/spk-staking/stats/`, () => {
      return HttpResponse.json(currentConfig.statsData)
    }),
  )

  function updateEndpoints(newConfig: RecursivePartial<SpkStakingEndpointsConfig>): void {
    currentConfig = mergeDeep(currentConfig, newConfig) as SpkStakingEndpointsConfig

    msw.resetHandlers(
      http.get(`${spark2ApiUrl}/spk-staking/${sandboxChainId}/${account}/`, () => {
        return HttpResponse.json(currentConfig.walletData)
      }),
      http.get(`${infoSkyApiUrl}/spk-staking/stats/`, () => {
        return HttpResponse.json(currentConfig.statsData)
      }),
    )
  }

  return {
    updateEndpoints,
  }
}

type RecursivePartial<T> = {
  [P in keyof T]?: T[P] extends (infer U)[]
    ? RecursivePartial<U>[]
    : T[P] extends object | undefined
      ? RecursivePartial<T[P]>
      : T[P]
}
