import { dssLitePsmConfig, usdsPsmWrapperConfig } from '@/config/contracts-generated'
import { getContractAddress } from '@/domain/hooks/useContractAddress'
import { TokenRepository } from '@/domain/token-repository/TokenRepository'
import { TokenSymbol } from '@/domain/types/TokenSymbol'
import { getBalancesQueryKeyPrefix } from '@/domain/wallet/getBalancesQueryKeyPrefix'
import { getMockToken, testAddresses, testTokens } from '@/test/integration/constants'
import { handlers } from '@/test/integration/mockTransport'
import { setupUseContractActionRenderer } from '@/test/integration/setupUseContractActionRenderer'
import { toBigInt } from '@sparkdotfi/common-universal'
import { NormalizedNumber } from '@sparkdotfi/common-universal'
import { waitFor } from '@testing-library/react'
import { mainnet } from 'viem/chains'
import { describe, test } from 'vitest'
import { allowanceQueryKey } from '../../approve/logic/query'
import { createPsmConvertActionConfig } from './psmConvertAction'

const account = testAddresses.alice
const chainId = mainnet.id
const usdc = getMockToken({ symbol: TokenSymbol('USDC'), decimals: 6 })
const usds = getMockToken({ symbol: TokenSymbol('USDS') })
const dai = getMockToken({ symbol: TokenSymbol('DAI') })
const amount = NormalizedNumber(1)

const mockTokenRepository = new TokenRepository(
  [
    { token: usdc, balance: NormalizedNumber(100) },
    { token: dai, balance: NormalizedNumber(100) },
    { token: usds, balance: NormalizedNumber(100) },
  ],
  {
    DAI: testTokens.DAI.symbol,
    sDAI: testTokens.sDAI.symbol,
    USDS: testTokens.USDS.symbol,
    sUSDS: testTokens.sUSDS.symbol,
  },
)

const hookRenderer = setupUseContractActionRenderer({
  account,
  handlers: [handlers.chainIdCall({ chainId }), handlers.balanceCall({ balance: 0n, address: account })],
  args: {
    action: {
      type: 'psmConvert',
      inToken: usdc,
      outToken: dai,
      amount,
    },
    enabled: true,
    context: { tokenRepository: mockTokenRepository },
  },
})

describe(createPsmConvertActionConfig.name, () => {
  test('converts usdc to dai', async () => {
    const { result, queryInvalidationManager } = hookRenderer({
      extraHandlers: [
        handlers.contractCall({
          to: getContractAddress(dssLitePsmConfig.address, chainId),
          abi: dssLitePsmConfig.abi,
          functionName: 'sellGem',
          args: [account, toBigInt(usdc.toBaseUnit(amount))],
          from: account,
          result: toBigInt(dai.toBaseUnit(amount)),
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
    )
    await expect(queryInvalidationManager).toHaveReceivedInvalidationCall(
      allowanceQueryKey({
        token: usdc.address,
        spender: getContractAddress(dssLitePsmConfig.address, chainId),
        account,
        chainId,
      }),
    )
  })

  test('converts dai to usdc', async () => {
    const { result, queryInvalidationManager } = hookRenderer({
      args: {
        action: {
          type: 'psmConvert',
          inToken: dai,
          outToken: usdc,
          amount,
        },
        enabled: true,
        context: { tokenRepository: mockTokenRepository },
      },
      extraHandlers: [
        handlers.contractCall({
          to: getContractAddress(dssLitePsmConfig.address, chainId),
          abi: dssLitePsmConfig.abi,
          functionName: 'buyGem',
          args: [account, toBigInt(usdc.toBaseUnit(amount))],
          from: account,
          result: toBigInt(dai.toBaseUnit(amount)),
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
    )
    await expect(queryInvalidationManager).toHaveReceivedInvalidationCall(
      allowanceQueryKey({
        token: dai.address,
        spender: getContractAddress(dssLitePsmConfig.address, chainId),
        account,
        chainId,
      }),
    )
  })

  test('converts usdc to usds', async () => {
    const { result, queryInvalidationManager } = hookRenderer({
      args: {
        action: {
          type: 'psmConvert',
          inToken: usdc,
          outToken: usds,
          amount,
        },
        enabled: true,
        context: { tokenRepository: mockTokenRepository },
      },
      extraHandlers: [
        handlers.contractCall({
          to: getContractAddress(usdsPsmWrapperConfig.address, chainId),
          abi: usdsPsmWrapperConfig.abi,
          functionName: 'sellGem',
          args: [account, toBigInt(usdc.toBaseUnit(amount))],
          from: account,
          result: toBigInt(usds.toBaseUnit(amount)),
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
    )
    await expect(queryInvalidationManager).toHaveReceivedInvalidationCall(
      allowanceQueryKey({
        token: usdc.address,
        spender: getContractAddress(usdsPsmWrapperConfig.address, chainId),
        account,
        chainId,
      }),
    )
  })

  test('converts usds to usdc', async () => {
    const { result, queryInvalidationManager } = hookRenderer({
      args: {
        action: {
          type: 'psmConvert',
          inToken: usds,
          outToken: usdc,
          amount,
        },
        enabled: true,
        context: { tokenRepository: mockTokenRepository },
      },
      extraHandlers: [
        handlers.contractCall({
          to: getContractAddress(usdsPsmWrapperConfig.address, chainId),
          abi: usdsPsmWrapperConfig.abi,
          functionName: 'buyGem',
          args: [account, toBigInt(usdc.toBaseUnit(amount))],
          from: account,
          result: toBigInt(usds.toBaseUnit(amount)),
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
    )
    await expect(queryInvalidationManager).toHaveReceivedInvalidationCall(
      allowanceQueryKey({
        token: usds.address,
        spender: getContractAddress(usdsPsmWrapperConfig.address, chainId),
        account,
        chainId,
      }),
    )
  })
})
