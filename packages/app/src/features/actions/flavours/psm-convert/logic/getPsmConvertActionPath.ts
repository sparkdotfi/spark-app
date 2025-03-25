import { TokenRepository } from '@/domain/token-repository/TokenRepository'
import { Token } from '@/domain/types/Token'
import { TokenSymbol } from '@/domain/types/TokenSymbol'
import { raise } from '@sparkdotfi/common-universal'
import { arbitrum, base } from 'viem/chains'

export type PsmConvertActionPath =
  | 'dai-usdc'
  | 'usdc-dai'
  | 'usdc-usds'
  | 'usds-usdc'
  | 'base-usdc-usds'
  | 'base-usds-usdc'
  | 'arbitrum-usdc-usds'
  | 'arbitrum-usds-usdc'

export interface GetPsmConvertActionPathParams {
  inToken: Token
  outToken: Token
  tokenRepository: TokenRepository
  chainId: number
}

export function getPsmConvertActionPath({
  inToken,
  outToken,
  tokenRepository,
  chainId,
}: { inToken: Token; outToken: Token; tokenRepository: TokenRepository; chainId: number }): PsmConvertActionPath {
  const dai = tokenRepository.DAI?.symbol
  const usdc = TokenSymbol('USDC')
  const usds = tokenRepository.USDS?.symbol

  if (chainId === base.id) {
    if (inToken.symbol === usdc && outToken.symbol === usds) {
      return 'base-usdc-usds'
    }

    if (inToken.symbol === usds && outToken.symbol === usdc) {
      return 'base-usds-usdc'
    }
  }

  if (chainId === arbitrum.id) {
    if (inToken.symbol === usdc && outToken.symbol === usds) {
      return 'arbitrum-usdc-usds'
    }

    if (inToken.symbol === usds && outToken.symbol === usdc) {
      return 'arbitrum-usds-usdc'
    }
  }

  if (inToken.symbol === dai && outToken.symbol === usdc) {
    return 'dai-usdc'
  }

  if (inToken.symbol === usdc && outToken.symbol === dai) {
    return 'usdc-dai'
  }

  if (inToken.symbol === usdc && outToken.symbol === usds) {
    return 'usdc-usds'
  }

  if (inToken.symbol === usds && outToken.symbol === usdc) {
    return 'usds-usdc'
  }

  raise('Psm convert action type not recognized')
}
