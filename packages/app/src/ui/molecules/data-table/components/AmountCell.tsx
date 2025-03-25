import { Token } from '@/domain/types/Token'
import { cn } from '@/ui/utils/style'
import { NormalizedUnitNumber } from '@sparkdotfi/common-universal'
import { MobileViewOptions } from '../types'

export interface CompactAmountCellFormattingOptions {
  style?: 'auto' | 'compact'
  dimmed?: boolean
  zeroAmountHandling?: 'show-zero' | 'show-dash'
  showUsdValue?: boolean
}

interface AmountCellProps {
  token: Token
  amount: NormalizedUnitNumber
  formattingOptions?: CompactAmountCellFormattingOptions
  mobileViewOptions?: MobileViewOptions
  'data-testid'?: string
}

export function AmountCell({
  amount,
  token,
  formattingOptions,
  mobileViewOptions,
  'data-testid': dataTestId,
}: AmountCellProps) {
  if (mobileViewOptions?.isMobileView) {
    return (
      <div className="flex flex-row items-center justify-between">
        <div className="typography-label-4 w-full text-secondary">{mobileViewOptions.rowTitle}</div>
        <Amount token={token} amount={amount} formattingOptions={formattingOptions} data-testid={dataTestId} />
      </div>
    )
  }

  return <Amount token={token} amount={amount} formattingOptions={formattingOptions} data-testid={dataTestId} />
}

interface CompactValueProps {
  token: Token
  amount: NormalizedUnitNumber
  className?: string
  'data-testid'?: string
  formattingOptions?: CompactAmountCellFormattingOptions
}

function Amount({ token, amount, formattingOptions, className, 'data-testid': dataTestId }: CompactValueProps) {
  const {
    zeroAmountHandling = 'show-dash',
    style = 'auto',
    dimmed = false,
    showUsdValue = true,
  } = formattingOptions ?? {}

  if (amount.isZero() && zeroAmountHandling === 'show-dash') {
    return (
      <div className={cn('flex w-full flex-row justify-end', dimmed && 'text-secondary/70')} data-testid={dataTestId}>
        —
      </div>
    )
  }

  return (
    <div className={cn('flex flex-col', className)} data-testid={dataTestId}>
      <div
        className={cn(
          'typography-label-2 flex w-full flex-row justify-end text-primary',
          dimmed && 'text-neutral-600/70',
        )}
      >
        {token.format(amount, { style: style === 'compact' ? 'compact' : 'auto' })}
      </div>
      {showUsdValue && (
        <div className="flex w-full flex-row justify-end">
          <div className={cn('typography-body-4 text-secondary', dimmed && 'text-neutral-600/30')}>
            {token.formatUSD(amount, { compact: style === 'compact' })}
          </div>
        </div>
      )}
    </div>
  )
}
