import { infoSkyApiUrl, spark2ApiUrl } from '@/config/consts'
import {
  testSpkStakingAbi,
  testSpkStakingAddress,
  testStakingRewardsAbi,
  testStakingRewardsAddress,
} from '@/config/contracts-generated'
import { hexSchema, normalizedNumberSchema, percentageSchema } from '@/domain/common/validation'
import { getContractAddress } from '@/domain/hooks/useContractAddress'
import { TokenRepository } from '@/domain/token-repository/TokenRepository'
import { TokenSymbol } from '@/domain/types/TokenSymbol'
import { SuspenseQueryWith } from '@/utils/types'
import { BaseUnitNumber, CheckedAddress, Hex, NormalizedNumber, UnixTime } from '@sparkdotfi/common-universal'
import { QueryKey, queryOptions, useSuspenseQuery } from '@tanstack/react-query'
import { range } from 'remeda'
import { Address } from 'viem'
import { Config } from 'wagmi'
import { getBlock, readContract } from 'wagmi/actions'
import { z } from 'zod'
import { GeneralStats } from '../types'

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

      async function fetchAmountStaked(): Promise<NormalizedNumber> {
        if (!account) {
          return Promise.resolve(NormalizedNumber.ZERO)
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

      async function fetchPreclaimedRewards(): Promise<NormalizedNumber> {
        if (!account) {
          return Promise.resolve(NormalizedNumber.ZERO)
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

      async function fetchWalletRewardsData(): Promise<z.infer<typeof baDataResponseSchema> & { merkle_root: Hex }> {
        if (!account) {
          return {
            amount_staked: NormalizedNumber.ZERO,
            pending_amount_normalized: NormalizedNumber.ZERO,
            pending_amount_rate: NormalizedNumber.ZERO,
            cumulative_amount_normalized: NormalizedNumber.ZERO,
            timestamp: 0,
            epoch: 0,
            proof: [],
            merkle_root: Hex.random(),
          }
        }

        const merkleRoot = await readContract(wagmiConfig, {
          address: getContractAddress(testStakingRewardsAddress, chainId),
          abi: testStakingRewardsAbi,
          functionName: 'merkleRoot',
          chainId,
        })

        const res = await fetch(`${spark2ApiUrl}/spk-staking/${chainId}/${merkleRoot}/${account}/`)
        if (!res.ok) {
          throw new Error('Failed to fetch rewards')
        }

        return {
          ...baDataResponseSchema.parse(await res.json()),
          merkle_root: Hex(merkleRoot),
        }
      }

      async function fetchVaultData(): Promise<VaultData> {
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

        const nextEpochEnd = UnixTime(Number(currentEpoch + 2n) * epochDuration + epochDurationInit)

        if (!account) {
          return {
            nextEpochEnd,
            withdrawals: [],
          }
        }

        const withdrawals = await Promise.all(
          range(Math.max(0, Number(currentEpoch) - 25), Number(currentEpoch) + 1).map(async (i) => {
            const epoch = BigInt(i) + 1n

            const [amount, isWithdrawalsClaimed] = await Promise.all([
              readContract(wagmiConfig, {
                address: getContractAddress(testSpkStakingAddress, chainId),
                abi: testSpkStakingAbi,
                functionName: 'withdrawalSharesOf',
                args: [epoch, account],
                chainId,
              }),
              readContract(wagmiConfig, {
                address: getContractAddress(testSpkStakingAddress, chainId),
                abi: testSpkStakingAbi,
                functionName: 'isWithdrawalsClaimed',
                args: [epoch, account],
                chainId,
              }),
            ])

            return {
              epoch,
              amount: BaseUnitNumber.toNormalizedUnit(BaseUnitNumber(amount), spk.decimals),
              isWithdrawalsClaimed,
            }
          }),
        )

        const pendingWithdrawals = withdrawals.filter((w) => w.epoch >= currentEpoch)

        const formattedPendingWithdrawals = pendingWithdrawals.map((w) => ({
          epochs: [w.epoch],
          amount: w.amount,
          claimableAt: new Date(
            UnixTime.toMilliseconds(UnixTime(Number(w.epoch + 1n) * epochDuration + epochDurationInit)),
          ),
        }))

        const aggregatedPreviousWithdrawals = {
          ...withdrawals
            .filter((w) => w.epoch < currentEpoch)
            .filter((w) => w.amount.gt(0))
            .filter((w) => !w.isWithdrawalsClaimed)
            .reduce(
              (acc, curr) => ({
                epochs: [...acc.epochs, curr.epoch],
                amount: acc.amount.plus(curr.amount),
              }),
              { epochs: [] as bigint[], amount: NormalizedNumber.ZERO },
            ),
          claimableAt: new Date(
            UnixTime.toMilliseconds(UnixTime(Number(currentEpoch) * epochDuration + epochDurationInit)),
          ),
        }

        return {
          nextEpochEnd,
          withdrawals: [...formattedPendingWithdrawals, aggregatedPreviousWithdrawals].filter(
            (w) => !w.amount.isZero(),
          ),
        }
      }

      async function fetchTimestamp(): Promise<UnixTime> {
        const { timestamp } = await getBlock(wagmiConfig, {
          chainId,
        })

        return UnixTime(timestamp)
      }

      async function fetchGeneralStats(): Promise<GeneralStats> {
        const response = await fetch(`${infoSkyApiUrl}/spk-staking/stats/`)
        if (!response.ok) {
          throw new Error('Error fetching SPK staking stats')
        }
        const result = await response.json()
        const parsedResult = generalStatsResponseSchema.parse(result)

        return {
          tvl: parsedResult.tvl,
          stakers: parsedResult.stakers,
          apr: parsedResult.apr,
        }
      }

      const [
        amountStaked,
        preclaimedRewards,
        walletRewardsData,
        { withdrawals, nextEpochEnd },
        timestamp,
        generalStats,
      ] = await Promise.all([
        fetchAmountStaked(),
        fetchPreclaimedRewards(),
        fetchWalletRewardsData(),
        fetchVaultData(),
        fetchTimestamp(),
        fetchGeneralStats(),
      ])

      const pendingAmount = walletRewardsData.pending_amount_normalized.minus(preclaimedRewards)
      const rewardsClaimableAmount = walletRewardsData.cumulative_amount_normalized.minus(preclaimedRewards)

      return {
        amountStaked,
        pendingAmount,
        pendingAmountRate: walletRewardsData.pending_amount_rate,
        pendingAmountTimestamp: walletRewardsData.timestamp,
        withdrawals,
        generalStats,
        timestamp,
        nextEpochEnd,
        rewardsEpoch: walletRewardsData.epoch,
        rewardsProof: walletRewardsData.proof,
        rewardsRoot: walletRewardsData.merkle_root,
        rewardsCumulativeAmount: walletRewardsData.cumulative_amount_normalized,
        rewardsClaimableAmount,
        isOutOfSync: !amountStaked.eq(walletRewardsData.amount_staked),
      }
    },
    refetchInterval: (query) => {
      if (query.state.data?.isOutOfSync) {
        return 2_000
      }

      return undefined
    },
  })
}

export interface SpkStakingDataQueryKeyParams {
  account: Address | undefined
  chainId: number
}

export function spkStakingDataQueryKey({ account, chainId }: SpkStakingDataQueryKeyParams): QueryKey {
  return ['spk-staking', 'spkStakingData', chainId, account]
}

const baDataResponseSchema = z.object({
  amount_staked: normalizedNumberSchema,
  pending_amount_normalized: normalizedNumberSchema,
  pending_amount_rate: normalizedNumberSchema,
  cumulative_amount_normalized: normalizedNumberSchema,
  timestamp: z.number(),
  epoch: z.number(),
  proof: z.array(hexSchema),
})

const generalStatsResponseSchema = z
  .object({
    tvl: normalizedNumberSchema,
    number_of_wallets: z.number(),
    apr: percentageSchema,
  })
  .transform((o) => ({
    tvl: o.tvl,
    stakers: o.number_of_wallets,
    apr: o.apr,
  }))

export interface Withdrawal {
  epochs: bigint[]
  amount: NormalizedNumber
  claimableAt: Date
}

export interface VaultData {
  nextEpochEnd: UnixTime
  withdrawals: Withdrawal[]
}

export interface SpkStakingData {
  amountStaked: NormalizedNumber
  pendingAmount: NormalizedNumber
  pendingAmountRate: NormalizedNumber
  pendingAmountTimestamp: number
  generalStats: GeneralStats
  withdrawals: Withdrawal[]
  timestamp: UnixTime
  nextEpochEnd: UnixTime
  rewardsEpoch: number
  rewardsProof: Hex[]
  rewardsRoot: Hex
  rewardsCumulativeAmount: NormalizedNumber
  rewardsClaimableAmount: NormalizedNumber
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
