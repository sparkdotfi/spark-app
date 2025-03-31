import BigNumber from 'bignumber.js'
import { expect } from 'earl'
import { describe, it } from 'mocha'
import { AssertionError } from '../assert/AssertionError.js'
import { BaseUnitNumber } from './BaseUnitNumber.js'
import { NormalizedUnit, NormalizedUnitClass } from './NormalizedUnitNumber.js'

describe(NormalizedUnit.name, () => {
  it('works for a numeric value', () => {
    expect(new NormalizedUnit(10n ** 3n)).toEqual(new NormalizedUnit(1000))
    expect(new NormalizedUnit(1000)).toEqual(new NormalizedUnit(1000))
    expect(new NormalizedUnit('1000')).toEqual(new NormalizedUnit(1000))
    expect(new NormalizedUnit(new BigNumber(1000))).toEqual(new NormalizedUnit(1000))
    expect(new NormalizedUnit('123.456')).toEqual(new NormalizedUnit(123.456))
  })

  it('comparison works using constructor and non-constructor', () => {
    expect(new NormalizedUnit(1000)).toEqual(NormalizedUnit(1000))
  })

  it('is instance of underlying class', () => {
    expect(NormalizedUnit(10) instanceof NormalizedUnitClass).toBeTruthy()
  })

  it('stores string representation of value', () => {
    const value = NormalizedUnit(10)
    expect(value.asString).toEqual('10')
    expect(value.asString).toEqual(value.toString())
  })

  it('works with negative numbers', () => {
    expect(new NormalizedUnit(-1)).toEqual(new NormalizedUnit(-1))
  })

  it('throws if value argument is non-numeric value', () => {
    expect(() => new NormalizedUnit('123,456')).toThrow('Value argument: 123,456 cannot be converted to BigNumber.')
    expect(() => new NormalizedUnit('non-numeric')).toThrow(
      'Value argument: non-numeric cannot be converted to BigNumber.',
    )
  })

  it(`${NormalizedUnit.prototype.toString.name} does not use scientific notation for big numbers`, () => {
    expect(new NormalizedUnit(10n ** 100n).toString()).toEqual(`1${'0'.repeat(100)}`)
  })

  describe(NormalizedUnit.prototype.toBaseUnit.name, () => {
    it('works with standard decimals', () => {
      expect(NormalizedUnit(2.5).toBaseUnit(18)).toEqual(BaseUnitNumber(2_500000000000000000n))
      expect(NormalizedUnit(10).toBaseUnit(6)).toEqual(BaseUnitNumber(10_000000))
    })

    it('rounds down when precision is greater than decimals', () => {
      expect(NormalizedUnit('1.555555555555555555555555555555555555').toBaseUnit(18)).toEqual(
        BaseUnitNumber('1555555555555555555'),
      )
    })
  })

  describe(NormalizedUnit.min.name, () => {
    it('returns the smallest value', () => {
      expect(NormalizedUnit.min(new NormalizedUnit(2), new NormalizedUnit(1))).toEqual(new NormalizedUnit(1))
    })

    it('returns the smallest value when there are more than 2 arguments', () => {
      expect(
        NormalizedUnit.min(new NormalizedUnit(3), new NormalizedUnit(1), new NormalizedUnit(5), new NormalizedUnit(2)),
      ).toEqual(new NormalizedUnit(1))
    })

    it('works with array', () => {
      const input = [new NormalizedUnit(3), new NormalizedUnit(1), new NormalizedUnit(5), new NormalizedUnit(2)]
      expect(NormalizedUnit.min(...input)).toEqual(new NormalizedUnit(1))
    })

    it('return the argument if there is only 1 element', () => {
      expect(NormalizedUnit.min(new NormalizedUnit(1))).toEqual(new NormalizedUnit(1))
    })

    it('throws if there are no arguments', () => {
      expect(() => NormalizedUnit.min()).toThrow(AssertionError, 'Requires at least 1 arg')
    })
  })
})
