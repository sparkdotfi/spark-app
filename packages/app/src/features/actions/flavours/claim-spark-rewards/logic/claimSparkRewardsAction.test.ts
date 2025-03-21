import { testSparkRewardsConfig } from '@/config/contracts-generated'
import { getContractAddress } from '@/domain/hooks/useContractAddress'
import { getBalancesQueryKeyPrefix } from '@/domain/wallet/getBalancesQueryKeyPrefix'
import { getMockToken, testAddresses } from '@/test/integration/constants'
import { handlers } from '@/test/integration/mockTransport'
import { setupUseContractActionRenderer } from '@/test/integration/setupUseContractActionRenderer'
import { Hex, NormalizedUnitNumber, toBigInt } from '@marsfoundation/common-universal'
import { waitFor } from '@testing-library/react'
import { times } from 'remeda'
import { mainnet } from 'viem/chains'
import { describe, test } from 'vitest'
import { createClaimSparkRewardsActionConfig } from './claimSparkRewardsAction'

const account = testAddresses.alice
const chainId = mainnet.id
const epoch = 123
const token = getMockToken()
const cumulativeAmount = NormalizedUnitNumber(100)
const merkleRoot = Hex.random()
const merkleProof = times(7, () => Hex.random())

const hookRenderer = setupUseContractActionRenderer({
  account,
  handlers: [handlers.chainIdCall({ chainId }), handlers.balanceCall({ balance: 0n, address: account })],
  args: {
    action: {
      type: 'claimSparkRewards',
      epoch,
      token,
      cumulativeAmount,
      merkleRoot,
      merkleProof,
    },
    enabled: true,
  },
})

describe(createClaimSparkRewardsActionConfig.name, () => {
  test('claims spark rewards', async () => {
    const { result, queryInvalidationManager } = hookRenderer({
      extraHandlers: [
        handlers.contractCall({
          to: getContractAddress(testSparkRewardsConfig.address, chainId),
          from: account,
          abi: testSparkRewardsConfig.abi,
          functionName: 'claim',
          args: [
            BigInt(epoch),
            account,
            token.address,
            toBigInt(token.toBaseUnit(cumulativeAmount)),
            merkleRoot,
            merkleProof,
          ],
          result: toBigInt(token.toBaseUnit(cumulativeAmount)),
        }),
        handlers.mineTransaction(),
      ],
    })

    await waitFor(() => {
      expect(result.current.state.status).toBe('ready')
    })

    result.current.onAction()

    await waitFor(() => {
      expect(result.current.state.status).toBe('success')
    })

    await expect(queryInvalidationManager).toHaveReceivedInvalidationCall(
      getBalancesQueryKeyPrefix({ chainId, account }),
    )
  })
})
