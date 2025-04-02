import { NormalizedNumber } from '@sparkdotfi/common-universal'
import { validateDeposit } from './validateDeposit'

describe(validateDeposit.name, () => {
  it('validates that value is positive', () => {
    expect(
      validateDeposit({
        value: NormalizedNumber.ZERO,
        asset: { status: 'active', totalLiquidity: NormalizedNumber(100) },
        user: { balance: NormalizedNumber(10), alreadyDepositedValueUSD: NormalizedNumber.ZERO },
      }),
    ).toBe('value-not-positive')
  })

  it('works with 0 value if deposited already', () => {
    expect(
      validateDeposit({
        value: NormalizedNumber.ZERO,
        asset: { status: 'active', totalLiquidity: NormalizedNumber(100) },
        user: { balance: NormalizedNumber(10), alreadyDepositedValueUSD: NormalizedNumber(10) },
      }),
    ).toBe(undefined)
  })

  it('validates that reserve is active', () => {
    expect(
      validateDeposit({
        value: NormalizedNumber(10),
        asset: { status: 'frozen', totalLiquidity: NormalizedNumber(100) },
        user: { balance: NormalizedNumber(10), alreadyDepositedValueUSD: NormalizedNumber.ZERO },
      }),
    ).toBe('reserve-not-active')
  })

  it('validates balance', () => {
    expect(
      validateDeposit({
        value: NormalizedNumber(10),
        asset: { status: 'active', totalLiquidity: NormalizedNumber(100) },
        user: { balance: NormalizedNumber(1), alreadyDepositedValueUSD: NormalizedNumber.ZERO },
      }),
    ).toBe('exceeds-balance')
  })

  it('validates deposit cap', () => {
    expect(
      validateDeposit({
        value: NormalizedNumber(1),
        asset: { status: 'active', totalLiquidity: NormalizedNumber(1), supplyCap: NormalizedNumber(1) },
        user: { balance: NormalizedNumber(10), alreadyDepositedValueUSD: NormalizedNumber.ZERO },
      }),
    ).toBe('deposit-cap-reached')
  })

  it('works when no errors', () => {
    expect(
      validateDeposit({
        value: NormalizedNumber(1),
        asset: { status: 'active', totalLiquidity: NormalizedNumber(1) },
        user: { balance: NormalizedNumber(10), alreadyDepositedValueUSD: NormalizedNumber.ZERO },
      }),
    ).toBe(undefined)
  })
})
