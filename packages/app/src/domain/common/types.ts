import { NormalizedUnitNumber } from '@sparkdotfi/common-universal'
import { Reserve } from '../market-info/marketInfo'
import { Token } from '../types/Token'

export interface TokenWithBalance {
  token: Token
  balance: NormalizedUnitNumber
}

export interface TokenWithFormValue {
  token: Token
  balance: NormalizedUnitNumber
  value: string // has to be a string because it's a form value
}

export interface TokenWithValue {
  token: Token
  value: NormalizedUnitNumber
}

export interface ReserveWithValue {
  reserve: Reserve
  value: NormalizedUnitNumber
}
