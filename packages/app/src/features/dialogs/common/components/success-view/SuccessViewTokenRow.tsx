import { Token } from '@/domain/types/Token'
import { TokenIcon } from '@/ui/atoms/token-icon/TokenIcon'
import { testIds } from '@/ui/utils/testIds'
import { NormalizedUnitNumber } from '@sparkdotfi/common-universal'

export interface SuccessViewTokenRowProps {
  token: Token
  amount: NormalizedUnitNumber
  'data-testid'?: string
}

export function SuccessViewTokenRow({ token, amount, 'data-testid': dataTestId }: SuccessViewTokenRowProps) {
  return (
    <div className="mb-2 flex w-full items-center justify-between" data-testid={dataTestId}>
      <div className="flex items-center gap-1">
        <TokenIcon token={token} className="h-5" />
        <span className="typography-label-2 text-primary" data-testid={testIds.component.SuccessView.tokenRow.token}>
          {token.symbol}
        </span>
      </div>
      <div className="flex grow flex-col text-right">
        <div className="typography-label-2 text-primary" data-testid={testIds.component.SuccessView.tokenRow.amount}>
          {token.format(amount, { style: 'auto' })}
        </div>
        <div
          className="typography-label-3 text-secondary"
          data-testid={testIds.component.SuccessView.tokenRow.amountUSD}
        >
          {token.formatUSD(amount)}
        </div>
      </div>
    </div>
  )
}
