import { CheckedAddress } from '@sparkdotfi/common-universal'
import { isAddress, zeroAddress } from 'viem'

export type ReceiverValidationIssue =
  | 'undefined-receiver'
  | 'invalid-address'
  | 'zero-address'
  | 'token-address'
  | 'self-address'

export interface ValidateReceiverParams {
  account: CheckedAddress | undefined
  tokenAddresses: CheckedAddress[]
  receiver: string | undefined
}

export function validateReceiver({
  account,
  tokenAddresses,
  receiver,
}: ValidateReceiverParams): ReceiverValidationIssue | undefined {
  if (!account) {
    return undefined
  }

  if (receiver === undefined || receiver === '') {
    return 'undefined-receiver'
  }

  if (!isAddress(receiver, { strict: false })) {
    return 'invalid-address'
  }

  if (CheckedAddress(receiver) === CheckedAddress(zeroAddress)) {
    return 'zero-address'
  }

  if (tokenAddresses.includes(CheckedAddress(receiver))) {
    return 'token-address'
  }

  if (account === CheckedAddress(receiver)) {
    return 'self-address'
  }
}

export const receiverValidationIssueToMessage: Record<ReceiverValidationIssue, string> = {
  'undefined-receiver': 'Receiver address should be provided',
  'invalid-address': 'Invalid receiver address',
  'zero-address': 'Receiver address is zero address',
  'token-address': 'Receiver address is a token address',
  'self-address': 'Receiver address is the same as the sender',
}
