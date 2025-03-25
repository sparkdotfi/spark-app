import BigNumber from 'bignumber.js'
import { zeroAddress } from 'viem'

import { testAddresses } from '@/test/integration/constants'

import { CheckedAddress } from '@sparkdotfi/common-universal'
import { BaseUnitNumber, NormalizedUnitNumber } from '@sparkdotfi/common-universal'
import { Token } from './Token'
import { TokenSymbol } from './TokenSymbol'

describe(Token.name, () => {
  const token = new Token({
    symbol: TokenSymbol('TEST'),
    name: 'Test Token',
    unitPriceUsd: '1',
    decimals: 18,
    address: CheckedAddress(testAddresses.token),
  })

  const zeroPriceToken = token.clone({ unitPriceUsd: NormalizedUnitNumber(0) })

  describe(Token.prototype.formatUSD.name, () => {
    const tokenB = new Token({
      symbol: TokenSymbol('TEST'),
      name: 'Test Token',
      unitPriceUsd: '2',
      decimals: 18,
      address: CheckedAddress(testAddresses.token),
    })

    test('formats whole values', () => {
      expect(token.formatUSD(NormalizedUnitNumber(0))).toEqual('$0.00')
      expect(token.formatUSD(NormalizedUnitNumber(1))).toEqual('$1.00')
      expect(token.formatUSD(NormalizedUnitNumber(2))).toEqual('$2.00')
      expect(token.formatUSD(NormalizedUnitNumber(45))).toEqual('$45.00')

      expect(tokenB.formatUSD(NormalizedUnitNumber(0))).toEqual('$0.00')
      expect(tokenB.formatUSD(NormalizedUnitNumber(1))).toEqual('$2.00')
      expect(tokenB.formatUSD(NormalizedUnitNumber(2))).toEqual('$4.00')
      expect(tokenB.formatUSD(NormalizedUnitNumber(45))).toEqual('$90.00')
    })

    test('formats small values', () => {
      expect(token.formatUSD(NormalizedUnitNumber(0.01))).toEqual('$0.01')
      expect(token.formatUSD(NormalizedUnitNumber(0.009))).toEqual('<$0.01')
      expect(token.formatUSD(NormalizedUnitNumber(0.001))).toEqual('<$0.01')
      expect(token.formatUSD(NormalizedUnitNumber(0.000_001))).toEqual('<$0.01')

      expect(tokenB.formatUSD(NormalizedUnitNumber(0.01))).toEqual('$0.02')
      expect(tokenB.formatUSD(NormalizedUnitNumber(0.009))).toEqual('$0.02')
      expect(tokenB.formatUSD(NormalizedUnitNumber(0.004))).toEqual('<$0.01')
      expect(tokenB.formatUSD(NormalizedUnitNumber(0.000_001))).toEqual('<$0.01')
    })

    test('formats numbers with fractional part', () => {
      expect(token.formatUSD(NormalizedUnitNumber(0.12))).toEqual('$0.12')
      expect(token.formatUSD(NormalizedUnitNumber(1.121))).toEqual('$1.12')
      expect(token.formatUSD(NormalizedUnitNumber(1.129))).toEqual('$1.13')
      expect(token.formatUSD(NormalizedUnitNumber(1.99))).toEqual('$1.99')
      expect(token.formatUSD(NormalizedUnitNumber(1.999))).toEqual('$2.00')

      expect(tokenB.formatUSD(NormalizedUnitNumber(0.12))).toEqual('$0.24')
      expect(tokenB.formatUSD(NormalizedUnitNumber(1.121))).toEqual('$2.24')
      expect(tokenB.formatUSD(NormalizedUnitNumber(1.124))).toEqual('$2.25')
      expect(tokenB.formatUSD(NormalizedUnitNumber(1.99))).toEqual('$3.98')
      expect(tokenB.formatUSD(NormalizedUnitNumber(1.999))).toEqual('$4.00')
    })

    test('formats in compact mode', () => {
      expect(token.formatUSD(NormalizedUnitNumber(0), { compact: true })).toEqual('$0.00')
      expect(token.formatUSD(NormalizedUnitNumber(0.0001), { compact: true })).toEqual('<$0.01')
      expect(token.formatUSD(NormalizedUnitNumber(823.2345), { compact: true })).toEqual('$823.23')
      expect(token.formatUSD(NormalizedUnitNumber(1234), { compact: true })).toEqual('$1,234')
      expect(token.formatUSD(NormalizedUnitNumber(100000), { compact: true })).toEqual('$100K')
      expect(token.formatUSD(NormalizedUnitNumber(1000000), { compact: true })).toEqual('$1M')
      expect(token.formatUSD(NormalizedUnitNumber(1000000000), { compact: true })).toEqual('$1B')
      expect(token.formatUSD(NormalizedUnitNumber(1000000000000), { compact: true })).toEqual('$1T')
      expect(token.formatUSD(NormalizedUnitNumber(1000000000000000), { compact: true })).toEqual('$1000T')
    })

    test('formats with display cents set to never', () => {
      expect(token.formatUSD(NormalizedUnitNumber(0), { showCents: 'never' })).toEqual('$0')
      expect(token.formatUSD(NormalizedUnitNumber(0.0001), { showCents: 'never' })).toEqual('<$0.01')
      expect(token.formatUSD(NormalizedUnitNumber(1234), { showCents: 'never' })).toEqual('$1,234')
      expect(token.formatUSD(NormalizedUnitNumber(1234.56), { showCents: 'never' })).toEqual('$1,235')
    })

    test('formats with display cents set to always', () => {
      expect(token.formatUSD(NormalizedUnitNumber(0), { showCents: 'always' })).toEqual('$0.00')
      expect(token.formatUSD(NormalizedUnitNumber(0.0001), { showCents: 'always' })).toEqual('<$0.01')
      expect(token.formatUSD(NormalizedUnitNumber(1234), { showCents: 'always' })).toEqual('$1,234.00')
      expect(token.formatUSD(NormalizedUnitNumber(1234.56), { showCents: 'always' })).toEqual('$1,234.56')
    })

    test('formats with display cents set to when-not-round', () => {
      expect(token.formatUSD(NormalizedUnitNumber(0), { showCents: 'when-not-round' })).toEqual('$0')
      expect(token.formatUSD(NormalizedUnitNumber(0.0001), { showCents: 'when-not-round' })).toEqual('<$0.01')
      expect(token.formatUSD(NormalizedUnitNumber(1234), { showCents: 'when-not-round' })).toEqual('$1,234')
      expect(token.formatUSD(NormalizedUnitNumber(1234.56), { showCents: 'when-not-round' })).toEqual('$1,234.56')
    })

    test('formats with thousand places separator', () => {
      expect(token.formatUSD(NormalizedUnitNumber(123456789.12))).toEqual('$123,456,789.12')
    })

    test('returns placeholer for zero price', () => {
      expect(zeroPriceToken.formatUSD(NormalizedUnitNumber(0))).toEqual('$ N/A')
    })
  })

  describe(Token.prototype.format.name, () => {
    describe('compact style', () => {
      test('should return 0 for 0', () => {
        expect(token.format(NormalizedUnitNumber(0), { style: 'compact' })).toEqual('0')
      })

      test('should return <0.001 for values less than 0.001', () => {
        expect(token.format(NormalizedUnitNumber(0.0001), { style: 'compact' })).toEqual('<0.001')
        expect(token.format(NormalizedUnitNumber(0.0009), { style: 'compact' })).toEqual('<0.001')
      })

      test('should return short format with maximum 4 digits for values greater than 1', () => {
        expect(token.format(NormalizedUnitNumber(1.2), { style: 'compact' })).toEqual('1.2')
        expect(token.format(NormalizedUnitNumber(1.23), { style: 'compact' })).toEqual('1.23')
        expect(token.format(NormalizedUnitNumber(1.234), { style: 'compact' })).toEqual('1.234')
        expect(token.format(NormalizedUnitNumber(12.34), { style: 'compact' })).toEqual('12.34')
        expect(token.format(NormalizedUnitNumber(12.345), { style: 'compact' })).toEqual('12.35')
        expect(token.format(NormalizedUnitNumber(12.3456), { style: 'compact' })).toEqual('12.35')
        expect(token.format(NormalizedUnitNumber(123.4), { style: 'compact' })).toEqual('123.4')
        expect(token.format(NormalizedUnitNumber(123.45), { style: 'compact' })).toEqual('123.5')
        expect(token.format(NormalizedUnitNumber(123.456), { style: 'compact' })).toEqual('123.5')

        expect(token.format(NormalizedUnitNumber(1000), { style: 'compact' })).toEqual('1,000')
        expect(token.format(NormalizedUnitNumber(1000.99), { style: 'compact' })).toEqual('1,001')
        expect(token.format(NormalizedUnitNumber(1234), { style: 'compact' })).toEqual('1,234')
        expect(token.format(NormalizedUnitNumber(9999), { style: 'compact' })).toEqual('9,999')

        expect(token.format(NormalizedUnitNumber(12345), { style: 'compact' })).toEqual('12.35K')
        expect(token.format(NormalizedUnitNumber(123456), { style: 'compact' })).toEqual('123.5K')
        expect(token.format(NormalizedUnitNumber(1234567), { style: 'compact' })).toEqual('1.235M')
        expect(token.format(NormalizedUnitNumber(12345678), { style: 'compact' })).toEqual('12.35M')
        expect(token.format(NormalizedUnitNumber(123456789), { style: 'compact' })).toEqual('123.5M')
        expect(token.format(NormalizedUnitNumber(1234567890), { style: 'compact' })).toEqual('1.235B')
        expect(token.format(NormalizedUnitNumber(12345678900), { style: 'compact' })).toEqual('12.35B')
        expect(token.format(NormalizedUnitNumber(123456789000), { style: 'compact' })).toEqual('123.5B')

        expect(token.format(NormalizedUnitNumber(10000), { style: 'compact' })).toEqual('10K')
        expect(token.format(NormalizedUnitNumber(100000), { style: 'compact' })).toEqual('100K')
        expect(token.format(NormalizedUnitNumber(1000000), { style: 'compact' })).toEqual('1M')
        expect(token.format(NormalizedUnitNumber(1000000000), { style: 'compact' })).toEqual('1B')
        expect(token.format(NormalizedUnitNumber(1000000000000), { style: 'compact' })).toEqual('1T')
        expect(token.format(NormalizedUnitNumber(1000000000000000), { style: 'compact' })).toEqual('1000T')

        expect(token.format(NormalizedUnitNumber(12340), { style: 'compact' })).toEqual('12.34K')
        expect(token.format(NormalizedUnitNumber(123400), { style: 'compact' })).toEqual('123.4K')
        expect(token.format(NormalizedUnitNumber(1234000), { style: 'compact' })).toEqual('1.234M')
        expect(token.format(NormalizedUnitNumber(12340000), { style: 'compact' })).toEqual('12.34M')
        expect(token.format(NormalizedUnitNumber(2790000000), { style: 'compact' })).toEqual('2.79B')
      })

      test('should return max 3 digits precision for values >=0.001 and <=1', () => {
        expect(token.format(NormalizedUnitNumber(0.01), { style: 'compact' })).toEqual('0.01')
        expect(token.format(NormalizedUnitNumber(0.15), { style: 'compact' })).toEqual('0.15')
        expect(token.format(NormalizedUnitNumber(0.001), { style: 'compact' })).toEqual('0.001')
        expect(token.format(NormalizedUnitNumber(0.12345), { style: 'compact' })).toEqual('0.123')
      })

      test('formats correctly for token zero price', () => {
        expect(zeroPriceToken.format(NormalizedUnitNumber(12340000), { style: 'compact' })).toEqual('12.34M')
      })
    })

    describe('auto style', () => {
      describe('with stablecoin like', () => {
        test('formats whole values', () => {
          expect(token.format(NormalizedUnitNumber(0), { style: 'auto' })).toEqual('0.00')
          expect(token.format(NormalizedUnitNumber(1), { style: 'auto' })).toEqual('1.00')
          expect(token.format(NormalizedUnitNumber(45), { style: 'auto' })).toEqual('45.00')
        })

        test('formats small values', () => {
          expect(token.format(NormalizedUnitNumber(0.1), { style: 'auto' })).toEqual('0.10')
          expect(token.format(NormalizedUnitNumber(0.01), { style: 'auto' })).toEqual('0.01')
          expect(token.format(NormalizedUnitNumber(0.00009), { style: 'auto' })).toEqual('<0.01')
          expect(token.format(NormalizedUnitNumber(0.000_001), { style: 'auto' })).toEqual('<0.01')
        })

        test('formats numbers with fractional part', () => {
          expect(token.format(NormalizedUnitNumber(2.12), { style: 'auto' })).toEqual('2.12')
          expect(token.format(NormalizedUnitNumber(1.999), { style: 'auto' })).toEqual('2.00')
        })

        test('formats numbers with thousands separators', () => {
          expect(token.format(NormalizedUnitNumber(123456789), { style: 'auto' })).toEqual('123,456,789.00')
        })

        test('formats with default precision for zero price token', () => {
          expect(zeroPriceToken.format(NormalizedUnitNumber(1234.12345678), { style: 'auto' })).toEqual('1,234.1235')
        })
      })

      describe('with BTC like', () => {
        const token = new Token({
          symbol: TokenSymbol('BTC'),
          name: 'BTC Token',
          unitPriceUsd: '50000',
          decimals: 18,
          address: CheckedAddress(testAddresses.token),
        })

        test('formats whole values', () => {
          expect(token.format(NormalizedUnitNumber(0), { style: 'auto' })).toEqual('0.00')
          expect(token.format(NormalizedUnitNumber(1), { style: 'auto' })).toEqual('1.00')
          expect(token.format(NormalizedUnitNumber(45), { style: 'auto' })).toEqual('45.00')
        })

        test('formats small values', () => {
          expect(token.format(NormalizedUnitNumber(0.1), { style: 'auto' })).toEqual('0.10')
          expect(token.format(NormalizedUnitNumber(0.01), { style: 'auto' })).toEqual('0.01')
          expect(token.format(NormalizedUnitNumber(0.00009), { style: 'auto' })).toEqual('0.00009')
          expect(token.format(NormalizedUnitNumber(0.000098), { style: 'auto' })).toEqual('0.000098')
          expect(token.format(NormalizedUnitNumber(0.0000987), { style: 'auto' })).toEqual('0.000099')
          expect(token.format(NormalizedUnitNumber(0.000_000_1), { style: 'auto' })).toEqual('<0.000001')
        })

        test('formats numbers with fractional part', () => {
          expect(token.format(NormalizedUnitNumber(2.12), { style: 'auto' })).toEqual('2.12')
          expect(token.format(NormalizedUnitNumber(1.999), { style: 'auto' })).toEqual('1.999')
        })

        test('formats numbers with thousands separators', () => {
          expect(token.format(NormalizedUnitNumber(123456789), { style: 'auto' })).toEqual('123,456,789.00')
          expect(token.format(NormalizedUnitNumber('123456789.123456789'), { style: 'auto' })).toEqual(
            '123,456,789.123457',
          )
        })
      })
    })
  })

  test(Token.prototype.toBaseUnit.name, () => {
    expect(token.toBaseUnit(NormalizedUnitNumber(10))).toStrictEqual(BaseUnitNumber(10n ** 19n))
    expect(token.toBaseUnit(NormalizedUnitNumber(10.12345678))).toStrictEqual(BaseUnitNumber(10123456780000000000n))
    expect(token.toBaseUnit(NormalizedUnitNumber('10.012345678901234567'))).toStrictEqual(
      BaseUnitNumber(10012345678901234567n),
    )
    expect(token.toBaseUnit(NormalizedUnitNumber('10.0123456789012345678901234567890123456789'))).toStrictEqual(
      BaseUnitNumber(10012345678901234567n),
    )
  })

  test(Token.prototype.fromBaseUnit.name, () => {
    const value = BaseUnitNumber(new BigNumber(10).pow(19))
    expect(token.fromBaseUnit(value)).toStrictEqual(BaseUnitNumber('10'))
  })

  test(Token.prototype.toUSD.name, () => {
    const value = NormalizedUnitNumber(10)
    expect(token.toUSD(value).toString()).toBe('10')
  })

  test(Token.prototype.clone.name, () => {
    const token = new Token({
      symbol: TokenSymbol('TEST'),
      name: 'Test Token',
      unitPriceUsd: '1.12345678901',
      decimals: 18,
      address: CheckedAddress(zeroAddress),
    })

    const newAddress = CheckedAddress(testAddresses.alice)
    const newSymbol = TokenSymbol('ETH')

    const clonedToken = token.clone({ address: newAddress, symbol: newSymbol })

    expect(clonedToken.unitPriceUsd).toStrictEqual(token.unitPriceUsd)
    expect(clonedToken.decimals).toBe(token.decimals)
    expect(clonedToken.address).toBe(newAddress)
    expect(clonedToken.symbol).toBe(newSymbol)
  })
})
