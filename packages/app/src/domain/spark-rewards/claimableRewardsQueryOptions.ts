import { spark2ApiUrl } from '@/config/consts'
import { testSparkRewardsConfig } from '@/config/contracts-generated'
import { BaseUnitNumber, Hex, NormalizedNumber } from '@sparkdotfi/common-universal'
import { QueryKey, queryOptions, skipToken } from '@tanstack/react-query'
import { Address, erc20Abi } from 'viem'
import { mainnet } from 'viem/chains'
import { Config } from 'wagmi'
import { readContract } from 'wagmi/actions'
import { z } from 'zod'
import { checkedAddressSchema, hexSchema, normalizedUnitNumberSchema } from '../common/validation'
import { getContractAddress } from '../hooks/useContractAddress'
import { Token } from '../types/Token'
import { TokenSymbol } from '../types/TokenSymbol'

export interface ClaimableRewardsQueryOptionsParams {
  wagmiConfig: Config
  account?: Address
  isInSandbox: boolean
  sandboxChainId: number | undefined
}

const SPARK_REWARDS_CHAIN_IDS = [mainnet.id]

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function claimableRewardsQueryOptions({
  wagmiConfig,
  account,
  isInSandbox,
  sandboxChainId,
}: ClaimableRewardsQueryOptionsParams) {
  // connectedChainId is used to fetch sandbox mock rewards. Unique is used to remove duplicate if connected to supported chain.
  const sparkRewardChainIds = isInSandbox
    ? [...SPARK_REWARDS_CHAIN_IDS, sandboxChainId].filter(Boolean)
    : SPARK_REWARDS_CHAIN_IDS

  return queryOptions({
    queryKey: claimableRewardsQueryKey({ account }),
    queryFn: !account
      ? skipToken
      : async () =>
          (
            await Promise.all(sparkRewardChainIds.map((chainId) => fetchChainRewards(chainId, wagmiConfig, account)))
          ).flat(),
  })
}

export function claimableRewardsQueryKey({ account }: { account?: Address }): QueryKey {
  return ['claimable-spark-rewards', account]
}

export interface ClaimableRewardData {
  merkleRoot: Hex
  epoch: number
  rewardToken: Token
  cumulativeAmount: NormalizedNumber
  pendingAmount: NormalizedNumber
  restrictedCountryCodes: string[]
  preClaimed: NormalizedNumber
  merkleProof: Hex[]
  chainId: number
}

async function fetchChainRewards(
  chainId: number,
  wagmiConfig: Config,
  account: Address,
): Promise<ClaimableRewardData[]> {
  if (import.meta.env.VITE_DEV_SPARK_REWARDS !== '1' && import.meta.env.MODE !== 'test') {
    return []
  }

  const sparkRewardsAddress = getContractAddress(testSparkRewardsConfig.address, chainId)
  const expectedMerkleRoot = await readContract(wagmiConfig, {
    address: sparkRewardsAddress,
    abi: testSparkRewardsConfig.abi,
    functionName: 'merkleRoot',
    chainId,
  })

  const res = await fetch(`${spark2ApiUrl}/rewards/roots/${chainId}/${expectedMerkleRoot}/${account}/`)
  if (!res.ok) {
    throw new Error('Failed to fetch rewards')
  }

  const claimData = claimableRewardsResponseSchema.parse(await res.json())

  return Promise.all(
    claimData.map(async (claim) => {
      const { token_address, epoch } = claim

      const [symbol, name, decimals, preClaimed] = await Promise.all([
        readContract(wagmiConfig, {
          address: token_address,
          abi: erc20Abi,
          functionName: 'symbol',
          chainId,
        }),
        readContract(wagmiConfig, {
          address: token_address,
          abi: erc20Abi,
          functionName: 'name',
          chainId,
        }),
        readContract(wagmiConfig, {
          address: token_address,
          abi: erc20Abi,
          functionName: 'decimals',
          chainId,
        }),
        readContract(wagmiConfig, {
          address: sparkRewardsAddress,
          abi: testSparkRewardsConfig.abi,
          functionName: 'cumulativeClaimed',
          args: [account, token_address, BigInt(epoch)],
          chainId,
        }),
      ])

      const rewardToken = new Token({
        address: claim.token_address,
        symbol: TokenSymbol(symbol),
        name,
        decimals,
        unitPriceUsd: claim.token_price?.toFixed() ?? '0',
      })
      return {
        merkleRoot: claim.root_hash,
        epoch: claim.epoch,
        rewardToken,
        cumulativeAmount: claim.claimable_amount_normalized,
        pendingAmount: claim.pending_amount_normalized,
        restrictedCountryCodes: claim.restricted_country_codes,
        preClaimed: rewardToken.fromBaseUnit(BaseUnitNumber(preClaimed)),
        merkleProof: claim.proof,
        chainId,
      }
    }),
  )
}

const claimableRewardsResponseSchema = z.array(
  z.object({
    root_hash: hexSchema,
    epoch: z.number(),
    wallet_address: checkedAddressSchema,
    token_address: checkedAddressSchema,
    token_price: normalizedUnitNumberSchema.nullish(),
    pending_amount_normalized: normalizedUnitNumberSchema,
    claimable_amount_normalized: normalizedUnitNumberSchema,
    proof: z.array(hexSchema),
    restricted_country_codes: z.array(z.string()),
  }),
)
