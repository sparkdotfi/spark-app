import { TokenRepository } from '@/domain/token-repository/TokenRepository'
import { Token } from '@/domain/types/Token'
import { TokenSymbol } from '@/domain/types/TokenSymbol'
import { raise } from '@sparkdotfi/common-universal'
import { arbitrum, base, gnosis } from 'viem/chains'

export type SavingsDepositActionPath =
  | 'usds-to-susds'
  | 'dai-to-susds'
  | 'usdc-to-susds'
  | 'dai-to-sdai'
  | 'usdc-to-sdai'
  | 'usdc-to-susdc'
  | 'sexy-dai-to-sdai'
  | 'base-usds-to-susds'
  | 'base-usdc-to-susds'
  | 'base-usdc-to-susdc'
  | 'arbitrum-usds-to-susds'
  | 'arbitrum-usdc-to-susds'
  | 'arbitrum-usdc-to-susdc'

export interface GetSavingsActionPathParams {
  token: Token
  savingsToken: Token
  tokenRepository: TokenRepository
  chainId: number
}

export function getSavingsDepositActionPath({
  token,
  savingsToken,
  tokenRepository,
  chainId,
}: GetSavingsActionPathParams): SavingsDepositActionPath {
  const usds = tokenRepository.USDS?.symbol
  const usdc = TokenSymbol('USDC')
  const dai = tokenRepository.DAI?.symbol
  const sdai = tokenRepository.sDAI?.symbol
  const susds = tokenRepository.sUSDS?.symbol
  const susdc = TokenSymbol('sUSDC')

  if (token.symbol === dai && savingsToken.symbol === sdai && chainId === gnosis.id) {
    return 'sexy-dai-to-sdai'
  }

  if (chainId === base.id) {
    if (token.symbol === usds && savingsToken.symbol === susds) {
      return 'base-usds-to-susds'
    }

    if (token.symbol === usdc && savingsToken.symbol === susds) {
      return 'base-usdc-to-susds'
    }

    if (token.symbol === usdc && savingsToken.symbol === susdc) {
      return 'base-usdc-to-susdc'
    }
  }

  if (chainId === arbitrum.id) {
    if (token.symbol === usds && savingsToken.symbol === susds) {
      return 'arbitrum-usds-to-susds'
    }

    if (token.symbol === usdc && savingsToken.symbol === susds) {
      return 'arbitrum-usdc-to-susds'
    }

    if (token.symbol === usdc && savingsToken.symbol === susdc) {
      return 'arbitrum-usdc-to-susdc'
    }
  }

  if (token.symbol === usds && savingsToken.symbol === susds) {
    return 'usds-to-susds'
  }

  if (token.symbol === dai && savingsToken.symbol === susds) {
    return 'dai-to-susds'
  }

  if (token.symbol === usdc && savingsToken.symbol === susds) {
    return 'usdc-to-susds'
  }

  if (token.symbol === dai && savingsToken.symbol === sdai) {
    return 'dai-to-sdai'
  }

  if (token.symbol === usdc && savingsToken.symbol === sdai) {
    return 'usdc-to-sdai'
  }

  if (token.symbol === usdc && savingsToken.symbol === susdc) {
    return 'usdc-to-susdc'
  }

  raise('Savings deposit action type not recognized')
}
