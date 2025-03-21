import { Token } from '@/domain/types/Token'
import { Badge } from '@/ui/atoms/badge/Badge'
import { TokenIcon } from '@/ui/atoms/token-icon/TokenIcon'

export interface StakingTokenCellProps {
  token: Token
}

export function StakingTokenCell({ token }: StakingTokenCellProps) {
  return (
    <div className="typography-label-2 flex flex-row items-center gap-3">
      <TokenIcon token={token} className="size-6" />
      {token.symbol}
      <Badge appearance="soft" size="sm" variant="neutral">
        Staking token
      </Badge>
    </div>
  )
}
