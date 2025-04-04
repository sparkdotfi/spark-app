import { Token } from '@/domain/types/Token'
import { TokenIcon } from '@/ui/atoms/token-icon/TokenIcon'
import { testIds } from '@/ui/utils/testIds'
import { NormalizedNumber } from '@sparkdotfi/common-universal'

interface TokenBalanceProps {
  token: Token
  balance: NormalizedNumber
}

export function TokenBalance({ token, balance }: TokenBalanceProps) {
  return (
    <div className="my-4 flex flex-col gap-1">
      <p className="typography-label-4 text-secondary">Balance:</p>
      <div className="flex items-center">
        <TokenIcon token={token} className="mr-2 h-6 w-6" />
        <p className="typography-body-1 text-primary" data-testid={testIds.marketDetails.walletPanel.balance}>
          {token.format(balance, { style: 'auto' })} {token.symbol}
        </p>
      </div>
    </div>
  )
}
