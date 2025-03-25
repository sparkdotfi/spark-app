import { capAutomatorConfig } from '@/config/contracts-generated'
import { NormalizedUnitNumber } from '@sparkdotfi/common-universal'
import { queryOptions } from '@tanstack/react-query'
import { Config } from 'wagmi'
import { readContract } from 'wagmi/actions'
import { getOptionalContractAddress } from '../hooks/useContractAddress'
import { Token } from '../types/Token'
import { CapAutomatorConfig, CapAutomatorInfo } from './types'

interface CapAutomatorParams {
  wagmiConfig: Config
  chainId: number
  token: Token
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function capAutomatorQueryOptions({ token, wagmiConfig, chainId }: CapAutomatorParams) {
  return queryOptions<CapAutomatorInfo>({
    queryKey: capAutomatorQueryKey({ token, chainId }),
    queryFn: async () => {
      const capAutomatorAddress = getOptionalContractAddress(capAutomatorConfig.address, chainId)

      if (!capAutomatorAddress) {
        return {
          supplyCap: undefined,
          borrowCap: undefined,
        }
      }

      const caps = await Promise.all([
        readContract(wagmiConfig, {
          address: capAutomatorAddress,
          args: [token.address],
          abi: capAutomatorConfig.abi,
          functionName: 'supplyCapConfigs',
        }),
        readContract(wagmiConfig, {
          address: capAutomatorAddress,
          args: [token.address],
          abi: capAutomatorConfig.abi,
          functionName: 'borrowCapConfigs',
        }),
      ])

      const [supplyCap, borrowCap] = caps.map(formatCapStructToConfig)

      return {
        supplyCap,
        borrowCap,
      }
    },
  })
}

function formatCapStructToConfig(
  capStruct: readonly [number, number, number, number, number],
): CapAutomatorConfig | undefined {
  const [max, gap, increaseCooldown, lastUpdateBlock, lastIncreaseTime] = capStruct

  if (max === 0) {
    return undefined
  }

  return {
    maxCap: NormalizedUnitNumber(max),
    gap: NormalizedUnitNumber(gap),
    increaseCooldown,
    lastUpdateBlock,
    lastIncreaseTimestamp: lastIncreaseTime,
  }
}

export function capAutomatorQueryKey({ token, chainId }: Omit<CapAutomatorParams, 'wagmiConfig'>): unknown[] {
  return ['cap-automator', chainId, token.address]
}
