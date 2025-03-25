import { poolAbi } from '@/config/abis/poolAbi'
import { InterestRate } from '@/config/consts'
import { lendingPoolAddress, wethGatewayAbi, wethGatewayAddress } from '@/config/contracts-generated'
import { aaveDataLayerQueryKey } from '@/domain/market-info/aave-data-layer/query'
import { TokenSymbol } from '@/domain/types/TokenSymbol'
import { getBalancesQueryKeyPrefix } from '@/domain/wallet/getBalancesQueryKeyPrefix'
import { allowanceQueryKey } from '@/features/actions/flavours/approve/logic/query'
import { createPermitStore } from '@/features/actions/logic/permits'
import { getMockReserve, getMockToken, testAddresses } from '@/test/integration/constants'
import { handlers } from '@/test/integration/mockTransport'
import { setupUseContractActionRenderer } from '@/test/integration/setupUseContractActionRenderer'
import { CheckedAddress, UnixTime, toBigInt } from '@sparkdotfi/common-universal'
import { NormalizedUnitNumber } from '@sparkdotfi/common-universal'
import { waitFor } from '@testing-library/react'
import { generatePrivateKey } from 'viem/accounts'
import { mainnet } from 'viem/chains'
import { describe, test } from 'vitest'
import { createRepayActionConfig } from './repayAction'

const repayValue = NormalizedUnitNumber(1)
const repayToken = getMockToken({ symbol: TokenSymbol('TEST') })
const repayTokenReserve = getMockReserve({ token: repayToken })
const repayValueBigInt = toBigInt(repayToken.toBaseUnit(repayValue))
const nativeAsset = getMockToken({ address: CheckedAddress.EEEE() })
const nativeAssetReserve = getMockReserve({ token: nativeAsset })
const account = testAddresses.alice
const chainId = mainnet.id
const interestRateMode = BigInt(InterestRate.Variable)
const lendingPool = lendingPoolAddress[chainId]

const hookRenderer = setupUseContractActionRenderer({
  account,
  handlers: [handlers.chainIdCall({ chainId }), handlers.balanceCall({ balance: 0n, address: account })],
  args: { action: { type: 'repay', reserve: repayTokenReserve, value: repayValue, useAToken: false }, enabled: true },
})

describe(createRepayActionConfig.name, () => {
  test('repays with aToken', async () => {
    const { result, queryInvalidationManager } = hookRenderer({
      args: {
        action: { type: 'repay', reserve: repayTokenReserve, value: repayValue, useAToken: true },
        enabled: true,
      },
      extraHandlers: [
        handlers.contractCall({
          to: lendingPoolAddress[mainnet.id],
          abi: poolAbi,
          functionName: 'repayWithATokens',
          args: [repayToken.address, repayValueBigInt, interestRateMode],
          from: account,
          result: repayValueBigInt,
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
      allowanceQueryKey({ token: repayToken.address, spender: lendingPool, account, chainId }),
    )
    await expect(queryInvalidationManager).toHaveReceivedInvalidationCall(
      getBalancesQueryKeyPrefix({ account, chainId }),
    )
    await expect(queryInvalidationManager).toHaveReceivedInvalidationCall(aaveDataLayerQueryKey({ account, chainId }))
  })

  test('repays with a native token', async () => {
    const { result } = hookRenderer({
      args: {
        action: { type: 'repay', reserve: nativeAssetReserve, value: repayValue, useAToken: false },
        enabled: true,
      },
      extraHandlers: [
        handlers.contractCall({
          to: wethGatewayAddress[mainnet.id],
          abi: wethGatewayAbi,
          functionName: 'repayETH',
          args: [lendingPoolAddress[mainnet.id], repayValueBigInt, interestRateMode, account],
          from: account,
          result: undefined,
          value: repayValueBigInt,
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
  })

  test('repays with token itself', async () => {
    const { result } = hookRenderer({
      extraHandlers: [
        handlers.contractCall({
          to: lendingPoolAddress[mainnet.id],
          abi: poolAbi,
          functionName: 'repay',
          args: [repayToken.address, repayValueBigInt, interestRateMode, account],
          from: account,
          result: repayValueBigInt,
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
  })

  it('repays with permit', async () => {
    const random32Bytes = generatePrivateKey()
    const permitDeadline = new Date()
    const permitStore = createPermitStore()
    permitStore.add({
      token: repayToken,
      deadline: permitDeadline,
      signature: {
        r: random32Bytes,
        s: random32Bytes,
        v: 0n,
      },
    })

    const { result } = hookRenderer({
      extraHandlers: [
        handlers.contractCall({
          to: lendingPoolAddress[mainnet.id],
          abi: poolAbi,
          functionName: 'repayWithPermit',
          args: [
            repayToken.address,
            repayValueBigInt,
            interestRateMode,
            account,
            UnixTime.fromDate(permitDeadline),
            0,
            random32Bytes,
            random32Bytes,
          ],
          from: account,
          result: repayValueBigInt,
        }),
        handlers.mineTransaction(),
      ],
      args: {
        action: { type: 'repay', reserve: repayTokenReserve, value: repayValue, useAToken: false },
        enabled: true,
        context: { permitStore },
      },
    })

    await waitFor(() => {
      expect(result.current.state.status).toBe('ready')
    })

    result.current.onAction()

    await waitFor(() => {
      expect(result.current.state.status).toBe('success')
    })
  })
})
