import { testSpkStakingConfig } from '@/config/contracts-generated'
import { getContractAddress } from '@/domain/hooks/useContractAddress'
import { TokenSymbol } from '@/domain/types/TokenSymbol'
import { spkStakingDataQueryKey } from '@/features/spk-staking/logic/useSpkStakingData'
import { getMockToken, testAddresses } from '@/test/integration/constants'
import { handlers } from '@/test/integration/mockTransport'
import { setupUseContractActionRenderer } from '@/test/integration/setupUseContractActionRenderer'
import { BaseUnitNumber, NormalizedNumber, toBigInt } from '@sparkdotfi/common-universal'
import { waitFor } from '@testing-library/react'
import { parseEther } from 'viem'
import { mainnet } from 'viem/chains'
import { describe, test } from 'vitest'
import { createUnstakeSpkActionConfig } from './unstakeSpkAction'

const spk = getMockToken({ symbol: TokenSymbol('SPK') })
const account = testAddresses.alice
const chainId = mainnet.id
const amount = NormalizedNumber(1)
const accountActiveShares = BaseUnitNumber(parseEther('1'))
const vault = getContractAddress(testSpkStakingConfig.address, chainId)

const hookRenderer = setupUseContractActionRenderer({
  account,
  handlers: [handlers.chainIdCall({ chainId }), handlers.balanceCall({ balance: 0n, address: account })],
  args: {
    action: {
      type: 'unstakeSpk',
      spk,
      amount,
      accountActiveShares,
      unstakeAll: false,
    },
    enabled: true,
  },
})

describe(createUnstakeSpkActionConfig.name, () => {
  test('unstakes spark token', async () => {
    const { result, queryInvalidationManager } = hookRenderer({
      extraHandlers: [
        handlers.contractCall({
          to: vault,
          abi: testSpkStakingConfig.abi,
          functionName: 'withdraw',
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

    await expect(queryInvalidationManager).toHaveReceivedInvalidationCall(spkStakingDataQueryKey({ account, chainId }))
  })

  test('unstakes all spark tokens', async () => {
    const { result, queryInvalidationManager } = hookRenderer({
      args: {
        action: {
          type: 'unstakeSpk',
          spk,
          amount,
          accountActiveShares,
          unstakeAll: true,
        },
        enabled: true,
      },
      extraHandlers: [
        handlers.contractCall({
          to: vault,
          abi: testSpkStakingConfig.abi,
          functionName: 'redeem',
          args: [account, toBigInt(accountActiveShares)],
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

    await expect(queryInvalidationManager).toHaveReceivedInvalidationCall(spkStakingDataQueryKey({ account, chainId }))
  })
})
