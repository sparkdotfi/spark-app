import { NormalizedUnitNumber } from '@sparkdotfi/common-universal'
import { validateDeposit } from './validateDeposit'

describe(validateDeposit.name, () => {
  it('validates that value is positive', () => {
    expect(
      validateDeposit({
        value: NormalizedUnitNumber.ZERO,
        asset: { status: 'active', totalLiquidity: NormalizedUnitNumber(100) },
        user: { balance: NormalizedUnitNumber(10), alreadyDepositedValueUSD: NormalizedUnitNumber.ZERO },
      }),
    ).toBe('value-not-positive')
  })

  it('works with 0 value if deposited already', () => {
    expect(
      validateDeposit({
        value: NormalizedUnitNumber.ZERO,
        asset: { status: 'active', totalLiquidity: NormalizedUnitNumber(100) },
        user: { balance: NormalizedUnitNumber(10), alreadyDepositedValueUSD: NormalizedUnitNumber(10) },
      }),
    ).toBe(undefined)
  })

  it('validates that reserve is active', () => {
    expect(
      validateDeposit({
        value: NormalizedUnitNumber(10),
        asset: { status: 'frozen', totalLiquidity: NormalizedUnitNumber(100) },
        user: { balance: NormalizedUnitNumber(10), alreadyDepositedValueUSD: NormalizedUnitNumber.ZERO },
      }),
    ).toBe('reserve-not-active')
  })

  it('validates balance', () => {
    expect(
      validateDeposit({
        value: NormalizedUnitNumber(10),
        asset: { status: 'active', totalLiquidity: NormalizedUnitNumber(100) },
        user: { balance: NormalizedUnitNumber(1), alreadyDepositedValueUSD: NormalizedUnitNumber.ZERO },
      }),
    ).toBe('exceeds-balance')
  })

  it('validates deposit cap', () => {
    expect(
      validateDeposit({
        value: NormalizedUnitNumber(1),
        asset: { status: 'active', totalLiquidity: NormalizedUnitNumber(1), supplyCap: NormalizedUnitNumber(1) },
        user: { balance: NormalizedUnitNumber(10), alreadyDepositedValueUSD: NormalizedUnitNumber.ZERO },
      }),
    ).toBe('deposit-cap-reached')
  })

  it('works when no errors', () => {
    expect(
      validateDeposit({
        value: NormalizedUnitNumber(1),
        asset: { status: 'active', totalLiquidity: NormalizedUnitNumber(1) },
        user: { balance: NormalizedUnitNumber(10), alreadyDepositedValueUSD: NormalizedUnitNumber.ZERO },
      }),
    ).toBe(undefined)
  })
})
