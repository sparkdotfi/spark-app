import BigNumber from 'bignumber.js'
import { maxUint256 } from 'viem'
import { assert } from '../assert/assert.js'
import { NumberLike, bigNumberify } from '../math/bigNumber.js'
import { BaseUnitNumber } from './BaseUnitNumber.js'

type Value = NormalizedUnitNumber | number

export interface NormalizedUnitNumber {
  toBaseUnit(decimals: number): BaseUnitNumber
  toBigNumber(): BigNumber

  abs(): NormalizedUnitNumber
  eq(n: Value, base?: number): boolean
  abs(): NormalizedUnitNumber
  comparedTo(n: Value, base?: number): number
  decimalPlaces(decimalPlaces: number, roundingMode?: BigNumber.RoundingMode): NormalizedUnitNumber
  div(n: Value, base?: number): NormalizedUnitNumber
  pow(n: number, m?: Value): NormalizedUnitNumber
  sqrt(): NormalizedUnitNumber
  integerValue(rm?: BigNumber.RoundingMode): NormalizedUnitNumber
  eq(n: Value, base?: number): boolean
  gt(n: Value, base?: number): boolean
  gte(n: Value, base?: number): boolean
  lt(n: Value, base?: number): boolean
  lte(n: Value, base?: number): boolean
  isNaN(): boolean
  isInteger(): boolean
  isFinite(): boolean
  isNegative(): boolean
  isPositive(): boolean
  isZero(): boolean
  minus(n: Value, base?: number): NormalizedUnitNumber
  plus(n: Value, base?: number): NormalizedUnitNumber
  mod(n: Value, base?: number): NormalizedUnitNumber
  times(n: Value, base?: number): NormalizedUnitNumber
  negated(): NormalizedUnitNumber
  precision(significantDigits: number, roundingMode?: BigNumber.RoundingMode): NormalizedUnitNumber
  shiftedBy(n: number): NormalizedUnitNumber
  toExponential(): string
  toFixed(): string
  toFixed(decimalPlaces: number, roundingMode?: BigNumber.RoundingMode): string
  toFormat(format: BigNumber.Format): string
  toFraction(maxDenominator?: NormalizedUnitNumber): [BigNumber, BigNumber]
  toJSON(): string
  toNumber(): number
  toPrecision(): string
  toString(base?: number): string
  valueOf(): string
}

// Should be used only for type checking (e.g. instanceof)
export class NormalizedUnitClass implements NormalizedUnitNumber {
  private readonly value: BigNumber
  private readonly asString: string

  constructor(value: NumberLike) {
    this.value = BigNumber(bigNumberify(value))
    this.asString = this.value.toString()
  }

  static ZERO: NormalizedUnitNumber = new NormalizedUnitClass(0)
  static MAX_UINT_256: NormalizedUnitNumber = new NormalizedUnitClass(maxUint256)

  static min(...values: NormalizedUnitNumber[]): NormalizedUnitNumber {
    assert(values.length > 0, 'Requires at least 1 arg')
    return values.reduce((min, val) => (val.lt(min) ? val : min))
  }

  static max(...values: NormalizedUnitNumber[]): NormalizedUnitNumber {
    assert(values.length > 0, 'Requires at least 1 arg')
    return values.reduce((max, val) => (val.gt(max) ? val : max))
  }

  static isInstance(value: unknown): value is NormalizedUnitNumber {
    return value instanceof NormalizedUnitClass
  }

  toBaseUnit(decimals: number): BaseUnitNumber {
    const lowerPrecisionNumber = this.value.decimalPlaces(decimals, BigNumber.ROUND_DOWN)
    return BaseUnitNumber(lowerPrecisionNumber.shiftedBy(decimals))
  }

  toBigNumber(): BigNumber {
    return this.value
  }

  abs(): NormalizedUnitNumber {
    return new NormalizedUnitNumber(this.value.abs())
  }

  comparedTo(n: Value, base?: number): number {
    return this.value.comparedTo(getValue(n), base)
  }

  decimalPlaces(decimalPlaces: number, roundingMode?: BigNumber.RoundingMode): NormalizedUnitNumber {
    return new NormalizedUnitNumber(this.value.decimalPlaces(decimalPlaces, roundingMode))
  }

  div(n: Value, base?: number): NormalizedUnitNumber {
    return new NormalizedUnitNumber(this.value.div(getValue(n), base))
  }

  pow(n: number, modulus?: Value): NormalizedUnitNumber {
    const m = modulus ? getValue(modulus) : undefined
    return new NormalizedUnitNumber(this.value.pow(n, m))
  }

  sqrt(): NormalizedUnitNumber {
    return new NormalizedUnitNumber(this.value.sqrt())
  }

  integerValue(rm?: BigNumber.RoundingMode): NormalizedUnitNumber {
    return new NormalizedUnitNumber(this.value.integerValue(rm))
  }

  eq(n: Value, base?: number): boolean {
    return this.value.eq(getValue(n), base)
  }

  gt(n: Value, base?: number): boolean {
    return this.value.gt(getValue(n), base)
  }

  gte(n: Value, base?: number): boolean {
    return this.value.gte(getValue(n), base)
  }

  lt(n: Value, base?: number): boolean {
    return this.value.lt(getValue(n), base)
  }

  lte(n: Value, base?: number): boolean {
    return this.value.lte(getValue(n), base)
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

  minus(n: Value, base?: number): NormalizedUnitNumber {
    return new NormalizedUnitNumber(this.value.minus(getValue(n), base))
  }

  plus(n: Value, base?: number): NormalizedUnitNumber {
    return new NormalizedUnitNumber(this.value.plus(getValue(n), base))
  }

  mod(n: Value, base?: number): NormalizedUnitNumber {
    return new NormalizedUnitNumber(this.value.mod(getValue(n), base))
  }

  times(n: Value, base?: number): NormalizedUnitNumber {
    return new NormalizedUnitNumber(this.value.times(getValue(n), base))
  }

  negated(): NormalizedUnitNumber {
    return new NormalizedUnitNumber(this.value.negated())
  }

  precision(significantDigits: number, roundingMode?: BigNumber.RoundingMode): NormalizedUnitNumber {
    return new NormalizedUnitNumber(this.value.precision(significantDigits, roundingMode))
  }

  shiftedBy(n: number): NormalizedUnitNumber {
    return new NormalizedUnitNumber(this.value.shiftedBy(n))
  }

  toExponential(): string {
    return this.value.toExponential()
  }

  toFixed(): string
  toFixed(decimalPlaces: number, roundingMode?: BigNumber.RoundingMode): string
  toFixed(decimalPlaces?: number, roundingMode?: BigNumber.RoundingMode): string {
    if (decimalPlaces === undefined) {
      return this.value.toFixed()
    }
    return this.value.toFixed(decimalPlaces, roundingMode)
  }

  toFormat(format: BigNumber.Format): string {
    return this.value.toFormat(format)
  }

  toFraction(maxDenominator?: NormalizedUnitNumber): [BigNumber, BigNumber] {
    return this.value.toFraction(maxDenominator?.toBigNumber())
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

function getValue(value: Value): number | BigNumber {
  if (typeof value === 'number') {
    return value
  }
  return value.toBigNumber()
}

function NormalizedUnitFunction(value: NumberLike): NormalizedUnitClass {
  const result = bigNumberify(value)
  return new NormalizedUnitClass(result)
}

interface StaticNormalizedUnit {
  new (value: NumberLike): NormalizedUnitNumber
  (value: NumberLike): NormalizedUnitNumber
  readonly prototype: NormalizedUnitNumber

  min(...values: NormalizedUnitNumber[]): NormalizedUnitNumber
  max(...values: NormalizedUnitNumber[]): NormalizedUnitNumber
  isInstance(value: unknown): value is NormalizedUnitNumber
  ZERO: NormalizedUnitNumber
  MAX_UINT_256: NormalizedUnitNumber
}

Object.setPrototypeOf(NormalizedUnitFunction, NormalizedUnitClass)
NormalizedUnitFunction.prototype = NormalizedUnitClass.prototype

/**
 * Represents a base number divided by decimals i.e. 1.5 (DAI)
 */
export const NormalizedUnitNumber: StaticNormalizedUnit = Object.assign(NormalizedUnitFunction, NormalizedUnitClass)
