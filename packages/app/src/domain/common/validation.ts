import { CheckedAddress, Hex } from '@sparkdotfi/common-universal'
import { NormalizedNumber, Percentage } from '@sparkdotfi/common-universal'
import BigNumber from 'bignumber.js'
import { Address, Hex as ViemHex, isAddress, isHex } from 'viem'
import * as z from 'zod'

// number schemas
export const numberLikeSchema = z.union([
  z.string(),
  z.number(),
  z.custom<BigNumber>((val) => BigNumber.isBigNumber(val), {
    message: 'Must be a valid BigNumber',
  }),
  z.bigint(),
])
export const percentageSchema = numberLikeSchema.transform((a) => Percentage(a))
export const percentageAboveOneSchema = numberLikeSchema.transform((a) => Percentage(a, { allowMoreThan1: true }))
export const normalizedNumberSchema = numberLikeSchema.transform((a) => NormalizedNumber(a))

// address schemas
export const checkedAddressSchema = z.string().transform((a) => CheckedAddress(a))
export const viemAddressSchema = z.custom<Address>((address) => isAddress(address as string))
export const hexSchema = z.custom<ViemHex>((hex) => isHex(hex)).transform((hex) => Hex(hex))
