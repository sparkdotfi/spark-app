import { NormalizedUnitNumber, Percentage } from '@sparkdotfi/common-universal'
import BigNumber from 'bignumber.js'
import { describe, expect, test } from 'vitest'
import { getWithdrawMaxValue } from './getWithdrawMaxValue'

describe(getWithdrawMaxValue.name, () => {
  test('returns 0 for paused reserve', () => {
    expect(
      getWithdrawMaxValue({
        user: {
          deposited: NormalizedUnitNumber(100),
          healthFactor: undefined,
          totalBorrowsUSD: NormalizedUnitNumber(0),
          eModeState: { enabled: false },
        },
        asset: {
          status: 'paused',
          liquidationThreshold: Percentage(0),
          unborrowedLiquidity: NormalizedUnitNumber(0),
          unitPriceUsd: NormalizedUnitNumber(1),
          decimals: 18,
          usageAsCollateralEnabledOnUser: true,
        },
      }),
    ).toEqual(NormalizedUnitNumber(0))
  })

  test('returns deposited amount when no borrows', () => {
    expect(
      getWithdrawMaxValue({
        user: {
          deposited: NormalizedUnitNumber(100),
          healthFactor: undefined,
          totalBorrowsUSD: NormalizedUnitNumber(0),
          eModeState: { enabled: false },
        },
        asset: {
          status: 'active',
          liquidationThreshold: Percentage(0.8),
          unborrowedLiquidity: NormalizedUnitNumber(1000),
          unitPriceUsd: NormalizedUnitNumber(1),
          decimals: 18,
          usageAsCollateralEnabledOnUser: true,
        },
      }),
    ).toEqual(NormalizedUnitNumber(100))
  })

  test('returns unborrowed liquidity when not enough liquidity to withdraw', () => {
    expect(
      getWithdrawMaxValue({
        user: {
          deposited: NormalizedUnitNumber(200),
          healthFactor: undefined,
          totalBorrowsUSD: NormalizedUnitNumber(0),
          eModeState: { enabled: false },
        },
        asset: {
          status: 'active',
          liquidationThreshold: Percentage(0.8),
          unborrowedLiquidity: NormalizedUnitNumber(100),
          unitPriceUsd: NormalizedUnitNumber(1),
          decimals: 18,
          usageAsCollateralEnabledOnUser: true,
        },
      }),
    ).toEqual(NormalizedUnitNumber(100))
  })

  test('returns value that gets HF down to 1.01', () => {
    expect(
      getWithdrawMaxValue({
        user: {
          deposited: NormalizedUnitNumber(100),
          healthFactor: BigNumber(2),
          totalBorrowsUSD: NormalizedUnitNumber(40),
          eModeState: { enabled: false },
        },
        asset: {
          status: 'active',
          liquidationThreshold: Percentage(0.8),
          unborrowedLiquidity: NormalizedUnitNumber(200),
          unitPriceUsd: NormalizedUnitNumber(1),
          decimals: 18,
          usageAsCollateralEnabledOnUser: true,
        },
      }),
    ).toEqual(NormalizedUnitNumber(49.5))
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
          deposited: NormalizedUnitNumber(100),
          healthFactor: BigNumber(2),
          totalBorrowsUSD: NormalizedUnitNumber(40),
          eModeState: { enabled: true, category: eModeCategory },
        },
        asset: {
          status: 'active',
          liquidationThreshold: Percentage(0.8),
          unborrowedLiquidity: NormalizedUnitNumber(200),
          unitPriceUsd: NormalizedUnitNumber(1),
          decimals: 18,
          usageAsCollateralEnabledOnUser: true,
          eModeCategory,
        },
      }),
    ).toEqual(NormalizedUnitNumber(44))
  })

  test('returns deposited value if usage as collateral is disabled', () => {
    expect(
      getWithdrawMaxValue({
        user: {
          deposited: NormalizedUnitNumber(100),
          healthFactor: BigNumber(2),
          totalBorrowsUSD: NormalizedUnitNumber(40),
          eModeState: { enabled: false },
        },
        asset: {
          status: 'active',
          liquidationThreshold: Percentage(0.8),
          unborrowedLiquidity: NormalizedUnitNumber(200),
          unitPriceUsd: NormalizedUnitNumber(1),
          decimals: 18,
          usageAsCollateralEnabledOnUser: false,
        },
      }),
    ).toEqual(NormalizedUnitNumber(100))
  })
})
