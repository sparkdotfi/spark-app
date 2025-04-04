import { NormalizedNumber } from '@sparkdotfi/common-universal'

import { formatGasPrice } from './formatGasPrice'

describe(formatGasPrice.name, () => {
  it('formats', () => {
    const tests: [number, string][] = [
      [0, '0'],
      [0.000000001, '1'],
      [0.00000001, '10'],
      [0.0000000007234, '0.72'],
      [0.000000000725, '0.73'],
      [1.23, '1,230,000,000'],
    ]

    // biome-ignore lint/complexity/noForEach: <explanation>
    tests.forEach(([value, expected]) => {
      expect(formatGasPrice(NormalizedNumber(value))).toEqual(expected)
    })
  })
})
