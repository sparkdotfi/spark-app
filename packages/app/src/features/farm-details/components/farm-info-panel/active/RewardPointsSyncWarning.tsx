import { RewardPointsSyncStatus } from '@/features/farm-details/types'
import { Alert } from '@/ui/molecules/alert/Alert'
import { assertNever } from '@sparkdotfi/common-universal'

export interface RewardPointsSyncWarningProps {
  status: RewardPointsSyncStatus
  'data-testid'?: string
}

export function RewardPointsSyncWarning({ status, ...rest }: RewardPointsSyncWarningProps) {
  switch (status) {
    case 'synced':
      return null
    case 'out-of-sync':
      return (
        <Alert variant="warning" className="w-fit gap-2 rounded-full px-2 py-1" {...rest}>
          Points data is out of sync. Please wait.
        </Alert>
      )
    case 'sync-failed':
      return (
        <Alert variant="error" className="w-fit gap-2 rounded-full px-2 py-1" {...rest}>
          Points data could not be synced.
        </Alert>
      )
    default:
      assertNever(status)
  }
}
