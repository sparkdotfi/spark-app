import { getChainConfigEntry } from '@/config/chain'
import { TokenConfig } from '@/config/chain/types'
import { pathGroups } from '@/config/paths'
import { assertNever } from '@sparkdotfi/common-universal'
import { useChainId } from 'wagmi'
import { TokenRepository } from './TokenRepository'
import { useTokenRepository } from './useTokenRepository'

export interface UseTokenRepositoryForFeatureParams {
  chainId?: number
  featureGroup: keyof typeof pathGroups
}

export interface UseTokenRepositoryForFeatureResult {
  tokenRepository: TokenRepository
}

export function useTokenRepositoryForFeature(
  params: UseTokenRepositoryForFeatureParams,
): UseTokenRepositoryForFeatureResult {
  const _chainId = useChainId()
  const { featureGroup, chainId = _chainId } = params

  const chainConfig = getChainConfigEntry(chainId)
  const featureConfig = (() => {
    switch (featureGroup) {
      case 'borrow':
        return chainConfig.markets
      case 'savings':
        return chainConfig.savings
      case 'farms':
        return chainConfig.farms
      case 'sparkRewards':
        return undefined
      case 'sparkToken':
        return undefined
      default:
        assertNever(featureGroup)
    }
  })()
  const tokenConfigs = featureConfig
    ? extractTokensFromConfig({
        config: featureConfig,
        tokenConfigs: chainConfig.definedTokens,
      })
    : []

  return useTokenRepository({ chainId, tokenConfigs })
}

interface ExtractTokensFromConfigParams {
  config: any
  tokenConfigs: TokenConfig[]
}
function extractTokensFromConfig({ config, tokenConfigs }: ExtractTokensFromConfigParams): TokenConfig[] {
  const tokens: TokenConfig[] = []
  traverseObject(config, (_, value) => {
    const tokenConfig = tokenConfigs.find(
      (tokenConfig) => tokenConfig.symbol === value || tokenConfig.address === value,
    )
    if (tokenConfig) {
      tokens.push(tokenConfig)
    }
  })
  return tokens
}

function traverseObject(obj: any, callback: (key: string, value: any) => void): void {
  for (const [key, value] of Object.entries(obj)) {
    callback(key, value)

    if (typeof value === 'object' && value !== null) {
      traverseObject(value, callback)
    }
  }
}
