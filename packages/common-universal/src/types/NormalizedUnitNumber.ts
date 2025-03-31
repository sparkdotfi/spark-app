import { BigNumber } from 'bignumber.js'
import { assert } from '../assert/assert.js'
import { NumberLike, bigNumberify } from '../math/bigNumber.js'
import { BaseUnitNumber } from './BaseUnitNumber.js'
import { Opaque } from './Opaque.js'

/**
 * Represents a base number divided by decimals i.e. 1.5 (DAI)
 */
export type NormalizedUnitNumber = Opaque<BigNumber, 'NormalizedUnitNumber'>
export function NormalizedUnitNumber(value: NumberLike): NormalizedUnitNumber {
  const result = bigNumberify(value)
  return result as NormalizedUnitNumber
}

NormalizedUnitNumber.toBaseUnit = function toBaseUnit(value: NormalizedUnitNumber, decimals: number): BaseUnitNumber {
  const lowerPrecisionNumber = value.decimalPlaces(decimals, BigNumber.ROUND_DOWN)
  return BaseUnitNumber(lowerPrecisionNumber.shiftedBy(decimals))
}

NormalizedUnitNumber.min = function min(...values: NormalizedUnitNumber[]): NormalizedUnitNumber {
  assert(values.length > 0, 'Requires at least 1 arg')
  let min = values[0]!
  for (const value of values) {
    if (value.lt(min)) {
      min = value
    }
  }
  return min
}

interface NormalizedUnit {
  readonly value: BigNumber
  readonly asString: string

  toBaseUnit(decimals: number): BaseUnitNumber

  abs(): NormalizedUnit
  eq(n: NormalizedUnit, base?: number): boolean
  abs(): NormalizedUnit
  comparedTo(n: NormalizedUnit, base?: number): number
  decimalPlaces(decimalPlaces: number, roundingMode?: BigNumber.RoundingMode): NormalizedUnit
  div(n: NormalizedUnit, base?: number): NormalizedUnit
  pow(n: number, m?: NormalizedUnit): NormalizedUnit
  sqrt(): NormalizedUnit
  integerValue(rm?: BigNumber.RoundingMode): NormalizedUnit
  eq(n: NormalizedUnit, base?: number): boolean
  gt(n: NormalizedUnit, base?: number): boolean
  gte(n: NormalizedUnit, base?: number): boolean
  lt(n: NormalizedUnit, base?: number): boolean
  lte(n: NormalizedUnit, base?: number): boolean
  isNaN(): boolean
  isInteger(): boolean
  isFinite(): boolean
  isNegative(): boolean
  isPositive(): boolean
  isZero(): boolean
  minus(n: NormalizedUnit, base?: number): NormalizedUnit
  plus(n: NormalizedUnit, base?: number): NormalizedUnit
  mod(n: NormalizedUnit, base?: number): NormalizedUnit
  times(n: NormalizedUnit, base?: number): NormalizedUnit
  negated(): NormalizedUnit
  precision(significantDigits: number, roundingMode?: BigNumber.RoundingMode): NormalizedUnit
  shiftedBy(n: number): NormalizedUnit
  toExponential(): string
  toFixed(): string
  toFormat(format: BigNumber.Format): string
  toFraction(maxDenominator?: NormalizedUnit): [BigNumber, BigNumber]
  toJSON(): string
  toNumber(): number
  toPrecision(): string
  toString(base?: number): string
  valueOf(): string
}

// Should be used only for type checking (e.g. instanceof)
export class NormalizedUnitClass implements NormalizedUnit {
  readonly value: BigNumber
  readonly asString: string

  constructor(value: NumberLike) {
    this.value = BigNumber(bigNumberify(value))
    this.asString = this.value.toString()
  }

  toBaseUnit(decimals: number): BaseUnitNumber {
    const lowerPrecisionNumber = this.value.decimalPlaces(decimals, BigNumber.ROUND_DOWN)
    return BaseUnitNumber(lowerPrecisionNumber.shiftedBy(decimals))
  }

  abs(): NormalizedUnit {
    return new NormalizedUnit(this.value.abs())
  }

  comparedTo(n: NormalizedUnit, base?: number): number {
    return this.value.comparedTo(n.value, base)
  }

  decimalPlaces(decimalPlaces: number, roundingMode?: BigNumber.RoundingMode): NormalizedUnit {
    return new NormalizedUnit(this.value.decimalPlaces(decimalPlaces, roundingMode))
  }

  div(n: NormalizedUnit, base?: number): NormalizedUnit {
    return new NormalizedUnit(this.value.div(n.value, base))
  }

  pow(n: number, m?: NormalizedUnit): NormalizedUnit {
    return new NormalizedUnit(this.value.pow(n, m?.value))
  }

  sqrt(): NormalizedUnit {
    return new NormalizedUnit(this.value.sqrt())
  }

  integerValue(rm?: BigNumber.RoundingMode): NormalizedUnit {
    return new NormalizedUnit(this.value.integerValue(rm))
  }

  eq(n: NormalizedUnit, base?: number): boolean {
    return this.value.eq(n.value, base)
  }

  gt(n: NormalizedUnit, base?: number): boolean {
    return this.value.gt(n.value, base)
  }

  gte(n: NormalizedUnit, base?: number): boolean {
    return this.value.gte(n.value, base)
  }

  lt(n: NormalizedUnit, base?: number): boolean {
    return this.value.lt(n.value, base)
  }

  lte(n: NormalizedUnit, base?: number): boolean {
    return this.value.lte(n.value, base)
  }

  isNaN(): boolean {
    return this.value.isNaN()
  }

  isInteger(): boolean {
    return this.value.isInteger()
  }

  isFinite(): boolean {
    return this.value.isFinite()
  }

  isNegative(): boolean {
    return this.value.isNegative()
  }

  isPositive(): boolean {
    return this.value.isPositive()
  }

  isZero(): boolean {
    return this.value.isZero()
  }

  minus(n: NormalizedUnit, base?: number): NormalizedUnit {
    return new NormalizedUnit(this.value.minus(n.value, base))
  }

  plus(n: NormalizedUnit, base?: number): NormalizedUnit {
    return new NormalizedUnit(this.value.plus(n.value, base))
  }

  mod(n: NormalizedUnit, base?: number): NormalizedUnit {
    return new NormalizedUnit(this.value.mod(n.value, base))
  }

  times(n: NormalizedUnit, base?: number): NormalizedUnit {
    return new NormalizedUnit(this.value.times(n.value, base))
  }

  negated(): NormalizedUnit {
    return new NormalizedUnit(this.value.negated())
  }

  precision(significantDigits: number, roundingMode?: BigNumber.RoundingMode): NormalizedUnit {
    return new NormalizedUnit(this.value.precision(significantDigits, roundingMode))
  }

  shiftedBy(n: number): NormalizedUnit {
    return new NormalizedUnit(this.value.shiftedBy(n))
  }

  toExponential(): string {
    return this.value.toExponential()
  }

  toFixed(): string {
    return this.value.toFixed()
  }

  toFormat(format: BigNumber.Format): string {
    return this.value.toFormat(format)
  }

  toFraction(maxDenominator?: NormalizedUnit): [BigNumber, BigNumber] {
    return this.value.toFraction(maxDenominator?.value)
  }

  toJSON(): string {
    return this.value.toJSON()
  }

  toNumber(): number {
    return this.value.toNumber()
  }

  toPrecision(): string {
    return this.value.toPrecision()
  }

  toString(base?: number): string {
    return this.value.toString(base)
  }

  valueOf(): string {
    return this.value.valueOf()
  }
}

function NormalizedUnitFunction(value: NumberLike): NormalizedUnitClass {
  const result = bigNumberify(value)
  return new NormalizedUnitClass(result)
}

interface StaticNormalizedUnit {
  new (value: NumberLike): NormalizedUnit
  (value: NumberLike): NormalizedUnit
  readonly prototype: NormalizedUnit

  min(...values: NormalizedUnitClass[]): NormalizedUnitClass
}

const NormalizedUnitStaticFunctions: Pick<StaticNormalizedUnit, 'min'> = {
  min(...values: NormalizedUnit[]): NormalizedUnit {
    assert(values.length > 0, 'Requires at least 1 arg')
    let min = values[0]!
    for (const value of values) {
      if (value.lt(min)) {
        min = value
      }
    }
    return min
  },
}

Object.setPrototypeOf(NormalizedUnitFunction, NormalizedUnitClass)
NormalizedUnitFunction.prototype = NormalizedUnitClass.prototype

export const NormalizedUnit: StaticNormalizedUnit = Object.assign(
  NormalizedUnitFunction,
  NormalizedUnitClass,
  NormalizedUnitStaticFunctions,
)
