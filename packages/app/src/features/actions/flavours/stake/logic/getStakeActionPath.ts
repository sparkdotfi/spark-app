import { TokenRepository } from '@/domain/token-repository/TokenRepository'
import { Token } from '@/domain/types/Token'
import { TokenSymbol } from '@/domain/types/TokenSymbol'
import { raise } from '@sparkdotfi/common-universal'

export type StakeActionPath =
  | 'usds-to-farm'
  | 'usdc-to-usds-to-farm'
  | 'dai-to-usds-to-farm'
  | 'susds-to-usds-to-farm'
  | 'sdai-to-usds-to-farm'

export interface GetStakeActionPathParams {
  token: Token
  tokenRepository: TokenRepository
  stakingToken: Token
}

export function getStakeActionPath({
  token,
  tokenRepository,
  stakingToken,
}: GetStakeActionPathParams): StakeActionPath {
  if (stakingToken.symbol === tokenRepository.USDS?.symbol) {
    if (token.symbol === tokenRepository.USDS?.symbol) {
      return 'usds-to-farm'
    }

    if (token.symbol === TokenSymbol('USDC')) {
      return 'usdc-to-usds-to-farm'
    }

    if (token.symbol === tokenRepository.DAI?.symbol) {
      return 'dai-to-usds-to-farm'
    }

    if (token.symbol === tokenRepository.sUSDS?.symbol) {
      return 'susds-to-usds-to-farm'
    }

    if (token.symbol === tokenRepository.sDAI?.symbol) {
      return 'sdai-to-usds-to-farm'
    }
  }

  raise('Farm deposit action type not recognized')
}
