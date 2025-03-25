import { paths } from '@/config/paths'
import { SimplifiedQueryResult, transformSimplifiedQueryResult } from '@/domain/common/query'
import { OngoingCampaign } from '@/domain/spark-rewards/ongoingCampaignsQueryOptions'
import { useOngoingCampaignsQuery } from '@/domain/spark-rewards/useOngoingCampaignsQuery'
import { assertNever } from '@sparkdotfi/common-universal'
import { NavigateFunction, generatePath, useNavigate } from 'react-router-dom'
import { Config, useSwitchChain } from 'wagmi'
import { SwitchChainMutate } from 'wagmi/query'
import { OngoingCampaignRow } from '../types'

export type UseOngoingCampaignsResult = SimplifiedQueryResult<OngoingCampaignRow[]>

export function useOngoingCampaigns(): UseOngoingCampaignsResult {
  const ongoingCampaignsResult = useOngoingCampaignsQuery()
  const navigate = useNavigate()
  const { switchChain } = useSwitchChain()

  return transformSimplifiedQueryResult(ongoingCampaignsResult, (data) =>
    data.map((campaign) => ({
      ...campaign,
      involvedTokensSymbols:
        campaign.type === 'sparklend'
          ? [...campaign.depositTokenSymbols, ...campaign.borrowTokenSymbols]
          : campaign.type === 'savings'
            ? campaign.savingsTokenSymbols
            : [],
      onEngageButtonClick: getOnEngageButtonClick({ campaign, navigate, switchChain }),
    })),
  )
}

interface GetOnEngageButtonClickParams {
  campaign: OngoingCampaign
  navigate: NavigateFunction
  switchChain: SwitchChainMutate<Config, unknown>
}
function getOnEngageButtonClick({
  campaign,
  navigate,
  switchChain,
}: GetOnEngageButtonClickParams): OngoingCampaignRow['onEngageButtonClick'] {
  if (campaign.type === 'external' || campaign.type === 'social') {
    return () => {
      window.open(campaign.link, '_blank')
    }
  }

  if (campaign.type === 'sparklend') {
    if (campaign.depositTokenAddresses.length === 1 && campaign.borrowTokenAddresses.length === 0) {
      return () => {
        navigate(
          generatePath(paths.marketDetails, {
            chainId: campaign.chainId.toString(),
            asset: campaign.depositTokenAddresses[0]!,
          }),
        )
        switchChain({ chainId: campaign.chainId })
      }
    }

    if (campaign.depositTokenAddresses.length === 0 && campaign.borrowTokenAddresses.length === 1) {
      return () => {
        navigate(
          generatePath(paths.marketDetails, {
            chainId: campaign.chainId.toString(),
            asset: campaign.borrowTokenAddresses[0]!,
          }),
        )
        switchChain({ chainId: campaign.chainId })
      }
    }

    return () => {
      navigate(generatePath(paths.myPortfolio))
      switchChain({ chainId: campaign.chainId })
    }
  }

  if (campaign.type === 'savings') {
    return () => {
      navigate(generatePath(paths.savings))
      switchChain({ chainId: campaign.chainId })
    }
  }

  assertNever(campaign)
}
