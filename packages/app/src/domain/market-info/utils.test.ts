import { getMockReserve, getMockUserPosition, testAddresses } from '@/test/integration/constants'

import { NormalizedNumber } from '@sparkdotfi/common-universal'
import { Token } from '../types/Token'
import { TokenSymbol } from '../types/TokenSymbol'
import { determineSiloBorrowingState } from './utils'

describe(determineSiloBorrowingState.name, () => {
  const siloedReserve = getMockReserve({
    token: new Token({
      symbol: TokenSymbol('USDC'),
      address: testAddresses.token2,
      decimals: 6,
      name: 'USDC',
      unitPriceUsd: '1',
    }),
    isSiloedBorrowing: true,
  })

  it('is not siloed when no borrows from siloed reserve', () => {
    const userPositions = [
      getMockUserPosition({ reserve: siloedReserve }),
      getMockUserPosition({ borrowBalance: NormalizedNumber('10') }),
    ]

    expect(determineSiloBorrowingState(userPositions)).toEqual({
      enabled: false,
    })
  })

  it('is siloed when borrows from siloed reserve', () => {
    const userPositions = [
      getMockUserPosition({ reserve: siloedReserve, borrowBalance: NormalizedNumber('100') }),
      getMockUserPosition({ borrowBalance: NormalizedNumber('0') }),
    ]

    expect(determineSiloBorrowingState(userPositions)).toEqual({
      enabled: true,
      siloedBorrowingReserve: siloedReserve,
    })
  })
})
