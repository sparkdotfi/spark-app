import { NormalizedNumber, Percentage } from '@sparkdotfi/common-universal'
import BigNumber from 'bignumber.js'
import { describe, expect, test } from 'vitest'
import { getWithdrawMaxValue } from './getWithdrawMaxValue'

describe(getWithdrawMaxValue.name, () => {
  test('returns 0 for paused reserve', () => {
    expect(
      getWithdrawMaxValue({
        user: {
          deposited: NormalizedNumber(100),
          healthFactor: undefined,
          totalBorrowsUSD: NormalizedNumber.ZERO,
          eModeState: { enabled: false },
        },
        asset: {
          status: 'paused',
          liquidationThreshold: Percentage(0),
          unborrowedLiquidity: NormalizedNumber.ZERO,
          unitPriceUsd: NormalizedNumber(1),
          decimals: 18,
          usageAsCollateralEnabledOnUser: true,
        },
      }),
    ).toEqual(NormalizedNumber.ZERO)
  })

  test('returns deposited amount when no borrows', () => {
    expect(
      getWithdrawMaxValue({
        user: {
          deposited: NormalizedNumber(100),
          healthFactor: undefined,
          totalBorrowsUSD: NormalizedNumber.ZERO,
          eModeState: { enabled: false },
        },
        asset: {
          status: 'active',
          liquidationThreshold: Percentage(0.8),
          unborrowedLiquidity: NormalizedNumber(1000),
          unitPriceUsd: NormalizedNumber(1),
          decimals: 18,
          usageAsCollateralEnabledOnUser: true,
        },
      }),
    ).toEqual(NormalizedNumber(100))
  })

  test('returns unborrowed liquidity when not enough liquidity to withdraw', () => {
    expect(
      getWithdrawMaxValue({
        user: {
          deposited: NormalizedNumber(200),
          healthFactor: undefined,
          totalBorrowsUSD: NormalizedNumber.ZERO,
          eModeState: { enabled: false },
        },
        asset: {
          status: 'active',
          liquidationThreshold: Percentage(0.8),
          unborrowedLiquidity: NormalizedNumber(100),
          unitPriceUsd: NormalizedNumber(1),
          decimals: 18,
          usageAsCollateralEnabledOnUser: true,
        },
      }),
    ).toEqual(NormalizedNumber(100))
  })

  test('returns value that gets HF down to 1.01', () => {
    expect(
      getWithdrawMaxValue({
        user: {
          deposited: NormalizedNumber(100),
          healthFactor: BigNumber(2),
          totalBorrowsUSD: NormalizedNumber(40),
          eModeState: { enabled: false },
        },
        asset: {
          status: 'active',
          liquidationThreshold: Percentage(0.8),
          unborrowedLiquidity: NormalizedNumber(200),
          unitPriceUsd: NormalizedNumber(1),
          decimals: 18,
          usageAsCollateralEnabledOnUser: true,
        },
      }),
    ).toEqual(NormalizedNumber(49.5))
  })

  test('accounts for e-mode', () => {
    const eModeCategory = {
      id: 1,
      liquidationThreshold: Percentage(0.9),
      name: 'test',
      liquidationBonus: Percentage(0),
      ltv: Percentage(0.85),
    }

    expect(
      getWithdrawMaxValue({
        user: {
          deposited: NormalizedNumber(100),
          healthFactor: BigNumber(2),
          totalBorrowsUSD: NormalizedNumber(40),
          eModeState: { enabled: true, category: eModeCategory },
        },
        asset: {
          status: 'active',
          liquidationThreshold: Percentage(0.8),
          unborrowedLiquidity: NormalizedNumber(200),
          unitPriceUsd: NormalizedNumber(1),
          decimals: 18,
          usageAsCollateralEnabledOnUser: true,
          eModeCategory,
        },
      }),
    ).toEqual(NormalizedNumber(44))
  })

  test('returns deposited value if usage as collateral is disabled', () => {
    expect(
      getWithdrawMaxValue({
        user: {
          deposited: NormalizedNumber(100),
          healthFactor: BigNumber(2),
          totalBorrowsUSD: NormalizedNumber(40),
          eModeState: { enabled: false },
        },
        asset: {
          status: 'active',
          liquidationThreshold: Percentage(0.8),
          unborrowedLiquidity: NormalizedNumber(200),
          unitPriceUsd: NormalizedNumber(1),
          decimals: 18,
          usageAsCollateralEnabledOnUser: false,
        },
      }),
    ).toEqual(NormalizedNumber(100))
  })
})
