import { debtTokenAbi } from '@/config/abis/debtTokenAbi'
import { wethGatewayAddress } from '@/config/contracts-generated'
import { TokenSymbol } from '@/domain/types/TokenSymbol'
import { getMockMarketInfo, getMockToken, testAddresses } from '@/test/integration/constants'
import { expectToStay } from '@/test/integration/expect'
import { handlers } from '@/test/integration/mockTransport'
import { createUpdatableHandler } from '@/test/integration/mockTransport/handlers'
import { setupUseContractActionRenderer } from '@/test/integration/setupUseContractActionRenderer'
import { CheckedAddress, toBigInt } from '@sparkdotfi/common-universal'
import { NormalizedNumber } from '@sparkdotfi/common-universal'
import { waitFor } from '@testing-library/react'
import { mainnet } from 'viem/chains'
import { describe, expect, test } from 'vitest'
import { createApproveDelegationActionConfig } from './approveDelegationAction'
import { getBorrowAllowanceQueryKey } from './query'

const approveValue = NormalizedNumber(1)
const token = getMockToken({ symbol: TokenSymbol('ETH'), address: CheckedAddress.EEEE() })
const account = testAddresses.alice
const chainId = mainnet.id
const marketInfo = getMockMarketInfo()
const debtTokenAddress = marketInfo.findOneReserveByToken(token).variableDebtTokenAddress
const wethGateway = wethGatewayAddress[chainId]

const hookRenderer = setupUseContractActionRenderer({
  account,
  handlers: [handlers.chainIdCall({ chainId }), handlers.balanceCall({ balance: 0n, address: account })],
  args: { action: { type: 'approveDelegation', token, value: approveValue }, enabled: true, context: { marketInfo } },
})

describe(createApproveDelegationActionConfig.name, () => {
  test('approves delegation', async () => {
    const { handler: allowanceHandler, update: updateAllowanceHandler } = createUpdatableHandler({
      initialHandler: handlers.contractCall({
        functionName: 'borrowAllowance',
        to: debtTokenAddress,
        abi: debtTokenAbi,
        args: [account, wethGateway],
        result: 0n,
      }),
    })

    const { result } = hookRenderer({
      extraHandlers: [
        allowanceHandler,
        handlers.contractCall({
          to: debtTokenAddress,
          abi: debtTokenAbi,
          functionName: 'approveDelegation',
          args: [wethGateway, toBigInt(token.toBaseUnit(approveValue))],
          result: undefined,
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
        functionName: 'borrowAllowance',
        to: debtTokenAddress,
        abi: debtTokenAbi,
        args: [account, wethGateway],
        result: toBigInt(token.toBaseUnit(approveValue)),
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
        functionName: 'borrowAllowance',
        to: debtTokenAddress,
        abi: debtTokenAbi,
        args: [account, wethGateway],
        result: 0n,
      }),
    })

    const { result } = hookRenderer({
      extraHandlers: [
        allowanceHandler,
        handlers.contractCall({
          to: debtTokenAddress,
          abi: debtTokenAbi,
          functionName: 'approveDelegation',
          args: [wethGateway, toBigInt(token.toBaseUnit(approveValue))],
          result: undefined,
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
        functionName: 'borrowAllowance',
        to: debtTokenAddress,
        abi: debtTokenAbi,
        args: [account, wethGateway],
        result: toBigInt(token.toBaseUnit(approveValue)) - 1n, // allowance is not enough,
      }),
    )

    result.current.onAction()

    await expectToStay(() => result.current.state.status, 'ready')
  })

  test('borrow allowance', async () => {
    const { handler: allowanceHandler, update: updateAllowanceHandler } = createUpdatableHandler({
      initialHandler: handlers.contractCall({
        functionName: 'borrowAllowance',
        to: debtTokenAddress,
        abi: debtTokenAbi,
        args: [account, wethGateway],
        result: 0n,
      }),
    })

    const { result, queryInvalidationManager } = hookRenderer({
      extraHandlers: [
        allowanceHandler,
        handlers.contractCall({
          to: debtTokenAddress,
          abi: debtTokenAbi,
          functionName: 'approveDelegation',
          args: [wethGateway, toBigInt(token.toBaseUnit(approveValue))],
          result: undefined,
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
        functionName: 'borrowAllowance',
        to: debtTokenAddress,
        abi: debtTokenAbi,
        args: [account, wethGateway],
        result: toBigInt(token.toBaseUnit(approveValue)),
      }),
    )

    result.current.onAction()

    await waitFor(() => {
      expect(result.current.state.status).toBe('success')
    })

    await expect(queryInvalidationManager).toHaveReceivedInvalidationCall(
      getBorrowAllowanceQueryKey({ fromUser: account, toUser: wethGateway, debtTokenAddress, chainId }),
    )
  })
})
