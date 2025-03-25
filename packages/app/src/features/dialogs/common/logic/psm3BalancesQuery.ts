import { psm3Address } from '@/config/contracts-generated'
import { getContractAddress } from '@/domain/hooks/useContractAddress'
import { TokenRepository } from '@/domain/token-repository/TokenRepository'
import { TokenSymbol } from '@/domain/types/TokenSymbol'
import { BaseUnitNumber } from '@sparkdotfi/common-universal'
import { erc20Abi } from 'viem'
import { Config } from 'wagmi'
import { readContract } from 'wagmi/actions'

export interface Psm3BalancesQueryParams {
  tokenRepository: TokenRepository
  wagmiConfig: Config
  chainId: number
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function psm3Balances({ tokenRepository, wagmiConfig, chainId }: Psm3BalancesQueryParams) {
  const usds = tokenRepository.findOneTokenBySymbol(TokenSymbol('USDS'))
  const usdc = tokenRepository.findOneTokenBySymbol(TokenSymbol('USDC'))
  const susds = tokenRepository.findOneTokenBySymbol(TokenSymbol('sUSDS'))
  const psm3 = getContractAddress(psm3Address, chainId)

  return {
    queryKey: ['psm3-balances', chainId, psm3],
    queryFn: async () => {
      const [usdsBalance, usdcBalance, susdsBalance] = await Promise.all([
        readContract(wagmiConfig, {
          address: usds.address,
          abi: erc20Abi,
          functionName: 'balanceOf',
          args: [psm3],
        }),
        readContract(wagmiConfig, {
          address: usdc.address,
          abi: erc20Abi,
          functionName: 'balanceOf',
          args: [psm3],
        }),
        readContract(wagmiConfig, {
          address: susds.address,
          abi: erc20Abi,
          functionName: 'balanceOf',
          args: [psm3],
        }),
      ])

      return {
        usds: usds.fromBaseUnit(BaseUnitNumber(usdsBalance)),
        usdc: usdc.fromBaseUnit(BaseUnitNumber(usdcBalance)),
        susds: susds.fromBaseUnit(BaseUnitNumber(susdsBalance)),
      }
    },
  }
}
