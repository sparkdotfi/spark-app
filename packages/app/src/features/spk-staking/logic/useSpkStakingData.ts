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
  raise,
} from '@sparkdotfi/common-universal'
import { QueryKey, queryOptions, useSuspenseQuery } from '@tanstack/react-query'
import { times } from 'remeda'
import { Config } from 'wagmi'
import { getBlock, readContract } from 'wagmi/actions'
import { z } from 'zod'

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

        const nextEpochStart = UnixTime((Number(currentEpoch + 1n) * epochDuration + epochDurationInit) * 1000)

        if (!account) {
          return {
            nextEpochStart,
            withdrawals: [],
          }
        }

        const withdrawalsAmounts = await Promise.all(
          times(Number(currentEpoch), async (i) =>
            readContract(wagmiConfig, {
              address: getContractAddress(testSpkStakingAddress, chainId),
              abi: testSpkStakingAbi,
              functionName: 'withdrawalSharesOf',
              args: [BigInt(i) + 1n, account],
              chainId,
            }),
          ),
        )

        const normalizedWithdrawals = withdrawalsAmounts.map((amount, index) => ({
          epoch: BigInt(index + 1), // when the epoch ends, the withdrawal is claimable
          amount: BaseUnitNumber.toNormalizedUnit(BaseUnitNumber(amount), spk.decimals),
        }))

        const pendingWithdrawal =
          normalizedWithdrawals.find((w) => w.epoch === currentEpoch) ?? raise(new Error('No pending withdrawal found'))

        const formattedPendingWithdrawal = {
          epochs: [pendingWithdrawal.epoch],
          amount: pendingWithdrawal.amount,
          claimableAt: new Date(Number(nextEpochStart)),
        }

        const formattedPreviousWithdrawals = {
          ...normalizedWithdrawals
            .filter((w) => w.epoch < pendingWithdrawal.epoch)
            .reduce(
              (acc, curr) => ({
                epochs: [...acc.epochs, curr.epoch],
                amount: NormalizedUnitNumber(acc.amount.plus(curr.amount)),
              }),
              { epochs: [] as bigint[], amount: NormalizedUnitNumber(0) },
            ),
          claimableAt: new Date((Number(currentEpoch) * epochDuration + epochDurationInit) * 1000),
        }

        return {
          nextEpochStart,
          withdrawals: [formattedPendingWithdrawal, formattedPreviousWithdrawals].filter((w) => !w.amount.isZero()),
        }
      }

      async function fetchTimestamp(): Promise<UnixTime> {
        const { timestamp } = await getBlock(wagmiConfig, {
          chainId,
        })

        return UnixTime(timestamp)
      }

      const [amountStaked, preclaimedRewards, baData, { withdrawals, nextEpochStart }, timestamp] = await Promise.all([
        fetchAmountStaked(),
        fetchPreclaimedRewards(),
        fetchBaData(),
        fetchVaultData(),
        fetchTimestamp(),
      ])

      const pendingAmount = NormalizedUnitNumber(baData.pending_amount_normalized.minus(preclaimedRewards))
      const claimableAmount = NormalizedUnitNumber(baData.cumulative_amount_normalized.minus(preclaimedRewards))

      return {
        amountStaked,
        pendingAmount,
        pendingAmountRate: baData.pending_amount_rate,
        pendingAmountTimestamp: baData.timestamp,
        claimableAmount,
        apy: Percentage(baData.apy),
        withdrawals,
        timestamp,
        nextEpochStart,
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

export interface Withdrawal {
  epochs: bigint[]
  amount: NormalizedUnitNumber
  claimableAt: Date
}

export interface VaultData {
  nextEpochStart: UnixTime
  withdrawals: Withdrawal[]
}

export interface SpkStakingData {
  amountStaked: NormalizedUnitNumber
  pendingAmount: NormalizedUnitNumber
  pendingAmountRate: NormalizedUnitNumber
  pendingAmountTimestamp: number
  claimableAmount: NormalizedUnitNumber
  apy: Percentage
  withdrawals: Withdrawal[]
  timestamp: UnixTime
  nextEpochStart: UnixTime
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
