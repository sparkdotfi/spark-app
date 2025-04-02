import { getChainConfigEntry } from '@/config/chain'
import { aaveDataLayer, aaveDataLayerQueryKey } from '@/domain/market-info/aave-data-layer/query'
import { marketInfoSelectFn } from '@/domain/market-info/marketInfo'
import { useOpenDialog } from '@/domain/state/dialogs'
import { claimRewardsDialogConfig } from '@/features/dialogs/claim-rewards/ClaimRewardsDialog'
import { NormalizedNumber } from '@sparkdotfi/common-universal'
import { CheckedAddress } from '@sparkdotfi/common-universal'
import { skipToken, useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { useConfig } from 'wagmi'
import { TopbarRewardsProps } from '../components/topbar-rewards/TopbarRewards'

interface UseRewardsInfoParams {
  chainId: number
  address: CheckedAddress | undefined
}

export function useRewardsInfo({ chainId, address }: UseRewardsInfoParams): TopbarRewardsProps {
  const wagmiConfig = useConfig()
  const { markets: marketsAvailable } = getChainConfigEntry(chainId)

  const marketInfo = useQuery({
    queryKey: aaveDataLayerQueryKey({ chainId, account: address }),
    queryFn: marketsAvailable ? aaveDataLayer({ wagmiConfig, account: address, chainId }).queryFn : skipToken,
    select: useMemo(() => marketInfoSelectFn(), []),
  })

  const openDialog = useOpenDialog()

  const rewards = (marketInfo.data?.userRewards ?? []).map((reward) => ({
    token: reward.token,
    amount: reward.value,
  }))

  const totalClaimableReward = rewards.reduce(
    (acc, { token, amount }) => NormalizedNumber(acc.plus(token.toUSD(amount))),
    NormalizedNumber.ZERO,
  )

  return {
    rewards,
    totalClaimableReward,
    onClaim: () => {
      openDialog(claimRewardsDialogConfig, {})
    },
  }
}
