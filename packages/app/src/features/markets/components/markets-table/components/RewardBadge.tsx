import { formatPercentage } from '@/domain/common/format'
import { TokenSymbol } from '@/domain/types/TokenSymbol'
import { getTokenColor, getTokenImage } from '@/ui/assets'
import { Tooltip, TooltipContent, TooltipContentLayout, TooltipTrigger } from '@/ui/atoms/tooltip/Tooltip'
import { Percentage } from '@sparkdotfi/common-universal'

interface RewardBadgeProps {
  incentivizedReserve: TokenSymbol
  rewardToken: TokenSymbol
  rewardApr: Percentage
  'data-testid'?: string
}

export function RewardBadge({
  incentivizedReserve,
  rewardToken,
  rewardApr,
  'data-testid': dataTestId,
}: RewardBadgeProps) {
  const tokenImage = getTokenImage(rewardToken)
  const borderColor = getTokenColor(rewardToken)
  const formattedRewardApr = formatPercentage(rewardApr)

  return (
    <Tooltip disableHoverableContent>
      <TooltipTrigger asChild>
        <button
          className="flex size-5 items-center justify-center rounded-xxs border outline-none"
          style={{ borderColor }}
          data-testid={dataTestId}
        >
          <img src={tokenImage} alt={rewardToken} className="size-3" />
        </button>
      </TooltipTrigger>
      <TooltipContent variant="long">
        <TooltipContentLayout>
          <TooltipContentLayout.Header>
            {tokenImage && <TooltipContentLayout.Icon src={tokenImage} />}
            <TooltipContentLayout.Title>
              {rewardToken} - {formattedRewardApr} APR
            </TooltipContentLayout.Title>
          </TooltipContentLayout.Header>

          <TooltipContentLayout.Body>
            Participating in the {incentivizedReserve} reserve gives annualized rewards.
          </TooltipContentLayout.Body>
        </TooltipContentLayout>
      </TooltipContent>
    </Tooltip>
  )
}
