import { rayMul } from '@aave/math-utils'
import { stringToHex } from 'viem'
import { Config } from 'wagmi'
import { multicall } from 'wagmi/actions'

import { iamAutoLineAbi, iamAutoLineAddress, vatAbi, vatAddress } from '@/config/contracts-generated'
import { getContractAddress } from '@/domain/hooks/useContractAddress'
import { fromRad, fromWad } from '@/utils/math'
import { bigNumberify } from '@sparkdotfi/common-universal'

import { NormalizedUnitNumber } from '@sparkdotfi/common-universal'
import { getIsChainSupported } from './getIsChainSupported'
import { D3MInfo } from './types'

interface D3MInfoQueryParams {
  wagmiConfig: Config
  chainId: number
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function D3MInfoQuery({ wagmiConfig, chainId }: D3MInfoQueryParams) {
  const queryKey = ['maker-info', chainId]

  const isChainSupported = getIsChainSupported(chainId)
  if (!isChainSupported) {
    return { queryKey, queryFn: async () => null }
  }

  const makerVatAddress = getContractAddress(vatAddress, chainId)
  const makerIamAutoLineAddress = getContractAddress(iamAutoLineAddress, chainId)
  const sparkIlkId = stringToHex('DIRECT-SPARK-DAI', { size: 32 })

  async function queryFn(): Promise<D3MInfo> {
    const [[vatArt, vatRate], [max, gap, ttl, last, lastInc]] = await multicall(wagmiConfig, {
      allowFailure: false,
      chainId,
      contracts: [
        {
          address: makerVatAddress,
          functionName: 'ilks',
          args: [sparkIlkId],
          abi: vatAbi,
        },
        {
          address: makerIamAutoLineAddress,
          functionName: 'ilks',
          args: [sparkIlkId],
          abi: iamAutoLineAbi,
        },
      ],
    })
    const D3MCurrentDebt = rayMul(bigNumberify(vatArt), bigNumberify(vatRate))
    const D3MCurrentDebtUSD = NormalizedUnitNumber(fromWad(D3MCurrentDebt))
    const maxDebtCeiling = NormalizedUnitNumber(fromRad(bigNumberify(max)))

    return {
      D3MCurrentDebtUSD,
      maxDebtCeiling,
      gap: NormalizedUnitNumber(fromRad(bigNumberify(gap))),
      increaseCooldown: ttl,
      lastUpdateBlock: last,
      lastIncreaseTimestamp: lastInc,
    }
  }

  return { queryKey, queryFn }
}
