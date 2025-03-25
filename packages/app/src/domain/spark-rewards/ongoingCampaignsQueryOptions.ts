import { spark2ApiUrl } from '@/config/consts'
import { checkedAddressSchema, percentageSchema } from '@/domain/common/validation'
import { TokenSymbol } from '@/domain/types/TokenSymbol'
import { CheckedAddress, Percentage, assertNever } from '@sparkdotfi/common-universal'
import { queryOptions } from '@tanstack/react-query'
import { Address, erc20Abi } from 'viem'
import { Config } from 'wagmi'
import { readContract } from 'wagmi/actions'
import { z } from 'zod'

export interface OngoingCampaignsQueryOptionsParams {
  wagmiConfig: Config
  isInSandbox: boolean
}

export type OngoingCampaign = {
  id: string
  shortDescription: string
  longDescription: string
  rewardTokenSymbol: TokenSymbol
  rewardChainId: number
  restrictedCountryCodes: string[]
} & (
  | {
      type: 'sparklend'
      apy?: Percentage
      depositTokenSymbols: TokenSymbol[]
      borrowTokenSymbols: TokenSymbol[]
      depositTokenAddresses: Address[]
      borrowTokenAddresses: Address[]
      chainId: number
    }
  | {
      type: 'savings'
      apy?: Percentage
      savingsTokenSymbols: TokenSymbol[]
      savingsTokenAddresses: Address[]
      chainId: number
    }
  | {
      type: 'social'
      platform: 'x' | 'discord'
      link: string
    }
  | {
      type: 'external'
      link: string
    }
)

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function ongoingCampaignsQueryOptions({ wagmiConfig, isInSandbox }: OngoingCampaignsQueryOptionsParams) {
  return queryOptions<OngoingCampaign[]>({
    queryKey: ['ongoing-campaigns', isInSandbox],
    queryFn: async () => {
      if (import.meta.env.VITE_DEV_SPARK_REWARDS !== '1' && import.meta.env.MODE !== 'test') {
        return []
      }

      const response = await fetch(`${spark2ApiUrl}/rewards/campaigns/`)
      if (!response.ok) {
        throw new Error('Error fetching ongoing campaigns')
      }
      const campaignsData = ongoingCampaignsResponseSchema.parse(await response.json())

      return Promise.all(
        campaignsData
          .filter((campaign) => campaign.reward_token_address !== CheckedAddress.ZERO())
          .map(async (campaign) => {
            async function fetchTokenSymbol(chainId: number, address: Address): Promise<string> {
              return readContract(wagmiConfig, {
                address,
                abi: erc20Abi,
                functionName: 'symbol',
                chainId,
              })
            }

            const [rewardTokenSymbol, depositTokenSymbols, borrowTokenSymbols, savingsTokenSymbols] = await Promise.all(
              [
                fetchTokenSymbol(campaign.reward_chain_id, campaign.reward_token_address),
                Promise.all(
                  campaign.type === 'sparklend'
                    ? campaign.deposit_token_addresses.map((address) => fetchTokenSymbol(campaign.chain_id, address))
                    : [],
                ),
                Promise.all(
                  campaign.type === 'sparklend'
                    ? campaign.borrow_token_addresses.map((address) => fetchTokenSymbol(campaign.chain_id, address))
                    : [],
                ),
                Promise.all(
                  campaign.type === 'savings'
                    ? campaign.savings_token_addresses.map((address) => fetchTokenSymbol(campaign.chain_id, address))
                    : [],
                ),
              ],
            )

            const commonProps = {
              id: campaign.campaign_uid,
              shortDescription: campaign.short_description,
              longDescription: campaign.long_description,
              restrictedCountryCodes: campaign.restricted_country_codes,
              rewardTokenSymbol: TokenSymbol(rewardTokenSymbol),
              rewardChainId: campaign.reward_chain_id,
            }

            switch (campaign.type) {
              case 'sparklend':
                return {
                  ...commonProps,
                  type: campaign.type,
                  apy: campaign.apy ? Percentage(campaign.apy) : undefined,
                  depositTokenSymbols: depositTokenSymbols.map(TokenSymbol),
                  borrowTokenSymbols: borrowTokenSymbols.map(TokenSymbol),
                  depositTokenAddresses: campaign.deposit_token_addresses,
                  borrowTokenAddresses: campaign.borrow_token_addresses,
                  chainId: campaign.chain_id,
                }
              case 'savings':
                return {
                  ...commonProps,
                  type: campaign.type,
                  apy: campaign.apy ? Percentage(campaign.apy) : undefined,
                  savingsTokenSymbols: savingsTokenSymbols.map(TokenSymbol),
                  savingsTokenAddresses: campaign.savings_token_addresses,
                  chainId: campaign.chain_id,
                }
              case 'social':
                return {
                  ...commonProps,
                  type: 'social',
                  platform: campaign.platform,
                  link: campaign.link,
                }
              case 'external':
                return {
                  ...commonProps,
                  type: 'external',
                  link: campaign.link,
                }
              default:
                assertNever(campaign)
            }
          }),
      )
    },
  })
}

const baseOngoingCampaignSchema = z.object({
  campaign_uid: z.string(),
  short_description: z.string(),
  long_description: z.string(),
  restricted_country_codes: z.array(z.string()),
  reward_token_address: checkedAddressSchema,
  reward_chain_id: z.number(),
})

export const ongoingCampaignsResponseSchema = z.array(
  z.discriminatedUnion('type', [
    baseOngoingCampaignSchema.extend({
      type: z.literal('sparklend'),
      apy: percentageSchema.nullable(),
      deposit_token_addresses: z.array(checkedAddressSchema),
      borrow_token_addresses: z.array(checkedAddressSchema),
      chain_id: z.number(),
    }),
    baseOngoingCampaignSchema.extend({
      type: z.literal('savings'),
      apy: percentageSchema.nullable(),
      savings_token_addresses: z.array(checkedAddressSchema),
      chain_id: z.number(),
    }),
    baseOngoingCampaignSchema.extend({
      type: z.literal('social'),
      platform: z.enum(['x', 'discord']),
      link: z.string(),
    }),
    baseOngoingCampaignSchema.extend({
      type: z.literal('external'),
      link: z.string(),
    }),
  ]),
)
