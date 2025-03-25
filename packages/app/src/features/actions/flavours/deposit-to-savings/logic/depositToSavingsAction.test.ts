import { SPARK_UI_REFERRAL_CODE } from '@/config/consts'
import {
  migrationActionsConfig,
  psmActionsAbi,
  psmActionsAddress,
  usdcVaultAbi,
  usdcVaultAddress,
  usdsPsmActionsConfig,
} from '@/config/contracts-generated'
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
import { BaseUnitNumber, bigNumberify, toBigInt } from '@sparkdotfi/common-universal'
import { NormalizedUnitNumber } from '@sparkdotfi/common-universal'
import { waitFor } from '@testing-library/react'
import { erc4626Abi } from 'viem'
import { mainnet } from 'viem/chains'
import { describe, test } from 'vitest'
import { createDepositToSavingsActionConfig } from './depositToSavingsAction'

const account = testAddresses.alice
const depositValue = NormalizedUnitNumber(1)
const dai = testTokens.DAI
const sdai = testTokens.sDAI
const usds = testTokens.USDS
const susds = testTokens.sUSDS
const usdc = testTokens.USDC
const susdc = testTokens.sUSDC
const mockTokenRepository = new TokenRepository(
  [
    { token: dai, balance: NormalizedUnitNumber(100) },
    { token: sdai, balance: NormalizedUnitNumber(100) },
    { token: usds, balance: NormalizedUnitNumber(100) },
    { token: susds, balance: NormalizedUnitNumber(100) },
    { token: usdc, balance: NormalizedUnitNumber(100) },
  ],
  {
    DAI: dai.symbol,
    sDAI: sdai.symbol,
    USDS: usds.symbol,
    sUSDS: susds.symbol,
  },
)
const chainId = mainnet.id

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

const hookRenderer = setupUseContractActionRenderer({
  account,
  handlers: [handlers.chainIdCall({ chainId }), handlers.balanceCall({ balance: 0n, address: account })],
  args: { action: { type: 'depositToSavings', token: dai, savingsToken: sdai, value: depositValue }, enabled: true },
})

describe(createDepositToSavingsActionConfig.name, () => {
  test('deposits dai to sdai', async () => {
    const { result, queryInvalidationManager } = hookRenderer({
      args: {
        action: { type: 'depositToSavings', token: dai, savingsToken: sdai, value: depositValue },
        enabled: true,
        context: { tokenRepository: mockTokenRepository, walletType: 'browser-injected' },
      },
      chain: mainnet,
      extraHandlers: [
        handlers.chainIdCall({ chainId }),
        handlers.contractCall({
          to: sdai.address,
          abi: erc4626Abi,
          functionName: 'deposit',
          args: [toBigInt(dai.toBaseUnit(depositValue)), account],
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
      allowanceQueryKey({ token: dai.address, spender: sdai.address, account, chainId }),
    )
  })

  test('deposits usdc to sdai', async () => {
    const { result, queryInvalidationManager } = hookRenderer({
      args: {
        action: { type: 'depositToSavings', token: usdc, savingsToken: sdai, value: depositValue },
        enabled: true,
        context: { tokenRepository: mockTokenRepository, walletType: 'browser-injected' },
      },
      extraHandlers: [
        handlers.contractCall({
          to: psmActionsAddress[mainnet.id],
          abi: psmActionsAbi,
          functionName: 'swapAndDeposit',
          args: [
            account,
            toBigInt(usdc.toBaseUnit(depositValue)),
            toBigInt(BaseUnitNumber(usdc.toBaseUnit(depositValue).multipliedBy(1e12))),
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
      allowanceQueryKey({ token: usdc.address, spender: psmActionsAddress[mainnet.id], account, chainId }),
    )
  })

  test('migrates dai to susds', async () => {
    const { result, queryInvalidationManager } = hookRenderer({
      args: {
        action: { type: 'depositToSavings', token: dai, savingsToken: susds, value: depositValue },
        enabled: true,
        context: { tokenRepository: mockTokenRepository, walletType: 'browser-injected' },
      },
      extraHandlers: [
        handlers.contractCall({
          to: getContractAddress(migrationActionsConfig.address, chainId),
          abi: migrationActionsConfig.abi,
          functionName: 'migrateDAIToSUSDS',
          args: [account, toBigInt(dai.toBaseUnit(depositValue))],
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
        token: dai.address,
        spender: getContractAddress(migrationActionsConfig.address, chainId),
        account,
        chainId,
      }),
    )
  })

  test('deposits usdc to susds', async () => {
    const { result, queryInvalidationManager } = hookRenderer({
      args: {
        action: { type: 'depositToSavings', token: usdc, savingsToken: susds, value: depositValue },
        enabled: true,
        context: { tokenRepository: mockTokenRepository, walletType: 'browser-injected' },
      },
      extraHandlers: [
        handlers.contractCall({
          to: getContractAddress(usdsPsmActionsConfig.address, chainId),
          abi: psmActionsAbi,
          functionName: 'swapAndDeposit',
          args: [
            account,
            toBigInt(usdc.toBaseUnit(depositValue)),
            toBigInt(BaseUnitNumber(usdc.toBaseUnit(depositValue).multipliedBy(1e12))),
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
        token: usdc.address,
        spender: getContractAddress(usdsPsmActionsConfig.address, chainId),
        account,
        chainId,
      }),
    )
  })

  test('deposits usdc to susdc', async () => {
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
      extraHandlers: [
        handlers.contractCall({
          to: getContractAddress(usdcVaultAddress, chainId),
          abi: usdcVaultAbi,
          functionName: 'deposit',
          args: [
            toBigInt(usdc.toBaseUnit(depositValue)),
            account,
            toBigInt(susdc.toBaseUnit(minAmountOut)),
            SPARK_UI_REFERRAL_CODE,
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
        token: usdc.address,
        spender: getContractAddress(usdcVaultAddress, chainId),
        account,
        chainId,
      }),
    )
  })
})
