import { useSuspenseQuery } from '@tanstack/react-query'
import { useAccount, useConfig } from 'wagmi'

import { CheckedAddress } from '@sparkdotfi/common-universal'
import { NormalizedNumber } from '@sparkdotfi/common-universal'
import { useMarketInfo } from '../market-info/useMarketInfo'
import { Token } from '../types/Token'
import { TokenSymbol } from '../types/TokenSymbol'
import { marketBalances } from './marketBalances'

export interface WalletBalance {
  balance: NormalizedNumber
  token: Token
}

export interface MarketWalletInfoParams {
  chainId: number
}

export interface MarketWalletInfo {
  isConnected: boolean
  walletBalances: WalletBalance[]

  findWalletBalanceForToken: (token: Token) => NormalizedNumber
  findWalletBalanceForSymbol: (symbol: TokenSymbol) => NormalizedNumber
}

export function useMarketWalletInfo({ chainId }: MarketWalletInfoParams): MarketWalletInfo {
  const { address } = useAccount()
  const wagmiConfig = useConfig()
  const { marketInfo } = useMarketInfo({ chainId })

  const { data: balanceData } = useSuspenseQuery({
    ...marketBalances({
      wagmiConfig,
      account: address && CheckedAddress(address),
      chainId,
    }),
  })

  const walletBalances: WalletBalance[] = balanceData
    .map((balanceItem) => {
      const token = marketInfo.findReserveByUnderlyingAsset(balanceItem.address)?.token
      if (!token) {
        return {
          balance: undefined,
          token: undefined,
        }
      }

      return {
        balance: token.fromBaseUnit(balanceItem.balanceBaseUnit),
        token,
      }
    })
    .filter((r) => r.token)
    // @note: this map is here only to make TS happy :(
    .map((r) => ({
      balance: r.balance!,
      token: r.token!,
    }))

  /* eslint-disable func-style */
  const findWalletBalanceForToken = (token: Token): NormalizedNumber => {
    return findWalletBalanceForSymbol(token.symbol)
  }
  const findWalletBalanceForSymbol = (symbol: TokenSymbol): NormalizedNumber => {
    const aTokenReserve = marketInfo.findReserveByATokenSymbol(symbol)
    if (aTokenReserve) {
      return aTokenReserve.aTokenBalance
    }

    return walletBalances.find((wb) => wb.token.symbol === symbol)?.balance ?? NormalizedNumber.ZERO
  }
  /* eslint-enable func-style */

  return {
    walletBalances,
    isConnected: address !== undefined,
    findWalletBalanceForToken,
    findWalletBalanceForSymbol,
  }
}
