import { UnixTime } from '@sparkdotfi/common-universal'

export function formatTimeLeft(timeLeft: UnixTime): string {
  const days = timeLeft / UnixTime.ONE_DAY()
  const hours = (timeLeft % UnixTime.ONE_DAY()) / UnixTime.ONE_HOUR()
  const minutes = (timeLeft % UnixTime.ONE_HOUR()) / UnixTime.ONE_MINUTE()
  return `${days}D ${hours}H ${minutes}M`
}
