import { testTokens } from '@/test/integration/constants'
import { NormalizedUnitNumber } from '@sparkdotfi/common-universal'
import { describe, expect, test } from 'vitest'
import { formatMaxAmountInForPsm3 } from './formatMaxAmountInForPsm3'

describe(formatMaxAmountInForPsm3.name, () => {
  const usds = testTokens.USDS
  const susds = testTokens.sUSDS
  const usdc = testTokens.USDC

  test('rounds up susds amount to 6 decimals for usdc', () => {
    expect(
      formatMaxAmountInForPsm3({
        susds,
        susdsAmount: NormalizedUnitNumber('99.123456789012345678'),
        assetOut: usdc,
      }),
    ).toBe(99123457000000000000n)

    expect(
      formatMaxAmountInForPsm3({
        susds,
        susdsAmount: NormalizedUnitNumber('99.123456000000000001'),
        assetOut: usdc,
      }),
    ).toBe(99123457000000000000n)

    expect(
      formatMaxAmountInForPsm3({
        susds,
        susdsAmount: NormalizedUnitNumber('99.1234567890123456789012345678'),
        assetOut: usdc,
      }),
    ).toBe(99123457000000000000n)

    expect(
      formatMaxAmountInForPsm3({
        susds,
        susdsAmount: NormalizedUnitNumber('99.123456'),
        assetOut: usdc,
      }),
    ).toBe(99123456000000000000n)

    expect(
      formatMaxAmountInForPsm3({
        susds,
        susdsAmount: NormalizedUnitNumber('0.123456'),
        assetOut: usdc,
      }),
    ).toBe(123456000000000000n)

    expect(
      formatMaxAmountInForPsm3({
        susds,
        susdsAmount: NormalizedUnitNumber('0.000123'),
        assetOut: usdc,
      }),
    ).toBe(123000000000000n)

    expect(
      formatMaxAmountInForPsm3({
        susds,
        susdsAmount: NormalizedUnitNumber('0.000123456'),
        assetOut: usdc,
      }),
    ).toBe(124000000000000n)
  })

  test('rounds up susds amount to 18 decimals for usds', () => {
    expect(
      formatMaxAmountInForPsm3({
        susds,
        susdsAmount: NormalizedUnitNumber('99.123456789012345678'),
        assetOut: usds,
      }),
    ).toBe(99123456789012345678n)

    expect(
      formatMaxAmountInForPsm3({
        susds,
        susdsAmount: NormalizedUnitNumber('99.1234567890123456789012345678'),
        assetOut: usds,
      }),
    ).toBe(99123456789012345679n)

    expect(
      formatMaxAmountInForPsm3({
        susds,
        susdsAmount: NormalizedUnitNumber('99.123456'),
        assetOut: usds,
      }),
    ).toBe(99123456000000000000n)

    expect(
      formatMaxAmountInForPsm3({
        susds,
        susdsAmount: NormalizedUnitNumber('0.000123'),
        assetOut: usds,
      }),
    ).toBe(123000000000000n)

    expect(
      formatMaxAmountInForPsm3({
        susds,
        susdsAmount: NormalizedUnitNumber('0.000123456'),
        assetOut: usds,
      }),
    ).toBe(123456000000000n)
  })
})
