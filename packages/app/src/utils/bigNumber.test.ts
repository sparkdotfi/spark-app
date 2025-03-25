import BigNumber from 'bignumber.js'

import { bigNumberify, parseBigNumber } from '@sparkdotfi/common-universal'

describe(bigNumberify.name, () => {
  it('throws for non-numeric string', () => {
    expect(() => bigNumberify('123,456')).toThrow('Value argument: 123,456 cannot be converted to BigNumber.')
    expect(() => bigNumberify('non-numeric')).toThrow('Value argument: non-numeric cannot be converted to BigNumber.')
  })

  it('converts number like strings', () => {
    expect(bigNumberify('-1')).toStrictEqual(BigNumber(-1))
    expect(bigNumberify('0')).toStrictEqual(BigNumber(0))
    expect(bigNumberify('1')).toStrictEqual(BigNumber(1))
    expect(bigNumberify('123')).toStrictEqual(BigNumber(123))
    expect(bigNumberify('123.45')).toStrictEqual(BigNumber(123.45))
  })

  it('converts numbers', () => {
    expect(bigNumberify(-1)).toStrictEqual(BigNumber(-1))
    expect(bigNumberify(0)).toStrictEqual(BigNumber(0))
    expect(bigNumberify(1)).toStrictEqual(BigNumber(1))
    expect(bigNumberify(123)).toStrictEqual(BigNumber(123))
    expect(bigNumberify(123.45)).toStrictEqual(BigNumber(123.45))
  })

  it('converts bigint arguments', () => {
    expect(bigNumberify(1n)).toStrictEqual(BigNumber(1))
  })

  it('returns correct value for BigNumber arguments', () => {
    expect(bigNumberify(BigNumber(1))).toStrictEqual(BigNumber(1))
  })
})

describe(parseBigNumber.name, () => {
  describe('without default argument', () => {
    it('throws for non-numeric string', () => {
      const expectedError = 'Value cannot be parsed to BigNumber.'
      expect(() => parseBigNumber('123,456')).toThrow(expectedError)
      expect(() => parseBigNumber('non-numeric')).toThrow(expectedError)
    })

    it('throws if arguments are undefined', () => {
      expect(() => parseBigNumber(undefined)).toThrow('At least one argument must be defined.')
    })

    it('converts number like strings', () => {
      expect(parseBigNumber('0')).toStrictEqual(BigNumber(0))
      expect(parseBigNumber('1')).toStrictEqual(BigNumber(1))
      expect(parseBigNumber('123')).toStrictEqual(BigNumber(123))
      expect(parseBigNumber('123.45')).toStrictEqual(BigNumber(123.45))
    })

    it('converts numbers', () => {
      expect(parseBigNumber(0)).toStrictEqual(BigNumber(0))
      expect(parseBigNumber(1)).toStrictEqual(BigNumber(1))
      expect(parseBigNumber(123)).toStrictEqual(BigNumber(123))
      expect(parseBigNumber(123.45)).toStrictEqual(BigNumber(123.45))
    })

    it('converts bigint arguments', () => {
      expect(parseBigNumber(1n)).toStrictEqual(BigNumber(1))
    })

    it('returns correct value for BigNumber arguments', () => {
      expect(parseBigNumber(new BigNumber(1))).toStrictEqual(BigNumber(1))
    })
  })

  describe('with default argument', () => {
    it('uses default argument if value cannot be converted', () => {
      expect(parseBigNumber('123,456', 1)).toStrictEqual(BigNumber(1))
      expect(parseBigNumber('non-numeric', 1)).toStrictEqual(BigNumber(1))
      expect(parseBigNumber(undefined, 0)).toStrictEqual(BigNumber(0))
      expect(parseBigNumber('', 0)).toStrictEqual(BigNumber(0))
    })

    it('converts number like strings', () => {
      expect(parseBigNumber('1', 2)).toStrictEqual(BigNumber(1))
      expect(parseBigNumber('123', 234)).toStrictEqual(BigNumber(123))
      expect(parseBigNumber('123.45', 234.56)).toStrictEqual(BigNumber(123.45))
    })

    it('converts numbers', () => {
      expect(parseBigNumber(1, 2)).toStrictEqual(BigNumber(1))
      expect(parseBigNumber(123, 234)).toStrictEqual(BigNumber(123))
      expect(parseBigNumber(123.45, 234.56)).toStrictEqual(BigNumber(123.45))
    })

    it('converts bigint arguments', () => {
      expect(parseBigNumber(1n, 2)).toStrictEqual(BigNumber(1))
    })

    it('returns correct value for BigNumber arguments', () => {
      expect(parseBigNumber(BigNumber(1), 2)).toStrictEqual(BigNumber(1))
    })
  })
})
