import BigNumber from 'bignumber.js'
import { expect } from 'earl'
import { describe, it } from 'mocha'

import { BaseUnitNumber } from './BaseUnitNumber.js'

describe(BaseUnitNumber.name, () => {
  it('works with an argument correctly representing base value', () => {
    expect(BaseUnitNumber(10n ** 3n)).toEqual(new BigNumber(1000) as BaseUnitNumber)
    expect(BaseUnitNumber(1000)).toEqual(new BigNumber(1000) as BaseUnitNumber)
    expect(BaseUnitNumber('1000')).toEqual(new BigNumber(1000) as BaseUnitNumber)
    expect(BaseUnitNumber(new BigNumber(1000))).toEqual(new BigNumber(1000) as BaseUnitNumber)
  })

  it('works with negative numbers', () => {
    expect(BaseUnitNumber(-1)).toEqual(new BigNumber(-1) as BaseUnitNumber)
  })

  it('throws if value argument has decimal points', () => {
    expect(() => BaseUnitNumber(123.45)).toThrow('Value should not have decimal points in its representation.')
  })

  it('throws if value argument is non-numeric value', () => {
    expect(() => BaseUnitNumber('non-numeric')).toThrow('Value argument: non-numeric cannot be converted to BigNumber.')
  })

  it(`${BaseUnitNumber.toString.name} does not use scientific notation for big numbers`, () => {
    expect(BaseUnitNumber(10n ** 100n).toString()).toEqual(`1${'0'.repeat(100)}`)
  })
})
