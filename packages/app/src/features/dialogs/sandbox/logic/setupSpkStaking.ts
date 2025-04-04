import { infoSkyApiUrl, spark2ApiUrl } from '@/config/consts'
import { testSpkStakingAddress, testStakingRewardsAbi, testStakingRewardsAddress } from '@/config/contracts-generated'
import { getContractAddress } from '@/domain/hooks/useContractAddress'
import { CheckedAddress, Hash, Hex, UnixTime } from '@sparkdotfi/common-universal'
import { http, HttpResponse } from 'msw'
import type { SetupWorker } from 'msw/browser'
import { mergeDeep } from 'remeda'
import { concat, pad, slice, toHex } from 'viem'
import { mainnet } from 'viem/chains'
import { TestnetClient } from '../tenderly/TenderlyClient'

// Default mock data
const DEFAULT_WALLET_DATA = {
  amount_staked: '0',
  pending_amount_normalized: '0',
  pending_amount_rate: '0',
  cumulative_amount_normalized: '0',
  timestamp: Math.ceil(Date.now() / 1000),
  epoch: 1,
  merkle_root: Hex.random(),
  proof: [] as Hex[],
}

const DEFAULT_STATS_DATA = {
  tvl: '5630000',
  number_of_wallets: 78,
  apr: '0.0473',
}

export interface SpkStakingEndpointsConfig {
  walletData: typeof DEFAULT_WALLET_DATA
  statsData: typeof DEFAULT_STATS_DATA
  sandboxChainId: number
  account: CheckedAddress
}

let currentConfig: SpkStakingEndpointsConfig = {
  walletData: DEFAULT_WALLET_DATA,
  statsData: DEFAULT_STATS_DATA,
  sandboxChainId: mainnet.id,
  account: CheckedAddress.random(),
} // global state, yes

export interface SetupSpkStakingParams {
  msw: SetupWorker
  testnetClient: TestnetClient
  account: CheckedAddress
  sandboxChainId: number
}

export async function setupSpkStaking({
  msw,
  testnetClient,
  account,
  sandboxChainId,
}: SetupSpkStakingParams): Promise<void> {
  await setEpochDurationStorage(
    testnetClient,
    getContractAddress(testSpkStakingAddress, mainnet.id),
    Number(UnixTime.ONE_MINUTE()),
  )

  const merkleRoot = await testnetClient.readContract({
    address: getContractAddress(testStakingRewardsAddress, mainnet.id),
    abi: testStakingRewardsAbi,
    functionName: 'merkleRoot',
    args: [],
  })

  currentConfig = {
    walletData: {
      ...DEFAULT_WALLET_DATA,
      merkle_root: Hex(merkleRoot),
    },
    statsData: DEFAULT_STATS_DATA,
    sandboxChainId,
    account,
  }

  msw.use(
    http.get(`${spark2ApiUrl}/spk-staking/${sandboxChainId}/${merkleRoot}/${account}/`, () => {
      return HttpResponse.json(currentConfig.walletData)
    }),
    http.get(`${infoSkyApiUrl}/spk-staking/stats/`, () => {
      return HttpResponse.json(currentConfig.statsData)
    }),
  )
}

type RecursivePartial<T> = {
  [P in keyof T]?: T[P] extends (infer U)[]
    ? RecursivePartial<U>[]
    : T[P] extends object | undefined
      ? RecursivePartial<T[P]>
      : T[P]
}

export function getEndpointsConfig(): SpkStakingEndpointsConfig {
  return currentConfig
}

export function updateEndpoints(msw: SetupWorker, newConfig: RecursivePartial<SpkStakingEndpointsConfig>): void {
  currentConfig = mergeDeep(currentConfig, newConfig) as SpkStakingEndpointsConfig

  msw.resetHandlers(
    http.get(
      `${spark2ApiUrl}/spk-staking/${currentConfig.sandboxChainId}/${currentConfig.walletData.merkle_root}/${currentConfig.account}/`,
      () => {
        return HttpResponse.json(currentConfig.walletData)
      },
    ),
    http.get(`${infoSkyApiUrl}/spk-staking/stats/`, () => {
      return HttpResponse.json(currentConfig.statsData)
    }),
  )
}

async function setEpochDurationStorage(
  testnetClient: TestnetClient,
  spkStakingVaultAddress: CheckedAddress,
  newEpochDuration: number,
): Promise<void> {
  const VAULT_TOKENIZED_SLOT_EPOCH_DURATION = 1n
  const EPOCH_DURATION_OFFSET_BYTES = 26
  const EPOCH_DURATION_SIZE_BYTES = 6
  const SLOT_SIZE_BYTES = 32

  const slotIndexHex = Hash(pad(toHex(VAULT_TOKENIZED_SLOT_EPOCH_DURATION), { size: SLOT_SIZE_BYTES }))

  const oldStorageValue = await testnetClient.getStorageAt({
    address: spkStakingVaultAddress,
    slot: slotIndexHex,
  })

  if (!oldStorageValue) {
    throw new Error('Failed to read storage slot')
  }

  const encodedDuration = pad(toHex(newEpochDuration), { size: EPOCH_DURATION_SIZE_BYTES })
  const newStorageValue = concat([
    encodedDuration,
    slice(oldStorageValue, SLOT_SIZE_BYTES - EPOCH_DURATION_OFFSET_BYTES),
  ])

  await testnetClient.setStorageAt(spkStakingVaultAddress, slotIndexHex, newStorageValue)
}
