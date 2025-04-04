import { NormalizedNumber } from '@sparkdotfi/common-universal'
import { Reserve } from '../market-info/marketInfo'
import { Token } from '../types/Token'

export interface TokenWithBalance {
  token: Token
  balance: NormalizedNumber
}

export interface TokenWithFormValue {
  token: Token
  balance: NormalizedNumber
  value: string // has to be a string because it's a form value
}

export interface TokenWithValue {
  token: Token
  value: NormalizedNumber
}

export interface ReserveWithValue {
  reserve: Reserve
  value: NormalizedNumber
}
