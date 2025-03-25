import { poolAbi } from '@/config/abis/poolAbi'
import { lendingPoolAddress, wethGatewayAbi, wethGatewayAddress } from '@/config/contracts-generated'
import { aaveDataLayerQueryKey } from '@/domain/market-info/aave-data-layer/query'
import { TokenSymbol } from '@/domain/types/TokenSymbol'
import { getBalancesQueryKeyPrefix } from '@/domain/wallet/getBalancesQueryKeyPrefix'
import { allowanceQueryKey } from '@/features/actions/flavours/approve/logic/query'
import { getMockMarketInfo, getMockToken, testAddresses } from '@/test/integration/constants'
import { handlers } from '@/test/integration/mockTransport'
import { setupUseContractActionRenderer } from '@/test/integration/setupUseContractActionRenderer'
import { CheckedAddress, toBigInt } from '@sparkdotfi/common-universal'
import { NormalizedUnitNumber } from '@sparkdotfi/common-universal'
import { waitFor } from '@testing-library/react'
import { mainnet } from 'viem/chains'
import { describe, test } from 'vitest'
import { createWithdrawActionConfig } from './withdrawAction'

const withdrawValue = NormalizedUnitNumber(1)
const marketInfo = getMockMarketInfo()
const withdrawToken = getMockToken({ symbol: TokenSymbol('DAI') })
const nativeAsset = getMockToken({ symbol: TokenSymbol('ETH'), address: CheckedAddress.EEEE() })
const aToken = marketInfo.findOneReserveBySymbol(TokenSymbol('DAI')).aToken
const account = testAddresses.alice
const chainId = mainnet.id

const hookRenderer = setupUseContractActionRenderer({
  account,
  handlers: [handlers.chainIdCall({ chainId }), handlers.balanceCall({ balance: 0n, address: account })],
  args: {
    action: { type: 'withdraw', token: withdrawToken, value: withdrawValue },
    enabled: true,
    context: { marketInfo },
  },
})

describe(createWithdrawActionConfig.name, () => {
  test('withdraws native asset', async () => {
    const { result, queryInvalidationManager } = hookRenderer({
      args: {
        action: { type: 'withdraw', token: nativeAsset, value: withdrawValue },
        enabled: true,
        context: { marketInfo },
      },
      extraHandlers: [
        handlers.contractCall({
          to: wethGatewayAddress[chainId],
          abi: wethGatewayAbi,
          functionName: 'withdrawETH',
          args: [lendingPoolAddress[chainId], toBigInt(nativeAsset.toBaseUnit(withdrawValue)), account],
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
      allowanceQueryKey({ token: aToken.address, spender: wethGatewayAddress[chainId], account, chainId }),
    )
    await expect(queryInvalidationManager).toHaveReceivedInvalidationCall(
      getBalancesQueryKeyPrefix({ account, chainId }),
    )
    await expect(queryInvalidationManager).toHaveReceivedInvalidationCall(aaveDataLayerQueryKey({ account, chainId }))
  })

  test('withdraws non-native asset', async () => {
    const { result } = hookRenderer({
      extraHandlers: [
        handlers.contractCall({
          to: lendingPoolAddress[mainnet.id],
          abi: poolAbi,
          functionName: 'withdraw',
          args: [withdrawToken.address, toBigInt(withdrawToken.toBaseUnit(withdrawValue)), account],
          result: toBigInt(withdrawToken.toBaseUnit(withdrawValue)),
          from: account,
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
})
