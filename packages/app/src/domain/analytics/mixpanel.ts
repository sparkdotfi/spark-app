import { CheckedAddress } from '@sparkdotfi/common-universal'
import mixpanel from 'mixpanel-browser'
import { useStore } from '../state'

const mixpanelProjectToken = import.meta.env.VITE_ANALYTICS_MIXPANEL_PROJECT_TOKEN

mixpanel.init(mixpanelProjectToken, {
  opt_out_tracking_by_default: useStore.getState().analytics.accepted !== true,
  debug: true,
  track_pageview: true,
  persistence: 'localStorage',
  record_sessions_percent: 100,
  record_mask_text_selector: '',
})

export const MIXPANEL_ENABLED = Boolean(mixpanelProjectToken)

export interface Analytics {
  optInTracking(): void
  optOutTracking(): void
  trackUserAddress(address: CheckedAddress): void
  trackEvent(event: string, props?: Record<string, any>): void
}

const analyticsEnabled: Analytics = {
  optInTracking: () => {
    if (!mixpanel.has_opted_in_tracking()) {
      mixpanel.opt_in_tracking()
    }
  },
  optOutTracking: () => {
    if (!mixpanel.has_opted_out_tracking()) {
      mixpanel.opt_out_tracking()
    }
  },
  trackUserAddress: (address: CheckedAddress) => {
    mixpanel.identify(address)
  },
  trackEvent: (event: string, props: Record<string, any> = {}) => {
    mixpanel.track(event, props)
  },
}

const analyticsDisabled: Analytics = {
  optInTracking: () => {},
  optOutTracking: () => {},
  trackUserAddress: (_address: CheckedAddress) => {},
  trackEvent: (_event: string, _props: Record<string, any> = {}) => {},
}

export const { optInTracking, optOutTracking, trackUserAddress, trackEvent } = MIXPANEL_ENABLED
  ? analyticsEnabled
  : analyticsDisabled
