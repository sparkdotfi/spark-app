import BigNumber from 'bignumber.js'
import { maxUint256 } from 'viem'
import { assert } from '../assert/assert.js'
import { NumberLike, bigNumberify } from '../math/bigNumber.js'
import { BaseUnitNumber } from './BaseUnitNumber.js'

type Value = NormalizedNumber | number

export interface NormalizedNumber {
  toBaseUnit(decimals: number): BaseUnitNumber
  toBigNumber(): BigNumber

  abs(): NormalizedNumber
  eq(n: Value, base?: number): boolean
  abs(): NormalizedNumber
  comparedTo(n: Value, base?: number): number
  decimalPlaces(decimalPlaces: number, roundingMode?: BigNumber.RoundingMode): NormalizedNumber
  div(n: Value, base?: number): NormalizedNumber
  pow(n: number, m?: Value): NormalizedNumber
  sqrt(): NormalizedNumber
  integerValue(rm?: BigNumber.RoundingMode): NormalizedNumber
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
  minus(n: Value, base?: number): NormalizedNumber
  plus(n: Value, base?: number): NormalizedNumber
  mod(n: Value, base?: number): NormalizedNumber
  times(n: Value, base?: number): NormalizedNumber
  negated(): NormalizedNumber
  precision(significantDigits: number, roundingMode?: BigNumber.RoundingMode): NormalizedNumber
  shiftedBy(n: number): NormalizedNumber
  toExponential(): string
  toFixed(): string
  toFixed(decimalPlaces: number, roundingMode?: BigNumber.RoundingMode): string
  toFormat(format: BigNumber.Format): string
  toFraction(maxDenominator?: NormalizedNumber): [BigNumber, BigNumber]
  toJSON(): string
  toNumber(): number
  toPrecision(): string
  toString(base?: number): string
  valueOf(): string
}

// Should be used only for type checking
export class NormalizedNumberClass implements NormalizedNumber {
  private readonly value: BigNumber
  private readonly asString: string

  constructor(value: NumberLike) {
    this.value = BigNumber(bigNumberify(value))
    this.asString = this.value.toString()
  }

  static ZERO: NormalizedNumber = new NormalizedNumberClass(0)
  static MAX_UINT_256: NormalizedNumber = new NormalizedNumberClass(maxUint256)

  static min(...values: NormalizedNumber[]): NormalizedNumber {
    assert(values.length > 0, 'Requires at least 1 arg')
    return values.reduce((min, val) => (val.lt(min) ? val : min))
  }

  static max(...values: NormalizedNumber[]): NormalizedNumber {
    assert(values.length > 0, 'Requires at least 1 arg')
    return values.reduce((max, val) => (val.gt(max) ? val : max))
  }

  static isInstance(value: unknown): value is NormalizedNumber {
    return value instanceof NormalizedNumberClass
  }

  toBaseUnit(decimals: number): BaseUnitNumber {
    const lowerPrecisionNumber = this.value.decimalPlaces(decimals, BigNumber.ROUND_DOWN)
    return BaseUnitNumber(lowerPrecisionNumber.shiftedBy(decimals))
  }

  toBigNumber(): BigNumber {
    return this.value
  }

  abs(): NormalizedNumber {
    return new NormalizedNumber(this.value.abs())
  }

  comparedTo(n: Value, base?: number): number {
    return this.value.comparedTo(getValue(n), base)
  }

  decimalPlaces(decimalPlaces: number, roundingMode?: BigNumber.RoundingMode): NormalizedNumber {
    return new NormalizedNumber(this.value.decimalPlaces(decimalPlaces, roundingMode))
  }

  div(n: Value, base?: number): NormalizedNumber {
    return new NormalizedNumber(this.value.div(getValue(n), base))
  }

  pow(n: number, modulus?: Value): NormalizedNumber {
    const m = modulus ? getValue(modulus) : undefined
    return new NormalizedNumber(this.value.pow(n, m))
  }

  sqrt(): NormalizedNumber {
    return new NormalizedNumber(this.value.sqrt())
  }

  integerValue(rm?: BigNumber.RoundingMode): NormalizedNumber {
    return new NormalizedNumber(this.value.integerValue(rm))
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

  minus(n: Value, base?: number): NormalizedNumber {
    return new NormalizedNumber(this.value.minus(getValue(n), base))
  }

  plus(n: Value, base?: number): NormalizedNumber {
    return new NormalizedNumber(this.value.plus(getValue(n), base))
  }

  mod(n: Value, base?: number): NormalizedNumber {
    return new NormalizedNumber(this.value.mod(getValue(n), base))
  }

  times(n: Value, base?: number): NormalizedNumber {
    return new NormalizedNumber(this.value.times(getValue(n), base))
  }

  negated(): NormalizedNumber {
    return new NormalizedNumber(this.value.negated())
  }

  precision(significantDigits: number, roundingMode?: BigNumber.RoundingMode): NormalizedNumber {
    return new NormalizedNumber(this.value.precision(significantDigits, roundingMode))
  }

  shiftedBy(n: number): NormalizedNumber {
    return new NormalizedNumber(this.value.shiftedBy(n))
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

  toFraction(maxDenominator?: NormalizedNumber): [BigNumber, BigNumber] {
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

function NormalizedNumberFunction(value: NumberLike): NormalizedNumberClass {
  const result = bigNumberify(value)
  return new NormalizedNumberClass(result)
}

interface StaticNormalizedNumber {
  new (value: NumberLike): NormalizedNumber
  (value: NumberLike): NormalizedNumber
  readonly prototype: NormalizedNumber

  min(...values: NormalizedNumber[]): NormalizedNumber
  max(...values: NormalizedNumber[]): NormalizedNumber
  isInstance(value: unknown): value is NormalizedNumber
  ZERO: NormalizedNumber
  MAX_UINT_256: NormalizedNumber
}

Object.setPrototypeOf(NormalizedNumberFunction, NormalizedNumberClass)
NormalizedNumberFunction.prototype = NormalizedNumberClass.prototype

/**
 * Represents a base number divided by decimals i.e. 1.5 (DAI)
 */
export const NormalizedNumber: StaticNormalizedNumber = Object.assign(NormalizedNumberFunction, NormalizedNumberClass)
