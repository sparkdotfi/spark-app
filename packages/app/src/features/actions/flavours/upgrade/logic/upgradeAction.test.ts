import { migrationActionsConfig } from '@/config/contracts-generated'
import { getContractAddress } from '@/domain/hooks/useContractAddress'
import { TokenRepository } from '@/domain/token-repository/TokenRepository'
import { getBalancesQueryKeyPrefix } from '@/domain/wallet/getBalancesQueryKeyPrefix'
import { allowanceQueryKey } from '@/features/actions/flavours/approve/logic/query'
import { testAddresses, testTokens } from '@/test/integration/constants'
import { handlers } from '@/test/integration/mockTransport'
import { setupUseContractActionRenderer } from '@/test/integration/setupUseContractActionRenderer'
import { toBigInt } from '@sparkdotfi/common-universal'
import { NormalizedNumber } from '@sparkdotfi/common-universal'
import { waitFor } from '@testing-library/react'
import { mainnet } from 'viem/chains'
import { describe, test } from 'vitest'
import { createUpgradeActionConfig } from './upgradeAction'

const account = testAddresses.alice
const upgradeAmount = NormalizedNumber(1)
const DAI = testTokens.DAI
const USDS = testTokens.USDS
const sDAI = testTokens.sDAI
const sUSDS = testTokens.sUSDS
const chainId = mainnet.id

const mockTokenRepository = new TokenRepository(
  [
    { token: DAI, balance: NormalizedNumber(100) },
    { token: sDAI, balance: NormalizedNumber(100) },
    { token: USDS, balance: NormalizedNumber(100) },
    { token: sUSDS, balance: NormalizedNumber(100) },
  ],
  {
    DAI: DAI.symbol,
    sDAI: sDAI.symbol,
    USDS: USDS.symbol,
    sUSDS: sUSDS.symbol,
  },
)

const hookRenderer = setupUseContractActionRenderer({
  account,
  handlers: [handlers.chainIdCall({ chainId }), handlers.balanceCall({ balance: 0n, address: account })],
  args: {
    action: { type: 'upgrade', fromToken: DAI, toToken: USDS, amount: upgradeAmount },
    context: { tokenRepository: mockTokenRepository },
    enabled: true,
  },
})

describe(createUpgradeActionConfig.name, () => {
  test('upgrades DAI to USDS', async () => {
    const { result, queryInvalidationManager } = hookRenderer({
      extraHandlers: [
        handlers.contractCall({
          to: getContractAddress(migrationActionsConfig.address, chainId),
          abi: migrationActionsConfig.abi,
          functionName: 'migrateDAIToUSDS',
          args: [account, toBigInt(DAI.toBaseUnit(upgradeAmount))],
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
        token: DAI.address,
        spender: getContractAddress(migrationActionsConfig.address, chainId),
        account,
        chainId,
      }),
    )
  })

  test('upgrades sDAI to sUSDS', async () => {
    const { result, queryInvalidationManager } = hookRenderer({
      args: {
        action: { type: 'upgrade', fromToken: sDAI, toToken: sUSDS, amount: upgradeAmount },
        context: { tokenRepository: mockTokenRepository },
        enabled: true,
      },
      extraHandlers: [
        handlers.contractCall({
          to: getContractAddress(migrationActionsConfig.address, chainId),
          abi: migrationActionsConfig.abi,
          functionName: 'migrateSDAISharesToSUSDS',
          args: [account, toBigInt(sDAI.toBaseUnit(upgradeAmount))],
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
        token: sDAI.address,
        spender: getContractAddress(migrationActionsConfig.address, chainId),
        account,
        chainId,
      }),
    )
  })
})
