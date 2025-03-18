export function trackCookie3ButtonClick(name: string): void {
  if (!('cookie3' in window)) {
    return
  }
  ;(window.cookie3 as any).trackEvent({
    category: 'Button',
    action: 'Click',
    name,
    value: 0,
  })
}
