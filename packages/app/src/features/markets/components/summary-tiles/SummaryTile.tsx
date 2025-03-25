import { USD_MOCK_TOKEN } from '@/domain/types/Token'
import { cn } from '@/ui/utils/style'
import { NormalizedUnitNumber } from '@sparkdotfi/common-universal'

interface SummaryTileProps {
  title: string
  USDValue: NormalizedUnitNumber
  fancy?: boolean
  'data-testid'?: string
}

export function SummaryTile({ title, USDValue, fancy = false, 'data-testid': dataTestId }: SummaryTileProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center rounded-md bg-primary py-5 md:py-8',
        fancy &&
          'bg-[url(/src/ui/assets/markets/fancy-summary-tile-bg.svg)] bg-cover bg-primary-inverse bg-right bg-no-repeat',
      )}
      data-testid={dataTestId}
    >
      <div className={cn('typography-label-4 text-secondary', fancy && 'text-primary-inverse')}>{title}</div>
      <div
        className={cn(
          'typography-heading-3 sm:typography-heading-2 first-letter:typography-heading-4 sm:first-letter:typography-heading-3 relative text-primary',
          fancy && 'bg-gradient-to-r from-20% from-[#FF895D] to-80% to-[#FFE6A4] bg-clip-text text-transparent',
        )}
      >
        ${USD_MOCK_TOKEN.format(USDValue, { style: 'compact' })}
      </div>
    </div>
  )
}
