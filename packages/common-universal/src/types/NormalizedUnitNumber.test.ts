import BigNumber from 'bignumber.js'
import { expect } from 'earl'
import { describe, it } from 'mocha'
import { AssertionError } from '../assert/AssertionError.js'
import { BaseUnitNumber } from './BaseUnitNumber.js'
import { NormalizedUnitClass, NormalizedUnitNumber } from './NormalizedUnitNumber.js'

describe(NormalizedUnitNumber.name, () => {
  it('works for a numeric value', () => {
    expect(new NormalizedUnitNumber(10n ** 3n)).toEqual(new NormalizedUnitNumber(1000))
    expect(new NormalizedUnitNumber(1000)).toEqual(new NormalizedUnitNumber(1000))
    expect(new NormalizedUnitNumber('1000')).toEqual(new NormalizedUnitNumber(1000))
    expect(new NormalizedUnitNumber(new BigNumber(1000))).toEqual(new NormalizedUnitNumber(1000))
    expect(new NormalizedUnitNumber('123.456')).toEqual(new NormalizedUnitNumber(123.456))
  })

  it('comparison works using constructor and non-constructor', () => {
    expect(new NormalizedUnitNumber(1000)).toEqual(NormalizedUnitNumber(1000))
  })

  it('is instance of underlying class', () => {
    expect(NormalizedUnitNumber(10) instanceof NormalizedUnitClass).toBeTruthy()
  })

  it('works with negative numbers', () => {
    expect(new NormalizedUnitNumber(-1)).toEqual(new NormalizedUnitNumber(-1))
  })

  it('throws if value argument is non-numeric value', () => {
    expect(() => new NormalizedUnitNumber('123,456')).toThrow(
      'Value argument: 123,456 cannot be converted to BigNumber.',
    )
    expect(() => new NormalizedUnitNumber('non-numeric')).toThrow(
      'Value argument: non-numeric cannot be converted to BigNumber.',
    )
  })

  it(`${NormalizedUnitNumber.prototype.toString.name} does not use scientific notation for big numbers`, () => {
    expect(new NormalizedUnitNumber(10n ** 100n).toString()).toEqual(`1${'0'.repeat(100)}`)
  })

  describe(NormalizedUnitNumber.prototype.toBaseUnit.name, () => {
    it('works with standard decimals', () => {
      expect(NormalizedUnitNumber(2.5).toBaseUnit(18)).toEqual(BaseUnitNumber(2_500000000000000000n))
      expect(NormalizedUnitNumber(10).toBaseUnit(6)).toEqual(BaseUnitNumber(10_000000))
    })

    it('rounds down when precision is greater than decimals', () => {
      expect(NormalizedUnitNumber('1.555555555555555555555555555555555555').toBaseUnit(18)).toEqual(
        BaseUnitNumber('1555555555555555555'),
      )
    })
  })

  describe(NormalizedUnitNumber.prototype.toBigNumber.name, () => {
    it('returns BigNumber', () => {
      expect(NormalizedUnitNumber(10).toBigNumber()).toEqual(BigNumber(10))
    })
  })

  describe(NormalizedUnitNumber.min.name, () => {
    it('returns the smallest value', () => {
      expect(NormalizedUnitNumber.min(new NormalizedUnitNumber(2), new NormalizedUnitNumber(1))).toEqual(
        new NormalizedUnitNumber(1),
      )
    })

    it('returns the smallest value when there are more than 2 arguments', () => {
      expect(
        NormalizedUnitNumber.min(
          new NormalizedUnitNumber(3),
          new NormalizedUnitNumber(1),
          new NormalizedUnitNumber(5),
          new NormalizedUnitNumber(2),
        ),
      ).toEqual(new NormalizedUnitNumber(1))
    })

    it('works with array', () => {
      const input = [
        new NormalizedUnitNumber(3),
        new NormalizedUnitNumber(1),
        new NormalizedUnitNumber(5),
        new NormalizedUnitNumber(2),
      ]
      expect(NormalizedUnitNumber.min(...input)).toEqual(new NormalizedUnitNumber(1))
    })

    it('return the argument if there is only 1 element', () => {
      expect(NormalizedUnitNumber.min(new NormalizedUnitNumber(1))).toEqual(new NormalizedUnitNumber(1))
    })

    it('throws if there are no arguments', () => {
      expect(() => NormalizedUnitNumber.min()).toThrow(AssertionError, 'Requires at least 1 arg')
    })
  })

  describe(NormalizedUnitNumber.isInstance.name, () => {
    it(`returns true for ${NormalizedUnitNumber.name} using constructor`, () => {
      expect(NormalizedUnitNumber.isInstance(new NormalizedUnitNumber(10))).toBeTruthy()
    })

    it(`returns true for ${NormalizedUnitNumber.name} using non-constructor`, () => {
      expect(NormalizedUnitNumber.isInstance(NormalizedUnitNumber(10))).toBeTruthy()
    })

    it(`returns false for ${BigNumber.name}`, () => {
      expect(NormalizedUnitNumber.isInstance(BigNumber(10))).toBeFalsy()
    })
  })
})
