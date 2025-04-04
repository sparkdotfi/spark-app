import BigNumber from 'bignumber.js'
import { expect } from 'earl'
import { describe, it } from 'mocha'
import { AssertionError } from '../assert/AssertionError.js'
import { BaseUnitNumber } from './BaseUnitNumber.js'
import { NormalizedNumber, NormalizedNumberClass } from './NormalizedNumber.js'

describe(NormalizedNumber.name, () => {
  it('works for a numeric value', () => {
    expect(new NormalizedNumber(10n ** 3n)).toEqual(new NormalizedNumber(1000))
    expect(new NormalizedNumber(1000)).toEqual(new NormalizedNumber(1000))
    expect(new NormalizedNumber('1000')).toEqual(new NormalizedNumber(1000))
    expect(new NormalizedNumber(new BigNumber(1000))).toEqual(new NormalizedNumber(1000))
    expect(new NormalizedNumber('123.456')).toEqual(new NormalizedNumber(123.456))
  })

  it('comparison works using constructor and non-constructor', () => {
    expect(new NormalizedNumber(1000)).toEqual(NormalizedNumber(1000))
  })

  it('is instance of underlying class', () => {
    expect(NormalizedNumber(10) instanceof NormalizedNumberClass).toBeTruthy()
  })

  it('works with negative numbers', () => {
    expect(new NormalizedNumber(-1)).toEqual(new NormalizedNumber(-1))
  })

  it('throws if value argument is non-numeric value', () => {
    expect(() => new NormalizedNumber('123,456')).toThrow('Value argument: 123,456 cannot be converted to BigNumber.')
    expect(() => new NormalizedNumber('non-numeric')).toThrow(
      'Value argument: non-numeric cannot be converted to BigNumber.',
    )
  })

  it(`${NormalizedNumber.prototype.toString.name} does not use scientific notation for big numbers`, () => {
    expect(new NormalizedNumber(10n ** 100n).toString()).toEqual(`1${'0'.repeat(100)}`)
  })

  describe(NormalizedNumber.prototype.toBaseUnit.name, () => {
    it('works with standard decimals', () => {
      expect(NormalizedNumber(2.5).toBaseUnit(18)).toEqual(BaseUnitNumber(2_500000000000000000n))
      expect(NormalizedNumber(10).toBaseUnit(6)).toEqual(BaseUnitNumber(10_000000))
    })

    it('rounds down when precision is greater than decimals', () => {
      expect(NormalizedNumber('1.555555555555555555555555555555555555').toBaseUnit(18)).toEqual(
        BaseUnitNumber('1555555555555555555'),
      )
    })
  })

  describe(NormalizedNumber.prototype.toBigNumber.name, () => {
    it('returns BigNumber', () => {
      expect(NormalizedNumber(10).toBigNumber()).toEqual(BigNumber(10))
    })
  })

  describe(NormalizedNumber.min.name, () => {
    it('returns the smallest value', () => {
      expect(NormalizedNumber.min(new NormalizedNumber(2), new NormalizedNumber(1))).toEqual(new NormalizedNumber(1))
    })

    it('returns the smallest value when there are more than 2 arguments', () => {
      expect(
        NormalizedNumber.min(
          new NormalizedNumber(3),
          new NormalizedNumber(1),
          new NormalizedNumber(5),
          new NormalizedNumber(2),
        ),
      ).toEqual(new NormalizedNumber(1))
    })

    it('works with array', () => {
      const input = [new NormalizedNumber(3), new NormalizedNumber(1), new NormalizedNumber(5), new NormalizedNumber(2)]
      expect(NormalizedNumber.min(...input)).toEqual(new NormalizedNumber(1))
    })

    it('return the argument if there is only 1 element', () => {
      expect(NormalizedNumber.min(new NormalizedNumber(1))).toEqual(new NormalizedNumber(1))
    })

    it('throws if there are no arguments', () => {
      expect(() => NormalizedNumber.min()).toThrow(AssertionError, 'Requires at least 1 arg')
    })
  })

  describe(NormalizedNumber.max.name, () => {
    it('returns the biggest value', () => {
      expect(NormalizedNumber.max(NormalizedNumber(2), NormalizedNumber(1))).toEqual(NormalizedNumber(2))
    })

    it('returns the biggest value when there are more than 2 arguments', () => {
      expect(
        NormalizedNumber.max(NormalizedNumber(3), NormalizedNumber(1), NormalizedNumber(5), NormalizedNumber(2)),
      ).toEqual(NormalizedNumber(5))
    })

    it('works with array', () => {
      const input = [NormalizedNumber(3), NormalizedNumber(1), NormalizedNumber(5), NormalizedNumber(2)]
      expect(NormalizedNumber.max(...input)).toEqual(NormalizedNumber(5))
    })

    it('return the argument if there is only 1 element', () => {
      expect(NormalizedNumber.max(NormalizedNumber(1))).toEqual(NormalizedNumber(1))
    })

    it('throws if there are no arguments', () => {
      expect(() => NormalizedNumber.max()).toThrow(AssertionError, 'Requires at least 1 arg')
    })
  })

  describe(NormalizedNumber.isInstance.name, () => {
    it(`returns true for ${NormalizedNumber.name} using constructor`, () => {
      expect(NormalizedNumber.isInstance(new NormalizedNumber(10))).toBeTruthy()
    })

    it(`returns true for ${NormalizedNumber.name} using non-constructor`, () => {
      expect(NormalizedNumber.isInstance(NormalizedNumber(10))).toBeTruthy()
    })

    it(`returns false for ${BigNumber.name}`, () => {
      expect(NormalizedNumber.isInstance(BigNumber(10))).toBeFalsy()
    })
  })
})
