import { NormalizedUnitNumber, Percentage } from '@sparkdotfi/common-universal'
import { describe, expect, test } from 'vitest'
import { validateWithdraw } from './validateWithdraw'

describe(validateWithdraw.name, () => {
  test('validates that value is positive', () => {
    expect(
      validateWithdraw({
        value: NormalizedUnitNumber.ZERO,
        asset: {
          status: 'active',
          unborrowedLiquidity: NormalizedUnitNumber(10),
          maxLtv: Percentage(0.8),
        },
        user: {
          deposited: NormalizedUnitNumber(10),
          liquidationThreshold: Percentage(0.8),
          ltvAfterWithdrawal: Percentage(0.5),
          eModeState: { enabled: false },
          hasZeroLtvCollateral: false,
        },
      }),
    ).toBe('value-not-positive')
  })

  test('works with active reserves', () => {
    expect(
      validateWithdraw({
        value: NormalizedUnitNumber(10),
        asset: {
          status: 'frozen',
          unborrowedLiquidity: NormalizedUnitNumber(100),
          maxLtv: Percentage(0.8),
        },
        user: {
          deposited: NormalizedUnitNumber(10),
          liquidationThreshold: Percentage(0.8),
          ltvAfterWithdrawal: Percentage(0.5),
          eModeState: { enabled: false },
          hasZeroLtvCollateral: false,
        },
      }),
    ).toBe(undefined)
  })

  test('works with frozen reserves', () => {
    expect(
      validateWithdraw({
        value: NormalizedUnitNumber(10),
        asset: {
          status: 'frozen',
          unborrowedLiquidity: NormalizedUnitNumber(100),
          maxLtv: Percentage(0.8),
        },
        user: {
          deposited: NormalizedUnitNumber(10),
          liquidationThreshold: Percentage(0.8),
          ltvAfterWithdrawal: Percentage(0.5),
          eModeState: { enabled: false },
          hasZeroLtvCollateral: false,
        },
      }),
    ).toBe(undefined)
  })

  test('validates that reserve is not paused', () => {
    expect(
      validateWithdraw({
        value: NormalizedUnitNumber(10),
        asset: {
          status: 'paused',
          unborrowedLiquidity: NormalizedUnitNumber(100),
          maxLtv: Percentage(0.8),
        },
        user: {
          deposited: NormalizedUnitNumber(10),
          liquidationThreshold: Percentage(0.8),
          ltvAfterWithdrawal: Percentage(0.5),
          eModeState: { enabled: false },
          hasZeroLtvCollateral: false,
        },
      }),
    ).toBe('reserve-paused')
  })

  test('validates that reserve is active', () => {
    expect(
      validateWithdraw({
        value: NormalizedUnitNumber(10),
        asset: {
          status: 'not-active',
          unborrowedLiquidity: NormalizedUnitNumber(100),
          maxLtv: Percentage(0.8),
        },
        user: {
          deposited: NormalizedUnitNumber(10),
          liquidationThreshold: Percentage(0.8),
          ltvAfterWithdrawal: Percentage(0.5),
          eModeState: { enabled: false },
          hasZeroLtvCollateral: false,
        },
      }),
    ).toBe('reserve-not-active')
  })

  test('validates balance', () => {
    expect(
      validateWithdraw({
        value: NormalizedUnitNumber(10),
        asset: {
          status: 'active',
          unborrowedLiquidity: NormalizedUnitNumber(100),
          maxLtv: Percentage(0.8),
        },
        user: {
          deposited: NormalizedUnitNumber(1),
          liquidationThreshold: Percentage(0.8),
          ltvAfterWithdrawal: Percentage(0.5),
          eModeState: { enabled: false },
          hasZeroLtvCollateral: false,
        },
      }),
    ).toBe('exceeds-balance')
  })

  test('validates unborrowed liquidity', () => {
    expect(
      validateWithdraw({
        value: NormalizedUnitNumber(10),
        asset: {
          status: 'active',
          unborrowedLiquidity: NormalizedUnitNumber(9),
          maxLtv: Percentage(0.8),
        },
        user: {
          deposited: NormalizedUnitNumber(10),
          liquidationThreshold: Percentage(0.8),
          ltvAfterWithdrawal: Percentage(0.5),
          eModeState: { enabled: false },
          hasZeroLtvCollateral: false,
        },
      }),
    ).toBe('exceeds-unborrowed-liquidity')
  })

  test('work with matching balance', () => {
    expect(
      validateWithdraw({
        value: NormalizedUnitNumber(10),
        asset: {
          status: 'active',
          unborrowedLiquidity: NormalizedUnitNumber(100),
          maxLtv: Percentage(0.8),
        },
        user: {
          deposited: NormalizedUnitNumber(10),
          liquidationThreshold: Percentage(0.8),
          ltvAfterWithdrawal: Percentage(0.5),
          eModeState: { enabled: false },
          hasZeroLtvCollateral: false,
        },
      }),
    ).toBe(undefined)
  })

  test('validates health factor', () => {
    expect(
      validateWithdraw({
        value: NormalizedUnitNumber(10),
        asset: {
          status: 'active',
          unborrowedLiquidity: NormalizedUnitNumber(100),
          maxLtv: Percentage(0.8),
        },
        user: {
          deposited: NormalizedUnitNumber(10),
          liquidationThreshold: Percentage(0.8),
          ltvAfterWithdrawal: Percentage(1),
          eModeState: { enabled: false },
          hasZeroLtvCollateral: false,
        },
      }),
    ).toBe('exceeds-ltv')
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
      validateWithdraw({
        value: NormalizedUnitNumber(10),
        asset: {
          status: 'active',
          unborrowedLiquidity: NormalizedUnitNumber(100),
          maxLtv: Percentage(0.8),
          eModeCategory,
        },
        user: {
          deposited: NormalizedUnitNumber(10),
          liquidationThreshold: Percentage(0.8),
          ltvAfterWithdrawal: Percentage(0.85),
          eModeState: { enabled: true, category: eModeCategory },
          hasZeroLtvCollateral: false,
        },
      }),
    ).toBe(undefined)
    expect(
      validateWithdraw({
        value: NormalizedUnitNumber(10),
        asset: {
          status: 'active',
          unborrowedLiquidity: NormalizedUnitNumber(100),
          maxLtv: Percentage(0.8),
          eModeCategory,
        },
        user: {
          deposited: NormalizedUnitNumber(10),
          liquidationThreshold: Percentage(0.8),
          ltvAfterWithdrawal: Percentage(0.85),
          eModeState: { enabled: false },
          hasZeroLtvCollateral: false,
        },
      }),
    ).toBe('exceeds-ltv')
  })

  test('accounts for zero ltv collateral if max ltv is not zero', () => {
    expect(
      validateWithdraw({
        value: NormalizedUnitNumber(10),
        asset: {
          status: 'frozen',
          unborrowedLiquidity: NormalizedUnitNumber(100),
          maxLtv: Percentage(0.8),
        },
        user: {
          deposited: NormalizedUnitNumber(10),
          liquidationThreshold: Percentage(0.8),
          ltvAfterWithdrawal: Percentage(0.5),
          eModeState: { enabled: false },
          hasZeroLtvCollateral: true,
        },
      }),
    ).toBe('has-zero-ltv-collateral')
  })

  test('does not account for zero ltv collateral if max ltv is zero', () => {
    expect(
      validateWithdraw({
        value: NormalizedUnitNumber(10),
        asset: {
          status: 'frozen',
          unborrowedLiquidity: NormalizedUnitNumber(100),
          maxLtv: Percentage(0),
        },
        user: {
          deposited: NormalizedUnitNumber(10),
          liquidationThreshold: Percentage(0.8),
          ltvAfterWithdrawal: Percentage(0.5),
          eModeState: { enabled: false },
          hasZeroLtvCollateral: true,
        },
      }),
    ).toBe(undefined)
  })
})
