import { USD_MOCK_TOKEN } from '@/domain/types/Token'
import { IconStack } from '@/ui/molecules/icon-stack/IconStack'

import { ExistingPosition } from '../../logic/types'

export interface TokenSummaryProps {
  position: ExistingPosition
  type: 'borrow' | 'deposit'
  maxSymbols?: number
}

export function TokenSummary({ position, type, maxSymbols = 3 }: TokenSummaryProps) {
  const summary = `Already ${type === 'borrow' ? 'borrowed' : 'deposited'} ~${USD_MOCK_TOKEN.formatUSD(
    position.totalValueUSD,
  )}`

  return (
    <div className="flex w-fit items-center gap-2">
      <IconStack items={position.tokens} maxIcons={maxSymbols} />
      <div className="typography-body-3 text-secondary">{summary}</div>
    </div>
  )
}
