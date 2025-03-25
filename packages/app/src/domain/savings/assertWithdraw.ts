import { Mode } from '@/features/dialogs/savings/withdraw/types'
import { assert, CheckedAddress } from '@sparkdotfi/common-universal'
import { Address } from 'viem'
import { receiverValidationIssueToMessage, validateReceiver } from './validateReceiver'

interface AssertWithdrawParams {
  mode: Mode
  owner: Address
  receiver?: CheckedAddress
  tokenAddresses?: CheckedAddress[]
}

export function assertWithdraw({ mode, receiver, owner, tokenAddresses }: AssertWithdrawParams): void {
  if (mode === 'withdraw') {
    assert(receiver === undefined, 'Receiver address should not be defined when withdrawing')
    assert(tokenAddresses === undefined, 'Reserve addresses should not be defined when withdrawing')
  }

  if (mode === 'send') {
    assert(receiver !== undefined, 'Receiver address should be defined when sending')
    assert(tokenAddresses !== undefined, 'Reserve addresses should be defined when sending')
    const validationResult = validateReceiver({
      account: CheckedAddress(owner),
      tokenAddresses,
      receiver,
    })
    assert(validationResult === undefined, receiverValidationIssueToMessage[validationResult!])
  }
}
