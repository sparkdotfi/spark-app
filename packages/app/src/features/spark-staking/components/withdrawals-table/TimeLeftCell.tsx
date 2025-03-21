import { MobileViewOptions } from '@/ui/molecules/data-table/types'
import { UnixTime } from '@marsfoundation/common-universal'

export interface TimeLeftCellProps {
  timeLeft: UnixTime
  targetDate: Date
  mobileViewOptions?: MobileViewOptions
}

export function TimeLeftCell({ timeLeft, targetDate, mobileViewOptions }: TimeLeftCellProps) {
  if (mobileViewOptions?.isMobileView) {
    return (
      <div className="flex flex-row items-center justify-between">
        <div className="typography-label-4 text-secondary">{mobileViewOptions.rowTitle}</div>
        <TimeLeft timeLeft={timeLeft} targetDate={targetDate} />
      </div>
    )
  }

  return <TimeLeft timeLeft={timeLeft} targetDate={targetDate} />
}

function TimeLeft({ timeLeft, targetDate }: TimeLeftCellProps) {
  if (timeLeft === 0n) {
    return (
      <div className="flex flex-col">
        <div className="typography-label-2 flex w-full flex-row justify-end text-primary">-</div>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-end">
      <div className="typography-label-2 text-primary">{formatTimeLeft(timeLeft)}</div>
      <div className="typography-body-4 text-secondary">{formatTargetDate(targetDate)}</div>
    </div>
  )
}

export function formatTimeLeft(timeLeft: UnixTime): string {
  const days = timeLeft / UnixTime.ONE_DAY()
  const hours = (timeLeft % UnixTime.ONE_DAY()) / UnixTime.ONE_HOUR()
  const minutes = (timeLeft % UnixTime.ONE_HOUR()) / UnixTime.ONE_MINUTE()
  return `${days}D ${hours}H ${minutes}M`
}

export function formatTargetDate(date: Date): string {
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0') // Months are zero-based
  const year = date.getFullYear()

  return `${day}.${month}.${year}`
}
