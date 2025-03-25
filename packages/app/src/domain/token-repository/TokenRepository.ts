import { TokenWithBalance } from '@/domain/common/types'
import { Token } from '@/domain/types/Token'
import { TokenSymbol } from '@/domain/types/TokenSymbol'
import { CheckedAddress, NormalizedUnitNumber, raise } from '@sparkdotfi/common-universal'

export interface FeaturedTokens {
  DAI?: TokenSymbol
  sDAI?: TokenSymbol
  USDS?: TokenSymbol
  sUSDS?: TokenSymbol
}

export class TokenRepository {
  constructor(
    private readonly tokens: TokenWithBalance[],
    private readonly featured: FeaturedTokens,
  ) {}

  all(): TokenWithBalance[] {
    return this.tokens
  }

  filter(predicate: (token: TokenWithBalance) => boolean): TokenWithBalance[] {
    return this.tokens.filter(predicate)
  }

  findTokenBySymbol(symbol: TokenSymbol): Token | undefined {
    return this.tokens.find(({ token }) => token.symbol === symbol)?.token
  }

  findOneTokenBySymbol(symbol: TokenSymbol): Token {
    return this.findTokenBySymbol(symbol) ?? raise(`Token with symbol ${symbol} not found`)
  }

  findBalanceBySymbol(symbol: TokenSymbol): NormalizedUnitNumber | undefined {
    return this.tokens.find(({ token }) => token.symbol === symbol)?.balance
  }

  findOneBalanceBySymbol(symbol: TokenSymbol): NormalizedUnitNumber {
    return this.findBalanceBySymbol(symbol) ?? raise(`Balance for symbol ${symbol} not found`)
  }

  findTokenWithBalanceBySymbol(symbol: TokenSymbol): TokenWithBalance | undefined {
    return this.tokens.find(({ token }) => token.symbol === symbol)
  }

  findOneTokenWithBalanceBySymbol(symbol: TokenSymbol): TokenWithBalance {
    return this.findTokenWithBalanceBySymbol(symbol) ?? raise(`Token with symbol ${symbol} not found`)
  }

  findTokenByAddress(address: CheckedAddress): Token | undefined {
    return this.tokens.find(({ token }) => token.address === address)?.token
  }

  findOneTokenByAddress(address: CheckedAddress): Token {
    return this.findTokenByAddress(address) ?? raise(`Token with address ${address} not found`)
  }

  get DAI(): Token | undefined {
    return this.featured.DAI && this.findOneTokenBySymbol(this.featured.DAI)
  }

  get sDAI(): Token | undefined {
    return this.featured.sDAI && this.findOneTokenBySymbol(this.featured.sDAI)
  }

  get USDS(): Token | undefined {
    return this.featured.USDS && this.findOneTokenBySymbol(this.featured.USDS)
  }

  get sUSDS(): Token | undefined {
    return this.featured.sUSDS && this.findOneTokenBySymbol(this.featured.sUSDS)
  }
}
