import { TokenSymbol } from '@/domain/types/TokenSymbol'
import { getMockToken, testAddresses } from '@/test/integration/constants'
import { expectToStay } from '@/test/integration/expect'
import { handlers } from '@/test/integration/mockTransport'
import { createUpdatableHandler } from '@/test/integration/mockTransport/handlers'
import { setupUseContractActionRenderer } from '@/test/integration/setupUseContractActionRenderer'
import { toBigInt } from '@sparkdotfi/common-universal'
import { NormalizedUnitNumber } from '@sparkdotfi/common-universal'
import { waitFor } from '@testing-library/react'
import { erc20Abi } from 'viem'
import { mainnet } from 'viem/chains'
import { describe, test } from 'vitest'
import { createApproveActionConfig } from './approveAction'

const defaultValue = NormalizedUnitNumber(1)
const token = getMockToken({ symbol: TokenSymbol('TEST') })
const account = testAddresses.alice
const spender = testAddresses.bob
const chainId = mainnet.id

const hookRenderer = setupUseContractActionRenderer({
  account,
  handlers: [handlers.chainIdCall({ chainId }), handlers.balanceCall({ balance: 0n, address: account })],
  args: { action: { type: 'approve', token, spender, value: defaultValue }, enabled: true },
})

describe(createApproveActionConfig.name, () => {
  test('performs action', async () => {
    const { handler: allowanceHandler, update: updateAllowanceHandler } = createUpdatableHandler({
      initialHandler: handlers.contractCall({
        to: token.address,
        abi: erc20Abi,
        functionName: 'allowance',
        args: [account, spender],
        result: 0n,
      }),
    })

    const { result } = hookRenderer({
      args: { action: { type: 'approve', token, spender, value: defaultValue }, enabled: true },
      extraHandlers: [
        allowanceHandler,
        handlers.contractCall({
          to: token.address,
          abi: erc20Abi,
          functionName: 'approve',
          args: [spender, toBigInt(token.toBaseUnit(defaultValue))],
          result: true,
          from: account,
        }),
        handlers.mineTransaction(),
      ],
    })

    await waitFor(() => {
      expect(result.current.state.status).toBe('ready')
    })

    updateAllowanceHandler(
      handlers.contractCall({
        to: token.address,
        abi: erc20Abi,
        functionName: 'allowance',
        args: [account, spender],
        result: toBigInt(token.toBaseUnit(defaultValue)),
      }),
    )

    result.current.onAction()

    await waitFor(() => {
      expect(result.current.state.status).toBe('success')
    })
  })

  test('stays in ready state if allowance is not enough after action', async () => {
    const { handler: allowanceHandler, update: updateAllowanceHandler } = createUpdatableHandler({
      initialHandler: handlers.contractCall({
        to: token.address,
        abi: erc20Abi,
        functionName: 'allowance',
        args: [account, spender],
        result: 0n,
      }),
    })

    const { result } = hookRenderer({
      args: { action: { type: 'approve', token, spender, value: defaultValue }, enabled: true },
      extraHandlers: [
        allowanceHandler,
        handlers.contractCall({
          to: token.address,
          abi: erc20Abi,
          functionName: 'approve',
          args: [spender, toBigInt(token.toBaseUnit(defaultValue))],
          result: true,
          from: account,
        }),
        handlers.mineTransaction(),
      ],
    })

    await waitFor(() => {
      expect(result.current.state.status).toBe('ready')
    })

    updateAllowanceHandler(
      handlers.contractCall({
        to: token.address,
        abi: erc20Abi,
        functionName: 'allowance',
        args: [account, spender],
        result: toBigInt(token.toBaseUnit(defaultValue)) - 1n, // allowance is not enough
      }),
    )

    result.current.onAction()

    await expectToStay(() => result.current.state.status, 'ready')
  })
})
