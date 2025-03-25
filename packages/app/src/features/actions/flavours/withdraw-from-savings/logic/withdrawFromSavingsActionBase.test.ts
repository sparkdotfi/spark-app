import { SPARK_UI_REFERRAL_CODE_BIGINT } from '@/config/consts'
import { psm3Abi, psm3Address, usdcVaultAbi, usdcVaultAddress } from '@/config/contracts-generated'
import { getContractAddress } from '@/domain/hooks/useContractAddress'
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
import { formatMaxAmountInForPsm3 } from './formatMaxAmountInForPsm3'
import { createWithdrawFromSavingsActionConfig } from './withdrawFromSavingsAction'

const account = testAddresses.alice
const receiver = testAddresses.bob
const withdrawAmount = NormalizedUnitNumber(1)
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
const mockSavingsConverter = new PotSavingsConverter({
  potParams: {
    dsr: bigNumberify('1000001103127689513476993127'), // 10% / day
    rho: bigNumberify(timestamp),
    chi: bigNumberify('1000000000000000000000000000'), // 1
  },
  currentTimestamp: timestamp + 24 * 60 * 60,
})
const chainId = base.id

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

const hookRenderer = setupUseContractActionRenderer({
  account,
  handlers: [handlers.chainIdCall({ chainId }), handlers.balanceCall({ balance: 0n, address: account })],
  args: {
    action: {
      type: 'withdrawFromSavings',
      token: usds,
      savingsToken: susds,
      amount: withdrawAmount,
      isRedeem: false,
      mode: 'withdraw',
    },
    enabled: true,
  },
})

describe(createWithdrawFromSavingsActionConfig.name, () => {
  test('withdraws usds from susds', async () => {
    const maxAmountIn = formatMaxAmountInForPsm3({
      susds,
      susdsAmount: NormalizedUnitNumber(withdrawAmount.dividedBy(1.1)),
      assetOut: usds,
    })

    const { result, queryInvalidationManager } = hookRenderer({
      args: {
        action: {
          type: 'withdrawFromSavings',
          token: usds,
          savingsToken: susds,
          amount: withdrawAmount,
          isRedeem: false,
          mode: 'withdraw',
        },
        enabled: true,
        context: { tokenRepository: mockTokenRepository, savingsAccounts: savingsAccountsWithSusds },
      },
      chain: base,
      extraHandlers: [
        handlers.contractCall({
          to: psm3Address[base.id],
          abi: psm3Abi,
          functionName: 'swapExactOut',
          args: [
            susds.address,
            usds.address,
            toBigInt(usds.toBaseUnit(withdrawAmount)),
            maxAmountIn,
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
  })

  test('withdraws max usds from susds', async () => {
    const minAmountOut = NormalizedUnitNumber(withdrawAmount.multipliedBy(1.1))

    const { result, queryInvalidationManager } = hookRenderer({
      args: {
        action: {
          type: 'withdrawFromSavings',
          token: usds,
          savingsToken: susds,
          amount: withdrawAmount,
          isRedeem: true,
          mode: 'withdraw',
        },
        enabled: true,
        context: { tokenRepository: mockTokenRepository, savingsAccounts: savingsAccountsWithSusds },
      },
      chain: base,
      extraHandlers: [
        handlers.contractCall({
          to: psm3Address[base.id],
          abi: psm3Abi,
          functionName: 'swapExactIn',
          args: [
            susds.address,
            usds.address,
            toBigInt(susds.toBaseUnit(withdrawAmount)),
            toBigInt(usds.toBaseUnit(minAmountOut)),
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
  })

  test('sends usds from susds', async () => {
    const maxAmountIn = formatMaxAmountInForPsm3({
      susds,
      susdsAmount: NormalizedUnitNumber(withdrawAmount.dividedBy(1.1)),
      assetOut: usds,
    })

    const { result, queryInvalidationManager } = hookRenderer({
      args: {
        action: {
          type: 'withdrawFromSavings',
          token: usds,
          savingsToken: susds,
          amount: withdrawAmount,
          isRedeem: false,
          mode: 'send',
          receiver,
        },
        enabled: true,
        context: { tokenRepository: mockTokenRepository, savingsAccounts: savingsAccountsWithSusds },
      },
      chain: base,
      extraHandlers: [
        handlers.contractCall({
          to: psm3Address[base.id],
          abi: psm3Abi,
          functionName: 'swapExactOut',
          args: [
            susds.address,
            usds.address,
            toBigInt(usds.toBaseUnit(withdrawAmount)),
            maxAmountIn,
            receiver,
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
  })

  test('sends max usds from susds', async () => {
    const minAmountOut = NormalizedUnitNumber(withdrawAmount.multipliedBy(1.1))

    const { result, queryInvalidationManager } = hookRenderer({
      args: {
        action: {
          type: 'withdrawFromSavings',
          token: usds,
          savingsToken: susds,
          amount: withdrawAmount,
          isRedeem: true,
          mode: 'send',
          receiver,
        },
        enabled: true,
        context: { tokenRepository: mockTokenRepository, savingsAccounts: savingsAccountsWithSusds },
      },
      chain: base,
      extraHandlers: [
        handlers.contractCall({
          to: psm3Address[base.id],
          abi: psm3Abi,
          functionName: 'swapExactIn',
          args: [
            susds.address,
            usds.address,
            toBigInt(susds.toBaseUnit(withdrawAmount)),
            toBigInt(usds.toBaseUnit(minAmountOut)),
            receiver,
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
  })

  test('withdraws usdc from susds', async () => {
    const maxAmountIn = formatMaxAmountInForPsm3({
      susds,
      susdsAmount: NormalizedUnitNumber(withdrawAmount.dividedBy(1.1)),
      assetOut: usdc,
    })

    const { result, queryInvalidationManager } = hookRenderer({
      args: {
        action: {
          type: 'withdrawFromSavings',
          token: usdc,
          savingsToken: susds,
          amount: withdrawAmount,
          isRedeem: false,
          mode: 'withdraw',
        },
        enabled: true,
        context: { tokenRepository: mockTokenRepository, savingsAccounts: savingsAccountsWithSusds },
      },
      chain: base,
      extraHandlers: [
        handlers.contractCall({
          to: psm3Address[base.id],
          abi: psm3Abi,
          functionName: 'swapExactOut',
          args: [
            susds.address,
            usdc.address,
            toBigInt(usdc.toBaseUnit(withdrawAmount)),
            maxAmountIn,
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
      allowanceQueryKey({ token: susds.address, spender: psm3Address[base.id], account, chainId }),
    )
  })

  test('withdraws max usdc from susds', async () => {
    const minAmountOut = NormalizedUnitNumber(withdrawAmount.multipliedBy(1.1))

    const { result, queryInvalidationManager } = hookRenderer({
      args: {
        action: {
          type: 'withdrawFromSavings',
          token: usdc,
          savingsToken: susds,
          amount: withdrawAmount,
          isRedeem: true,
          mode: 'withdraw',
        },
        enabled: true,
        context: { tokenRepository: mockTokenRepository, savingsAccounts: savingsAccountsWithSusds },
      },
      chain: base,
      extraHandlers: [
        handlers.contractCall({
          to: psm3Address[base.id],
          abi: psm3Abi,
          functionName: 'swapExactIn',
          args: [
            susds.address,
            usdc.address,
            toBigInt(susds.toBaseUnit(withdrawAmount)),
            toBigInt(usdc.toBaseUnit(minAmountOut)),
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
      allowanceQueryKey({ token: susds.address, spender: psm3Address[base.id], account, chainId }),
    )
  })

  test('sends usdc from susds', async () => {
    const maxAmountIn = formatMaxAmountInForPsm3({
      susds,
      susdsAmount: NormalizedUnitNumber(withdrawAmount.dividedBy(1.1)),
      assetOut: usdc,
    })

    const { result, queryInvalidationManager } = hookRenderer({
      args: {
        action: {
          type: 'withdrawFromSavings',
          token: usdc,
          savingsToken: susds,
          amount: withdrawAmount,
          isRedeem: false,
          mode: 'send',
          receiver,
        },
        enabled: true,
        context: { tokenRepository: mockTokenRepository, savingsAccounts: savingsAccountsWithSusds },
      },
      chain: base,
      extraHandlers: [
        handlers.contractCall({
          to: psm3Address[base.id],
          abi: psm3Abi,
          functionName: 'swapExactOut',
          args: [
            susds.address,
            usdc.address,
            toBigInt(usdc.toBaseUnit(withdrawAmount)),
            maxAmountIn,
            receiver,
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
      allowanceQueryKey({ token: susds.address, spender: psm3Address[base.id], account, chainId }),
    )
  })

  test('sends max usdc from susds', async () => {
    const minAmountOut = NormalizedUnitNumber(withdrawAmount.multipliedBy(1.1))

    const { result, queryInvalidationManager } = hookRenderer({
      args: {
        action: {
          type: 'withdrawFromSavings',
          token: usdc,
          savingsToken: susds,
          amount: withdrawAmount,
          isRedeem: true,
          mode: 'send',
          receiver,
        },
        enabled: true,
        context: { tokenRepository: mockTokenRepository, savingsAccounts: savingsAccountsWithSusds },
      },
      chain: base,
      extraHandlers: [
        handlers.contractCall({
          to: psm3Address[base.id],
          abi: psm3Abi,
          functionName: 'swapExactIn',
          args: [
            susds.address,
            usdc.address,
            toBigInt(susds.toBaseUnit(withdrawAmount)),
            toBigInt(usdc.toBaseUnit(minAmountOut)),
            receiver,
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
      allowanceQueryKey({ token: susds.address, spender: psm3Address[base.id], account, chainId }),
    )
  })

  test('withdraws usdc from susdc', async () => {
    const maxShares = formatMaxAmountInForPsm3({
      susds,
      susdsAmount: NormalizedUnitNumber(withdrawAmount.dividedBy(1.1)),
      assetOut: usdc,
    })

    const { result, queryInvalidationManager } = hookRenderer({
      args: {
        action: {
          type: 'withdrawFromSavings',
          token: usdc,
          savingsToken: susdc,
          amount: withdrawAmount,
          isRedeem: false,
          mode: 'withdraw',
        },
        enabled: true,
        context: { tokenRepository: mockTokenRepository, savingsAccounts: savingsAccountsWithSusdc },
      },
      chain: base,
      extraHandlers: [
        handlers.chainIdCall({ chainId }),
        handlers.contractCall({
          to: susdc.address,
          abi: usdcVaultAbi,
          functionName: 'withdraw',
          args: [toBigInt(usdc.toBaseUnit(withdrawAmount)), account, account, maxShares],
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
  })

  test('withdraws max usdc from susdc', async () => {
    const { result, queryInvalidationManager } = hookRenderer({
      args: {
        action: {
          type: 'withdrawFromSavings',
          token: usdc,
          savingsToken: susdc,
          amount: withdrawAmount,
          isRedeem: true,
          mode: 'withdraw',
        },
        enabled: true,
        context: { tokenRepository: mockTokenRepository, savingsAccounts: savingsAccountsWithSusdc },
      },
      chain: base,
      extraHandlers: [
        handlers.chainIdCall({ chainId }),
        handlers.contractCall({
          to: susdc.address,
          abi: usdcVaultAbi,
          functionName: 'redeem',
          args: [
            toBigInt(susdc.toBaseUnit(withdrawAmount)),
            account,
            account,
            toBigInt(usdc.toBaseUnit(NormalizedUnitNumber(1.1))),
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
  })

  test('sends usdc from susdc', async () => {
    const maxShares = formatMaxAmountInForPsm3({
      susds,
      susdsAmount: NormalizedUnitNumber(withdrawAmount.dividedBy(1.1)),
      assetOut: usdc,
    })

    const { result, queryInvalidationManager } = hookRenderer({
      args: {
        action: {
          type: 'withdrawFromSavings',
          token: usdc,
          savingsToken: susdc,
          amount: withdrawAmount,
          isRedeem: false,
          mode: 'send',
          receiver,
        },
        enabled: true,
        context: { tokenRepository: mockTokenRepository, savingsAccounts: savingsAccountsWithSusdc },
      },
      chain: base,
      extraHandlers: [
        handlers.chainIdCall({ chainId }),
        handlers.contractCall({
          to: susdc.address,
          abi: usdcVaultAbi,
          functionName: 'withdraw',
          args: [toBigInt(usdc.toBaseUnit(withdrawAmount)), receiver, account, maxShares],
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
  })

  test('sends max usdc from susdc', async () => {
    const { result, queryInvalidationManager } = hookRenderer({
      args: {
        action: {
          type: 'withdrawFromSavings',
          token: usdc,
          savingsToken: susdc,
          amount: withdrawAmount,
          isRedeem: true,
          mode: 'send',
          receiver,
        },
        enabled: true,
        context: { tokenRepository: mockTokenRepository, savingsAccounts: savingsAccountsWithSusdc },
      },
      chain: base,
      extraHandlers: [
        handlers.chainIdCall({ chainId }),
        handlers.contractCall({
          to: susdc.address,
          abi: usdcVaultAbi,
          functionName: 'redeem',
          args: [
            toBigInt(susdc.toBaseUnit(withdrawAmount)),
            receiver,
            account,
            toBigInt(usdc.toBaseUnit(NormalizedUnitNumber(1.1))),
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
  })
})
