import { Token } from '@/domain/types/Token'
import { TokenSymbol } from '@/domain/types/TokenSymbol'
import { NormalizedUnitNumber } from '@sparkdotfi/common-universal'
import { CheckedAddress } from '@sparkdotfi/common-universal'
import { zeroAddress } from 'viem'
import { PermitAction } from '../types'

export function getFakePermitAction(): PermitAction {
  return {
    type: 'permit',
    token: new Token({
      address: CheckedAddress(zeroAddress),
      symbol: TokenSymbol('FAKE'),
      name: 'Fake',
      decimals: 18,
      unitPriceUsd: '1',
    }),
    spender: CheckedAddress(zeroAddress),
    value: NormalizedUnitNumber(0),
  }
}
