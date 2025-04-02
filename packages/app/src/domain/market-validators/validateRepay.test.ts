import { NormalizedUnitNumber } from '@sparkdotfi/common-universal'
import { validateRepay } from './validateRepay'

describe(validateRepay.name, () => {
  it('validates that value is positive', () => {
    expect(
      validateRepay({
        value: NormalizedUnitNumber.ZERO,
        asset: { status: 'active' },
        user: { debt: NormalizedUnitNumber(10), balance: NormalizedUnitNumber(10) },
      }),
    ).toBe('value-not-positive')
  })

  it('works with active reserves', () => {
    expect(
      validateRepay({
        value: NormalizedUnitNumber(10),
        asset: { status: 'frozen' },
        user: { debt: NormalizedUnitNumber(10), balance: NormalizedUnitNumber(10) },
      }),
    ).toBe(undefined)
  })

  it('works with frozen reserves', () => {
    expect(
      validateRepay({
        value: NormalizedUnitNumber(10),
        asset: { status: 'frozen' },
        user: { debt: NormalizedUnitNumber(10), balance: NormalizedUnitNumber(10) },
      }),
    ).toBe(undefined)
  })

  it('validates that reserve is not paused', () => {
    expect(
      validateRepay({
        value: NormalizedUnitNumber(10),
        asset: { status: 'paused' },
        user: { debt: NormalizedUnitNumber(10), balance: NormalizedUnitNumber(10) },
      }),
    ).toBe('reserve-paused')
  })

  it('validates that reserve is active', () => {
    expect(
      validateRepay({
        value: NormalizedUnitNumber(10),
        asset: { status: 'not-active' },
        user: { debt: NormalizedUnitNumber(10), balance: NormalizedUnitNumber(10) },
      }),
    ).toBe('reserve-not-active')
  })

  it('validates debt', () => {
    expect(
      validateRepay({
        value: NormalizedUnitNumber(10),
        asset: { status: 'active' },
        user: { debt: NormalizedUnitNumber(1), balance: NormalizedUnitNumber(10) },
      }),
    ).toBe('exceeds-debt')
  })

  it('validates balance', () => {
    expect(
      validateRepay({
        value: NormalizedUnitNumber(10),
        asset: { status: 'active' },
        user: { debt: NormalizedUnitNumber(10), balance: NormalizedUnitNumber(1) },
      }),
    ).toBe('exceeds-balance')
  })
})
