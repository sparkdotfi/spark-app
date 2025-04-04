export interface TrackTransactionConfirmationParams {
  name: string
  value: number
  isInSandbox: boolean
}

export function trackTransactionConfirmation({ name, value, isInSandbox }: TrackTransactionConfirmationParams): void {
  if (isInSandbox) {
    return
  }
  if (!('cookie3' in window)) {
    return
  }
  ;(window.cookie3 as any).trackEvent({
    category: 'Transaction',
    action: 'Confirmation',
    name,
    value,
  })
}
