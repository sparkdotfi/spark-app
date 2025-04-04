import { SPARK_UI_REFERRAL_CODE_BIGINT } from '@/config/consts'
import { psm3Abi, psm3Address } from '@/config/contracts-generated'
import { TokenRepository } from '@/domain/token-repository/TokenRepository'
import { TokenSymbol } from '@/domain/types/TokenSymbol'
import { getBalancesQueryKeyPrefix } from '@/domain/wallet/getBalancesQueryKeyPrefix'
import { getMockToken, testAddresses, testTokens } from '@/test/integration/constants'
import { handlers } from '@/test/integration/mockTransport'
import { setupUseContractActionRenderer } from '@/test/integration/setupUseContractActionRenderer'
import { toBigInt } from '@sparkdotfi/common-universal'
import { NormalizedNumber } from '@sparkdotfi/common-universal'
import { waitFor } from '@testing-library/react'
import { base } from 'viem/chains'
import { describe, test } from 'vitest'
import { allowanceQueryKey } from '../../approve/logic/query'
import { createPsmConvertActionConfig } from './psmConvertAction'

const account = testAddresses.alice
const chainId = base.id
const usdc = getMockToken({ symbol: TokenSymbol('USDC'), decimals: 6 })
const usds = getMockToken({ symbol: TokenSymbol('USDS') })
const amount = NormalizedNumber(1)

const mockTokenRepository = new TokenRepository(
  [
    { token: usdc, balance: NormalizedNumber(100) },
    { token: usds, balance: NormalizedNumber(100) },
  ],
  {
    USDS: testTokens.USDS.symbol,
    sUSDS: testTokens.sUSDS.symbol,
  },
)

const hookRenderer = setupUseContractActionRenderer({
  account,
  chain: base,
  handlers: [handlers.chainIdCall({ chainId }), handlers.balanceCall({ balance: 0n, address: account })],
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
})

describe(createPsmConvertActionConfig.name, () => {
  test('converts usdc to usds', async () => {
    const { result, queryInvalidationManager } = hookRenderer({
      extraHandlers: [
        handlers.contractCall({
          to: psm3Address[base.id],
          abi: psm3Abi,
          functionName: 'swapExactIn',
          args: [
            usdc.address,
            usds.address,
            toBigInt(usdc.toBaseUnit(amount)),
            toBigInt(usds.toBaseUnit(amount)),
            account,
            SPARK_UI_REFERRAL_CODE_BIGINT,
          ],
          from: account,
          result: toBigInt(usdc.toBaseUnit(amount)),
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
        spender: psm3Address[base.id],
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
          to: psm3Address[base.id],
          abi: psm3Abi,
          functionName: 'swapExactIn',
          args: [
            usds.address,
            usdc.address,
            toBigInt(usds.toBaseUnit(amount)),
            toBigInt(usdc.toBaseUnit(amount)),
            account,
            SPARK_UI_REFERRAL_CODE_BIGINT,
          ],
          from: account,
          result: toBigInt(usdc.toBaseUnit(amount)),
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
        spender: psm3Address[base.id],
        account,
        chainId,
      }),
    )
  })
})
