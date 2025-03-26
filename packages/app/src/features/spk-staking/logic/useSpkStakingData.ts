import { spark2ApiUrl } from '@/config/consts'
import {
  testSpkStakingAbi,
  testSpkStakingAddress,
  testStakingRewardsAbi,
  testStakingRewardsAddress,
} from '@/config/contracts-generated'
import { normalizedUnitNumberSchema, percentageSchema } from '@/domain/common/validation'
import { getContractAddress } from '@/domain/hooks/useContractAddress'
import { TokenRepository } from '@/domain/token-repository/TokenRepository'
import { TokenSymbol } from '@/domain/types/TokenSymbol'
import { SuspenseQueryWith } from '@/utils/types'
import {
  BaseUnitNumber,
  CheckedAddress,
  NormalizedUnitNumber,
  Percentage,
  UnixTime,
} from '@sparkdotfi/common-universal'
import { QueryKey, queryOptions, useSuspenseQuery } from '@tanstack/react-query'
import { Config } from 'wagmi'
import { readContract } from 'wagmi/actions'
import { z } from 'zod'
import { SpkStakingEpochs } from '../types'

export interface SpkStakingDataQueryParams {
  chainId: number
  account: CheckedAddress | undefined
  wagmiConfig: Config
  tokenRepository: TokenRepository
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function spkStakingDataQueryOptions({
  chainId,
  account,
  wagmiConfig,
  tokenRepository,
}: SpkStakingDataQueryParams) {
  return queryOptions({
    queryKey: spkStakingDataQueryKey({ account, chainId }),
    queryFn: async () => {
      const spk = tokenRepository.findOneTokenBySymbol(TokenSymbol('SPK'))
      const usds = tokenRepository.findOneTokenBySymbol(TokenSymbol('USDS'))

      async function fetchAmountStaked(): Promise<NormalizedUnitNumber> {
        if (!account) {
          return Promise.resolve(NormalizedUnitNumber(0))
        }
        const balance = await readContract(wagmiConfig, {
          address: getContractAddress(testSpkStakingAddress, chainId),
          abi: testSpkStakingAbi,
          functionName: 'activeSharesOf',
          args: [account],
          chainId,
        })

        return BaseUnitNumber.toNormalizedUnit(BaseUnitNumber(balance), spk.decimals)
      }

      async function fetchEpochs(): Promise<SpkStakingEpochs> {
        const [currentEpoch, epochDuration, epochDurationInit] = await Promise.all([
          readContract(wagmiConfig, {
            address: getContractAddress(testSpkStakingAddress, chainId),
            abi: testSpkStakingAbi,
            functionName: 'currentEpoch',
            chainId,
          }),
          readContract(wagmiConfig, {
            address: getContractAddress(testSpkStakingAddress, chainId),
            abi: testSpkStakingAbi,
            functionName: 'epochDuration',
            chainId,
          }),
          readContract(wagmiConfig, {
            address: getContractAddress(testSpkStakingAddress, chainId),
            abi: testSpkStakingAbi,
            functionName: 'epochDurationInit',
            chainId,
          }),
        ])

        return {
          currentEpoch,
          epochDuration: UnixTime(epochDuration),
          epochDurationInit: UnixTime(epochDurationInit),
        }
      }

      async function fetchPreclaimedRewards(): Promise<NormalizedUnitNumber> {
        if (!account) {
          return Promise.resolve(NormalizedUnitNumber(0))
        }
        const balance = await readContract(wagmiConfig, {
          address: getContractAddress(testStakingRewardsAddress, chainId),
          abi: testStakingRewardsAbi,
          functionName: 'cumulativeClaimed',
          args: [account, usds.address, 1n],
          chainId,
        })

        return BaseUnitNumber.toNormalizedUnit(BaseUnitNumber(balance), usds.decimals)
      }

      async function fetchBaData(): Promise<z.infer<typeof baDataResponseSchema>> {
        const res = await fetch(`${spark2ApiUrl}/spk-staking/${chainId}/${account}/`)
        if (!res.ok) {
          throw new Error('Failed to fetch rewards')
        }

        return baDataResponseSchema.parse(await res.json())
      }

      const [amountStaked, epochs, preclaimedRewards, baData] = await Promise.all([
        fetchAmountStaked(),
        fetchEpochs(),
        fetchPreclaimedRewards(),
        fetchBaData(),
      ])

      const pendingAmount = NormalizedUnitNumber(baData.pending_amount_normalized.minus(preclaimedRewards))
      const claimableAmount = NormalizedUnitNumber(baData.cumulative_amount_normalized.minus(preclaimedRewards))

      return {
        amountStaked,
        epochs,
        pendingAmount,
        pendingAmountRate: baData.pending_amount_rate,
        pendingAmountTimestamp: baData.timestamp,
        claimableAmount,
        apy: Percentage(baData.apy),
        isOutOfSync: !amountStaked.eq(baData.amount_staked),
      }
    },
  })
}

export interface SpkStakingDataQueryKeyParams {
  account: CheckedAddress | undefined
  chainId: number
}

export function spkStakingDataQueryKey({ account, chainId }: SpkStakingDataQueryKeyParams): QueryKey {
  return ['spk-staking', 'spkStakingData', chainId, account]
}

const baDataResponseSchema = z.object({
  amount_staked: normalizedUnitNumberSchema,
  pending_amount_normalized: normalizedUnitNumberSchema,
  pending_amount_rate: normalizedUnitNumberSchema,
  cumulative_amount_normalized: normalizedUnitNumberSchema,
  apy: percentageSchema,
  timestamp: z.number(),
})

export interface SpkStakingData {
  amountStaked: NormalizedUnitNumber
  epochs: SpkStakingEpochs
  pendingAmount: NormalizedUnitNumber
  pendingAmountRate: NormalizedUnitNumber
  pendingAmountTimestamp: number
  claimableAmount: NormalizedUnitNumber
  apy: Percentage
  isOutOfSync: boolean
}

export type UseSpkStakingDataResultOnSuccess = SuspenseQueryWith<{
  spkStakingData: SpkStakingData
}>

export function useSpkStakingData({
  chainId,
  account,
  wagmiConfig,
  tokenRepository,
}: SpkStakingDataQueryParams): UseSpkStakingDataResultOnSuccess {
  const res = useSuspenseQuery(spkStakingDataQueryOptions({ chainId, account, wagmiConfig, tokenRepository }))

  return {
    ...res,
    spkStakingData: res.data,
  }
}
