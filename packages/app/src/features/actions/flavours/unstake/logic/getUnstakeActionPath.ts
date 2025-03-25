import { TokenRepository } from '@/domain/token-repository/TokenRepository'
import { Token } from '@/domain/types/Token'
import { TokenSymbol } from '@/domain/types/TokenSymbol'
import { raise } from '@sparkdotfi/common-universal'

export type UnstakeActionPath = 'farm-to-usds' | 'farm-to-usds-to-usdc' | 'farm-to-usds-to-dai'

export interface GetUnstakeActionPathParams {
  token: Token
  tokenRepository: TokenRepository
  stakingToken: Token
}

export function getUnstakeActionPath({
  token,
  tokenRepository,
  stakingToken,
}: GetUnstakeActionPathParams): UnstakeActionPath {
  if (stakingToken.symbol === tokenRepository.USDS?.symbol) {
    if (token.symbol === tokenRepository.USDS?.symbol) {
      return 'farm-to-usds'
    }

    if (token.symbol === TokenSymbol('USDC')) {
      return 'farm-to-usds-to-usdc'
    }

    if (token.symbol === tokenRepository.DAI?.symbol) {
      return 'farm-to-usds-to-dai'
    }
  }

  raise('Farm withdraw action type not recognized')
}
