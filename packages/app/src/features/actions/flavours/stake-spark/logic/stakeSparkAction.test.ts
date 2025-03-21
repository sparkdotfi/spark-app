import { testSparkStakingConfig } from '@/config/contracts-generated'
import { getContractAddress } from '@/domain/hooks/useContractAddress'
import { TokenSymbol } from '@/domain/types/TokenSymbol'
import { getBalancesQueryKeyPrefix } from '@/domain/wallet/getBalancesQueryKeyPrefix'
import { getMockToken, testAddresses } from '@/test/integration/constants'
import { handlers } from '@/test/integration/mockTransport'
import { setupUseContractActionRenderer } from '@/test/integration/setupUseContractActionRenderer'
import { NormalizedUnitNumber, toBigInt } from '@marsfoundation/common-universal'
import { waitFor } from '@testing-library/react'
import { mainnet } from 'viem/chains'
import { describe, test } from 'vitest'
import { allowanceQueryKey } from '../../approve/logic/query'
import { createStakeSparkActionConfig } from './stakeSparkAction'

const spk = getMockToken({ symbol: TokenSymbol('SPK') })
const account = testAddresses.alice
const chainId = mainnet.id
const amount = NormalizedUnitNumber(1)
const vault = getContractAddress(testSparkStakingConfig.address, chainId)

const hookRenderer = setupUseContractActionRenderer({
  account,
  handlers: [handlers.chainIdCall({ chainId }), handlers.balanceCall({ balance: 0n, address: account })],
  args: {
    action: {
      type: 'stakeSpark',
      spk,
      amount,
    },
    enabled: true,
  },
})

describe(createStakeSparkActionConfig.name, () => {
  test('stakes spark', async () => {
    const { result, queryInvalidationManager } = hookRenderer({
      extraHandlers: [
        handlers.contractCall({
          to: vault,
          abi: testSparkStakingConfig.abi,
          functionName: 'deposit',
          args: [account, toBigInt(spk.toBaseUnit(amount))],
          from: account,
          result: [1n, 1n],
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
      getBalancesQueryKeyPrefix({ account, chainId }),
      // @todo: spark staking - add missing keys after new queries implemented
    )
    await expect(queryInvalidationManager).toHaveReceivedInvalidationCall(
      allowanceQueryKey({
        token: spk.address,
        spender: vault,
        account,
        chainId,
      }),
    )
  })
})
