import { describe, test } from 'vitest'

import { NormalizedNumber } from '@sparkdotfi/common-universal'
import { getRepayMaxValue } from './getRepayMaxValue'

describe(getRepayMaxValue.name, () => {
  test('returns 0 for paused reserve', () => {
    expect(
      getRepayMaxValue({
        user: {
          debt: NormalizedNumber(100),
          balance: NormalizedNumber(100),
        },
        asset: {
          status: 'paused',
          isNativeAsset: false,
        },
        chain: {
          minRemainingNativeAsset: NormalizedNumber.ZERO,
        },
      }),
    ).toEqual(NormalizedNumber.ZERO)
  })

  test('returns 0 when no debt', () => {
    expect(
      getRepayMaxValue({
        user: {
          debt: NormalizedNumber.ZERO,
          balance: NormalizedNumber(100),
        },
        asset: {
          status: 'active',
          isNativeAsset: false,
        },
        chain: {
          minRemainingNativeAsset: NormalizedNumber.ZERO,
        },
      }),
    ).toEqual(NormalizedNumber.ZERO)
  })

  test('returns 0 when no balance', () => {
    expect(
      getRepayMaxValue({
        user: {
          debt: NormalizedNumber(100),
          balance: NormalizedNumber.ZERO,
        },
        asset: {
          status: 'active',
          isNativeAsset: false,
        },
        chain: {
          minRemainingNativeAsset: NormalizedNumber.ZERO,
        },
      }),
    ).toEqual(NormalizedNumber.ZERO)
  })

  test('returns debt when balance is greater', () => {
    expect(
      getRepayMaxValue({
        user: {
          debt: NormalizedNumber(100),
          balance: NormalizedNumber(200),
        },
        asset: {
          status: 'active',
          isNativeAsset: false,
        },
        chain: {
          minRemainingNativeAsset: NormalizedNumber.ZERO,
        },
      }),
    ).toEqual(NormalizedNumber(100))
  })

  test('returns balance when debt is greater', () => {
    expect(
      getRepayMaxValue({
        user: {
          debt: NormalizedNumber(200),
          balance: NormalizedNumber(100),
        },
        asset: {
          status: 'active',
          isNativeAsset: false,
        },
        chain: {
          minRemainingNativeAsset: NormalizedNumber.ZERO,
        },
      }),
    ).toEqual(NormalizedNumber(100))
  })

  test('leaves some native asset when returning balance', () => {
    expect(
      getRepayMaxValue({
        user: {
          debt: NormalizedNumber(200),
          balance: NormalizedNumber(100),
        },
        asset: {
          status: 'active',
          isNativeAsset: true,
        },
        chain: {
          minRemainingNativeAsset: NormalizedNumber(0.01),
        },
      }),
    ).toEqual(NormalizedNumber(99.99))
  })
})
