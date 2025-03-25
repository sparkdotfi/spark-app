import { Token, USD_MOCK_TOKEN } from '@/domain/types/Token'
import { assets, getTokenImage } from '@/ui/assets'
import HandCoinsIcon from '@/ui/assets/hand-coins.svg?react'
import { Button } from '@/ui/atoms/button/Button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuItemIcon,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/ui/atoms/dropdown/DropdownMenu'
import { testIds } from '@/ui/utils/testIds'
import { NormalizedUnitNumber } from '@sparkdotfi/common-universal'

export interface Reward {
  token: Token
  amount: NormalizedUnitNumber
}

export interface TopbarRewardsProps {
  rewards: Reward[]
  onClaim: () => void
  totalClaimableReward: NormalizedUnitNumber
}
export function TopbarRewards({ rewards, onClaim, totalClaimableReward }: TopbarRewardsProps) {
  if (totalClaimableReward.isZero()) {
    return null
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          data-testid={testIds.topbar.rewards.badge}
          size="m"
          variant="tertiary"
          className="aspect-square [@media(min-width:1080px)]:aspect-auto"
        >
          <img src={assets.giftGradient} alt="Gift icon" className="h-6" />
          <span
            data-testid={testIds.topbar.rewards.claimableRewards}
            className="hidden [@media(min-width:1080px)]:block"
          >
            {USD_MOCK_TOKEN.formatUSD(totalClaimableReward, { compact: true })}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-1" data-testid={testIds.topbar.rewards.details.dropdown}>
        <DropdownMenuGroup className="py-2">
          <DropdownMenuLabel>Rewards</DropdownMenuLabel>

          {rewards.map(({ token, amount }, index) => (
            <DropdownMenuItem
              className="pointer-events-none justify-between py-2"
              key={token.symbol}
              data-testid={testIds.topbar.rewards.details.row(index)}
            >
              <div className="flex items-center gap-2">
                <img src={getTokenImage(token.symbol)} alt={`${token.symbol} icon`} className="h-6" />

                <div className="typography-label-2">
                  <span data-testid={testIds.topbar.rewards.details.amount}>
                    {token.format(amount, { style: 'auto' })}
                  </span>{' '}
                  <span data-testid={testIds.topbar.rewards.details.token}>{token.symbol}</span>
                </div>
              </div>

              <div className="typography-label-4 text-secondary" data-testid={testIds.topbar.rewards.details.amountUSD}>
                {token.formatUSD(amount)}
              </div>
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <button className="cursor-pointer" onClick={onClaim}>
            <DropdownMenuItemIcon icon={HandCoinsIcon} />
            Claim rewards
          </button>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
