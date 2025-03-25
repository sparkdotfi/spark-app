import { SPARK_UI_REFERRAL_CODE, SPARK_UI_REFERRAL_CODE_BIGINT } from '@/config/consts'
import { psm3Abi, psm3Address, usdcVaultAbi, usdcVaultAddress } from '@/config/contracts-generated'
import { getContractAddress } from '@/domain/hooks/useContractAddress'
import { EPOCH_LENGTH } from '@/domain/market-info/consts'
import { PotSavingsConverter } from '@/domain/savings-converters/PotSavingsConverter'
import { SavingsAccountRepository } from '@/domain/savings-converters/types'
import { TokenRepository } from '@/domain/token-repository/TokenRepository'
import { getBalancesQueryKeyPrefix } from '@/domain/wallet/getBalancesQueryKeyPrefix'
import { allowanceQueryKey } from '@/features/actions/flavours/approve/logic/query'
import { testAddresses, testTokens } from '@/test/integration/constants'
import { handlers } from '@/test/integration/mockTransport'
import { setupUseContractActionRenderer } from '@/test/integration/setupUseContractActionRenderer'
import { bigNumberify, toBigInt } from '@sparkdotfi/common-universal'
import { NormalizedUnitNumber } from '@sparkdotfi/common-universal'
import { waitFor } from '@testing-library/react'
import { base } from 'viem/chains'
import { describe, test } from 'vitest'
import { createDepositToSavingsActionConfig } from './depositToSavingsAction'
import { formatMinAmountOutForPsm3 } from './formatMinAmountOutForPsm3'

const account = testAddresses.alice
const depositValue = NormalizedUnitNumber(1)
const usds = testTokens.USDS
const susds = testTokens.sUSDS
const usdc = testTokens.USDC
const susdc = testTokens.sUSDC.clone({
  address: getContractAddress(usdcVaultAddress, base.id),
})
const referralCode = SPARK_UI_REFERRAL_CODE_BIGINT
const mockTokenRepository = new TokenRepository(
  [
    { token: usds, balance: NormalizedUnitNumber(100) },
    { token: susds, balance: NormalizedUnitNumber(100) },
    { token: usdc, balance: NormalizedUnitNumber(100) },
  ],
  {
    USDS: usds.symbol,
    sUSDS: susds.symbol,
  },
)
const timestamp = 1000
const savingsConverterTimestamp = timestamp + 24 * 60 * 60
const mockSavingsConverter = new PotSavingsConverter({
  potParams: {
    dsr: bigNumberify('1000001103127689513476993127'), // 10% / day
    rho: bigNumberify(timestamp),
    chi: bigNumberify('1000000000000000000000000000'), // 1
  },
  currentTimestamp: savingsConverterTimestamp,
})

const savingsAccountsWithSusds = new SavingsAccountRepository([
  {
    converter: mockSavingsConverter,
    savingsToken: susds,
    underlyingToken: usds,
  },
])
const savingsAccountsWithSusdc = new SavingsAccountRepository([
  {
    converter: mockSavingsConverter,
    savingsToken: susdc,
    underlyingToken: usdc,
  },
])

const minAmountOut = mockSavingsConverter.predictSharesAmount({
  assets: depositValue,
  timestamp: savingsConverterTimestamp + EPOCH_LENGTH,
})

const chainId = base.id

const hookRenderer = setupUseContractActionRenderer({
  account,
  handlers: [handlers.chainIdCall({ chainId }), handlers.balanceCall({ balance: 0n, address: account })],
  args: { action: { type: 'depositToSavings', token: usds, savingsToken: susds, value: depositValue }, enabled: true },
})

describe(createDepositToSavingsActionConfig.name, () => {
  test('deposits usds to susds', async () => {
    const { result, queryInvalidationManager } = hookRenderer({
      args: {
        action: { type: 'depositToSavings', token: usds, savingsToken: susds, value: depositValue },
        enabled: true,
        context: {
          tokenRepository: mockTokenRepository,
          savingsAccounts: savingsAccountsWithSusds,
          walletType: 'browser-injected',
        },
      },
      chain: base,
      extraHandlers: [
        handlers.contractCall({
          to: psm3Address[base.id],
          abi: psm3Abi,
          functionName: 'swapExactIn',
          args: [
            usds.address,
            susds.address,
            toBigInt(usds.toBaseUnit(depositValue)),
            toBigInt(susds.toBaseUnit(minAmountOut)),
            account,
            referralCode,
          ],
          from: account,
          result: 1n,
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
      allowanceQueryKey({ token: usds.address, spender: psm3Address[base.id], account, chainId }),
    )
  })

  test('deposits usdc to susds', async () => {
    const minAmountOutFormatted = formatMinAmountOutForPsm3({
      susds,
      susdsAmount: minAmountOut,
      assetIn: usdc,
    })

    const { result, queryInvalidationManager } = hookRenderer({
      args: {
        action: { type: 'depositToSavings', token: usdc, savingsToken: susds, value: depositValue },
        enabled: true,
        context: {
          tokenRepository: mockTokenRepository,
          savingsAccounts: savingsAccountsWithSusds,
          walletType: 'browser-injected',
        },
      },
      chain: base,
      extraHandlers: [
        handlers.contractCall({
          to: psm3Address[base.id],
          abi: psm3Abi,
          functionName: 'swapExactIn',
          args: [
            usdc.address,
            susds.address,
            toBigInt(usdc.toBaseUnit(depositValue)),
            minAmountOutFormatted,
            account,
            referralCode,
          ],
          from: account,
          result: 1n,
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
      allowanceQueryKey({ token: usdc.address, spender: psm3Address[base.id], account, chainId }),
    )
  })

  test('deposits base usdc to susdc', async () => {
    const minAmountOutFormatted = formatMinAmountOutForPsm3({
      susds,
      susdsAmount: minAmountOut,
      assetIn: usdc,
    })

    const { result, queryInvalidationManager } = hookRenderer({
      args: {
        action: { type: 'depositToSavings', token: usdc, savingsToken: susdc, value: depositValue },
        enabled: true,
        context: {
          tokenRepository: mockTokenRepository,
          savingsAccounts: savingsAccountsWithSusdc,
          walletType: 'browser-injected',
        },
      },
      chain: base,
      extraHandlers: [
        handlers.contractCall({
          to: getContractAddress(usdcVaultAddress, chainId),
          abi: usdcVaultAbi,
          functionName: 'deposit',
          args: [toBigInt(usdc.toBaseUnit(depositValue)), account, minAmountOutFormatted, SPARK_UI_REFERRAL_CODE],
          from: account,
          result: 1n,
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
        spender: getContractAddress(usdcVaultAddress, chainId),
        account,
        chainId,
      }),
    )
  })
})
