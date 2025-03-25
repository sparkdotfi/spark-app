import { useAccount, useDisconnect } from 'wagmi'

import { useTermsOfService } from '@/domain/state/compliance'
import { useCloseDialog } from '@/domain/state/dialogs'
import { CheckedAddress } from '@sparkdotfi/common-universal'

import { useSandboxState } from '@/domain/sandbox/useSandboxState'
import { useIPAndAddressCheck } from './useIPAndAddressCheck'

export type ModalInfo =
  | { type: 'none' }
  | { type: 'terms-of-service'; onAgreeToTermsOfService: () => void }
  | { type: 'vpn-detected' }
  | { type: 'region-blocked'; countryCode: string }
  | { type: 'feature-not-available-in-region'; countryCode: string }
  | { type: 'address-not-allowed'; address: CheckedAddress; disconnect: () => void }
export interface UseComplianceResults {
  visibleModal: ModalInfo
}
export function useCompliance(): UseComplianceResults {
  const { address } = useAccount()
  const { agreedToTermsOfService, saveAgreedToTermsOfService } = useTermsOfService()
  const closeDialog = useCloseDialog()
  const { disconnect } = useDisconnect()
  const { isInSandbox } = useSandboxState()

  const ipAndAddressChecks = useIPAndAddressCheck()

  const visibleModal: ModalInfo = (() => {
    if (ipAndAddressChecks.blocked) {
      if (ipAndAddressChecks.reason === 'vpn-detected') {
        return {
          type: 'vpn-detected',
        }
      }

      if (ipAndAddressChecks.reason === 'region-blocked') {
        return {
          type: 'region-blocked',
          countryCode: ipAndAddressChecks.data.countryCode,
        }
      }

      if (address && ipAndAddressChecks.reason === 'address-not-allowed') {
        return {
          type: 'address-not-allowed',
          address: CheckedAddress(address),
          disconnect,
        }
      }

      if (ipAndAddressChecks.reason === 'page-not-available-in-region') {
        return {
          type: 'feature-not-available-in-region',
          countryCode: ipAndAddressChecks.data.countryCode,
        }
      }

      return {
        type: 'none',
      }
    }

    if (
      import.meta.env.VITE_FEATURE_TOS_REQUIRED === '1' &&
      !!address &&
      !isInSandbox &&
      !agreedToTermsOfService(CheckedAddress(address))
    ) {
      return {
        type: 'terms-of-service',
        onAgreeToTermsOfService: () => saveAgreedToTermsOfService(CheckedAddress(address)),
      }
    }

    return {
      type: 'none',
    }
  })()

  if (visibleModal.type !== 'none') {
    closeDialog() // Close any open dialog
  }

  return {
    visibleModal,
  }
}
