import { TokenWithBalance } from '@/domain/common/types'
import { Token } from '@/domain/types/Token'
import { TokenSymbol } from '@/domain/types/TokenSymbol'
import { NormalizedNumber } from '@sparkdotfi/common-universal'

export interface ConvertStablesFormFields {
  selectedAssetIn: TokenWithBalance
  selectedAssetOut: TokenWithBalance
  assetInOptions: TokenWithBalance[]
  assetOutOptions: TokenWithBalance[]
  changeAssetIn: (newSymbol: TokenSymbol) => void
  changeAssetOut: (newSymbol: TokenSymbol) => void
  maxSelectedFieldName: string
}

export interface NormalizedConvertStablesFormValues {
  inToken: Token
  outToken: Token
  amount: NormalizedNumber
}
