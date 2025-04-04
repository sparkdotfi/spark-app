import {
  migrationActionsConfig,
  psmActionsAbi,
  psmActionsAddress,
  usdcVaultAbi,
  usdsPsmActionsConfig,
} from '@/config/contracts-generated'
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
import { NormalizedNumber } from '@sparkdotfi/common-universal'
import { waitFor } from '@testing-library/react'
import { erc4626Abi } from 'viem'
import { mainnet } from 'viem/chains'
import { describe, test } from 'vitest'
import { createWithdrawFromSavingsActionConfig } from './withdrawFromSavingsAction'

const account = testAddresses.alice
const receiver = testAddresses.bob
const withdrawAmount = NormalizedNumber(1)
const dai = testTokens.DAI
const sdai = testTokens.sDAI
const usds = testTokens.USDS
const susds = testTokens.sUSDS
const susdc = testTokens.sUSDC
const usdc = testTokens.USDC
const mockTokenRepository = new TokenRepository(
  [
    { token: dai, balance: NormalizedNumber(100) },
    { token: sdai, balance: NormalizedNumber(100) },
    { token: usds, balance: NormalizedNumber(100) },
    { token: susds, balance: NormalizedNumber(100) },
    { token: usdc, balance: NormalizedNumber(100) },
  ],
  {
    DAI: dai.symbol,
    sDAI: sdai.symbol,
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
const chainId = mainnet.id

const savingsAccountsWithSdai = new SavingsAccountRepository([
  {
    converter: mockSavingsConverter,
    savingsToken: sdai,
    underlyingToken: dai,
  },
])
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
      token: dai,
      savingsToken: sdai,
      amount: withdrawAmount,
      isRedeem: false,
      mode: 'withdraw',
    },
    enabled: true,
  },
})

describe(createWithdrawFromSavingsActionConfig.name, () => {
  test('withdraws dai from sdai', async () => {
    const { result, queryInvalidationManager } = hookRenderer({
      args: {
        action: {
          type: 'withdrawFromSavings',
          token: dai,
          savingsToken: sdai,
          amount: withdrawAmount,
          isRedeem: false,
          mode: 'withdraw',
        },
        enabled: true,
        context: { tokenRepository: mockTokenRepository },
      },
      chain: mainnet,
      extraHandlers: [
        handlers.chainIdCall({ chainId }),
        handlers.contractCall({
          to: sdai.address,
          abi: erc4626Abi,
          functionName: 'withdraw',
          args: [toBigInt(dai.toBaseUnit(withdrawAmount)), account, account],
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

  test('withdraws max dai from sdai', async () => {
    const { result, queryInvalidationManager } = hookRenderer({
      args: {
        action: {
          type: 'withdrawFromSavings',
          token: dai,
          savingsToken: sdai,
          amount: withdrawAmount,
          isRedeem: true,
          mode: 'withdraw',
        },
        enabled: true,
        context: { tokenRepository: mockTokenRepository },
      },
      chain: mainnet,
      extraHandlers: [
        handlers.chainIdCall({ chainId }),
        handlers.contractCall({
          to: sdai.address,
          abi: erc4626Abi,
          functionName: 'redeem',
          args: [toBigInt(sdai.toBaseUnit(withdrawAmount)), account, account],
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

  test('sends dai from sdai', async () => {
    const { result, queryInvalidationManager } = hookRenderer({
      args: {
        action: {
          type: 'withdrawFromSavings',
          token: dai,
          savingsToken: sdai,
          amount: withdrawAmount,
          isRedeem: false,
          mode: 'send',
          receiver,
        },
        enabled: true,
        context: { tokenRepository: mockTokenRepository },
      },
      chain: mainnet,
      extraHandlers: [
        handlers.chainIdCall({ chainId }),
        handlers.contractCall({
          to: sdai.address,
          abi: erc4626Abi,
          functionName: 'withdraw',
          args: [toBigInt(dai.toBaseUnit(withdrawAmount)), receiver, account],
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

  test('sends max dai from sdai', async () => {
    const { result, queryInvalidationManager } = hookRenderer({
      args: {
        action: {
          type: 'withdrawFromSavings',
          token: dai,
          savingsToken: sdai,
          amount: withdrawAmount,
          isRedeem: true,
          mode: 'send',
          receiver,
        },
        enabled: true,
        context: { tokenRepository: mockTokenRepository },
      },
      chain: mainnet,
      extraHandlers: [
        handlers.chainIdCall({ chainId }),
        handlers.contractCall({
          to: sdai.address,
          abi: erc4626Abi,
          functionName: 'redeem',
          args: [toBigInt(sdai.toBaseUnit(withdrawAmount)), receiver, account],
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

  test('withdraws usdc from sdai', async () => {
    const { result, queryInvalidationManager } = hookRenderer({
      args: {
        action: {
          type: 'withdrawFromSavings',
          token: usdc,
          savingsToken: sdai,
          amount: withdrawAmount,
          isRedeem: false,
          mode: 'withdraw',
        },
        enabled: true,
        context: { tokenRepository: mockTokenRepository, savingsAccounts: savingsAccountsWithSdai },
      },
      extraHandlers: [
        handlers.contractCall({
          to: psmActionsAddress[mainnet.id],
          abi: psmActionsAbi,
          functionName: 'withdrawAndSwap',
          args: [account, toBigInt(usdc.toBaseUnit(withdrawAmount)), toBigInt(sdai.toBaseUnit(withdrawAmount))],
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
      allowanceQueryKey({ token: sdai.address, spender: psmActionsAddress[mainnet.id], account, chainId }),
    )
  })

  test('withdraws max usdc from sdai', async () => {
    const { result, queryInvalidationManager } = hookRenderer({
      args: {
        action: {
          type: 'withdrawFromSavings',
          token: usdc,
          savingsToken: sdai,
          amount: withdrawAmount,
          isRedeem: true,
          mode: 'withdraw',
        },
        enabled: true,
        context: { tokenRepository: mockTokenRepository, savingsAccounts: savingsAccountsWithSdai },
      },
      extraHandlers: [
        handlers.contractCall({
          to: psmActionsAddress[mainnet.id],
          abi: psmActionsAbi,
          functionName: 'redeemAndSwap',
          args: [account, toBigInt(sdai.toBaseUnit(withdrawAmount)), toBigInt(usdc.toBaseUnit(NormalizedNumber(1.1)))],
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
      allowanceQueryKey({ token: sdai.address, spender: psmActionsAddress[mainnet.id], account, chainId }),
    )
  })

  test('sends usdc from sdai', async () => {
    const { result, queryInvalidationManager } = hookRenderer({
      args: {
        action: {
          type: 'withdrawFromSavings',
          token: usdc,
          savingsToken: sdai,
          amount: withdrawAmount,
          isRedeem: false,
          mode: 'send',
          receiver,
        },
        enabled: true,
        context: { tokenRepository: mockTokenRepository, savingsAccounts: savingsAccountsWithSdai },
      },
      extraHandlers: [
        handlers.contractCall({
          to: psmActionsAddress[mainnet.id],
          abi: psmActionsAbi,
          functionName: 'withdrawAndSwap',
          args: [receiver, toBigInt(usdc.toBaseUnit(withdrawAmount)), toBigInt(sdai.toBaseUnit(withdrawAmount))],
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
      allowanceQueryKey({ token: sdai.address, spender: psmActionsAddress[mainnet.id], account, chainId }),
    )
  })

  test('sends max usdc from sdai', async () => {
    const { result, queryInvalidationManager } = hookRenderer({
      args: {
        action: {
          type: 'withdrawFromSavings',
          token: usdc,
          savingsToken: sdai,
          amount: withdrawAmount,
          isRedeem: true,
          mode: 'send',
          receiver,
        },
        enabled: true,
        context: { tokenRepository: mockTokenRepository, savingsAccounts: savingsAccountsWithSdai },
      },
      extraHandlers: [
        handlers.contractCall({
          to: psmActionsAddress[mainnet.id],
          abi: psmActionsAbi,
          functionName: 'redeemAndSwap',
          args: [receiver, toBigInt(sdai.toBaseUnit(withdrawAmount)), toBigInt(usdc.toBaseUnit(NormalizedNumber(1.1)))],
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
      allowanceQueryKey({ token: sdai.address, spender: psmActionsAddress[mainnet.id], account, chainId }),
    )
  })

  test('withdraws usdc from susds', async () => {
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
      extraHandlers: [
        handlers.contractCall({
          to: getContractAddress(usdsPsmActionsConfig.address, chainId),
          abi: psmActionsAbi,
          functionName: 'withdrawAndSwap',
          args: [account, toBigInt(usdc.toBaseUnit(withdrawAmount)), toBigInt(susds.toBaseUnit(withdrawAmount))],
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
        token: susds.address,
        spender: getContractAddress(usdsPsmActionsConfig.address, chainId),
        account,
        chainId,
      }),
    )
  })

  test('withdraws max usdc from susds', async () => {
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
      extraHandlers: [
        handlers.contractCall({
          to: getContractAddress(usdsPsmActionsConfig.address, chainId),
          abi: psmActionsAbi,
          functionName: 'redeemAndSwap',
          args: [account, toBigInt(susds.toBaseUnit(withdrawAmount)), toBigInt(usdc.toBaseUnit(NormalizedNumber(1.1)))],
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
        token: susds.address,
        spender: getContractAddress(usdsPsmActionsConfig.address, chainId),
        account,
        chainId,
      }),
    )
  })

  test('sends usdc from susds', async () => {
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
      extraHandlers: [
        handlers.contractCall({
          to: getContractAddress(usdsPsmActionsConfig.address, chainId),
          abi: psmActionsAbi,
          functionName: 'withdrawAndSwap',
          args: [receiver, toBigInt(usdc.toBaseUnit(withdrawAmount)), toBigInt(susds.toBaseUnit(withdrawAmount))],
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
        token: susds.address,
        spender: getContractAddress(usdsPsmActionsConfig.address, chainId),
        account,
        chainId,
      }),
    )
  })

  test('sends max usdc from susds', async () => {
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
      extraHandlers: [
        handlers.contractCall({
          to: getContractAddress(usdsPsmActionsConfig.address, chainId),
          abi: psmActionsAbi,
          functionName: 'redeemAndSwap',
          args: [
            receiver,
            toBigInt(susds.toBaseUnit(withdrawAmount)),
            toBigInt(usdc.toBaseUnit(NormalizedNumber(1.1))),
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
      allowanceQueryKey({
        token: susds.address,
        spender: getContractAddress(usdsPsmActionsConfig.address, chainId),
        account,
        chainId,
      }),
    )
  })

  test('withdraws usds from sdai', async () => {
    const { result, queryInvalidationManager } = hookRenderer({
      args: {
        action: {
          type: 'withdrawFromSavings',
          token: usds,
          savingsToken: sdai,
          amount: withdrawAmount,
          isRedeem: false,
          mode: 'withdraw',
        },
        enabled: true,
        context: { tokenRepository: mockTokenRepository },
      },
      chain: mainnet,
      extraHandlers: [
        handlers.chainIdCall({ chainId }),
        handlers.contractCall({
          to: getContractAddress(migrationActionsConfig.address, chainId),
          abi: migrationActionsConfig.abi,
          functionName: 'migrateSDAIAssetsToUSDS',
          args: [account, toBigInt(usds.toBaseUnit(withdrawAmount))],
          from: account,
          result: undefined,
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
        token: sdai.address,
        spender: getContractAddress(migrationActionsConfig.address, chainId),
        account,
        chainId,
      }),
    )
  })

  test('withdraws max usds from sdai', async () => {
    const { result, queryInvalidationManager } = hookRenderer({
      args: {
        action: {
          type: 'withdrawFromSavings',
          token: usds,
          savingsToken: sdai,
          amount: withdrawAmount,
          isRedeem: true,
          mode: 'withdraw',
        },
        enabled: true,
        context: { tokenRepository: mockTokenRepository },
      },
      chain: mainnet,
      extraHandlers: [
        handlers.chainIdCall({ chainId }),
        handlers.contractCall({
          to: getContractAddress(migrationActionsConfig.address, chainId),
          abi: migrationActionsConfig.abi,
          functionName: 'migrateSDAISharesToUSDS',
          args: [account, toBigInt(sdai.toBaseUnit(withdrawAmount))],
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
        token: sdai.address,
        spender: getContractAddress(migrationActionsConfig.address, chainId),
        account,
        chainId,
      }),
    )
  })

  test('withdraws usdc from susdc', async () => {
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
      chain: mainnet,
      extraHandlers: [
        handlers.chainIdCall({ chainId }),
        handlers.contractCall({
          to: susdc.address,
          abi: usdcVaultAbi,
          functionName: 'withdraw',
          args: [
            toBigInt(usdc.toBaseUnit(withdrawAmount)),
            account,
            account,
            toBigInt(susdc.toBaseUnit(NormalizedNumber('0.90909090909090909091'))),
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
      chain: mainnet,
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
            toBigInt(usdc.toBaseUnit(NormalizedNumber(1.1))),
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
      chain: mainnet,
      extraHandlers: [
        handlers.chainIdCall({ chainId }),
        handlers.contractCall({
          to: susdc.address,
          abi: usdcVaultAbi,
          functionName: 'withdraw',
          args: [
            toBigInt(usdc.toBaseUnit(withdrawAmount)),
            receiver,
            account,
            toBigInt(susdc.toBaseUnit(NormalizedNumber('0.90909090909090909091'))),
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
      chain: mainnet,
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
            toBigInt(usdc.toBaseUnit(NormalizedNumber(1.1))),
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
