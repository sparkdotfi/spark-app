import { aaveContractErrors } from '@/config/aaveContractErrors'
import { poolAbi } from '@/config/abis/poolAbi'
import { lendingPoolConfig } from '@/config/contracts-generated'
import { getMockMarketInfo, testAddresses, testTokens } from '@/test/integration/constants'
import { handlers } from '@/test/integration/mockTransport'
import { setupUseContractActionRenderer } from '@/test/integration/setupUseContractActionRenderer'
import { NormalizedUnitNumber, toBigInt } from '@sparkdotfi/common-universal'
import { waitFor } from '@testing-library/react'
import { mainnet } from 'viem/chains'
import { test } from 'vitest'
import { useContractAction } from './useContractAction'

const userAddress = testAddresses.alice
const chainId = mainnet.id
const token = testTokens.WETH
const value = NormalizedUnitNumber(1)

const hookRenderer = setupUseContractActionRenderer({
  account: userAddress,
  handlers: [handlers.chainIdCall({ chainId })],
  args: {
    action: { type: 'withdraw', token, value },
    enabled: true,
    context: {
      marketInfo: getMockMarketInfo(),
    },
  },
})

describe(useContractAction.name, () => {
  test('translates aave errors', async () => {
    const { result } = hookRenderer({
      extraHandlers: [
        handlers.contractCallError({
          abi: poolAbi,
          to: lendingPoolConfig.address[chainId],
          from: userAddress,
          functionName: 'withdraw',
          args: [token.address, toBigInt(token.toBaseUnit(value)), userAddress],
          errorMessage: '57',
        }),
        handlers.mineTransaction(),
      ],
    })

    await waitFor(() => expect((result.current.state as any).message).toBe(aaveContractErrors['57']))
  })
})
