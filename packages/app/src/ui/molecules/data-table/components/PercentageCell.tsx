import { formatPercentage } from '@/domain/common/format'
import { Percentage } from '@sparkdotfi/common-universal'

import { MobileViewOptions } from '../types'

interface PercentageCellProps {
  value: Percentage | undefined
  mobileViewOptions?: MobileViewOptions
}

export function PercentageCell({ value, mobileViewOptions }: PercentageCellProps) {
  if (mobileViewOptions?.isMobileView) {
    return (
      <div className="flex flex-row items-center justify-between">
        <div className="typography-label-4 w-full text-secondary">{mobileViewOptions.rowTitle}</div>
        <div>{formatPercentage(value)}</div>
      </div>
    )
  }

  return <div className="flex w-full justify-end">{formatPercentage(value)} </div>
}
