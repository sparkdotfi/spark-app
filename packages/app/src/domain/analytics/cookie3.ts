import { useSandboxState } from '../sandbox/useSandboxState'

export interface UseCookie3Result {
  trackButtonClick: (name: string) => void
}
export function useCookie3(): UseCookie3Result {
  const { isInSandbox } = useSandboxState()

  return {
    trackButtonClick(name: string) {
      if (isInSandbox) {
        return
      }
      if (!('cookie3' in window)) {
        return
      }
      ;(window.cookie3 as any).trackEvent({
        category: 'Button',
        action: 'Click',
        name,
        value: 0,
      })
    },
  }
}
