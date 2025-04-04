import { poolAbi } from '@/config/abis/poolAbi'
import { InterestRate, SPARK_UI_REFERRAL_CODE } from '@/config/consts'
import { lendingPoolAddress, wethGatewayAbi, wethGatewayAddress } from '@/config/contracts-generated'
import { TokenSymbol } from '@/domain/types/TokenSymbol'
import { getMockToken, testAddresses } from '@/test/integration/constants'
import { handlers } from '@/test/integration/mockTransport'
import { setupUseContractActionRenderer } from '@/test/integration/setupUseContractActionRenderer'
import { CheckedAddress, toBigInt } from '@sparkdotfi/common-universal'
import { NormalizedNumber } from '@sparkdotfi/common-universal'
import { waitFor } from '@testing-library/react'
import { mainnet } from 'viem/chains'
import { describe, test } from 'vitest'
import { createBorrowActionConfig } from './borrowAction'

const borrowValue = NormalizedNumber(1)
const borrowToken = getMockToken({ symbol: TokenSymbol('TEST') })
const nativeAsset = getMockToken({ address: CheckedAddress.EEEE() })
const account = testAddresses.alice
const chainId = mainnet.id
const interestRateMode = BigInt(InterestRate.Variable)
const referralCode = SPARK_UI_REFERRAL_CODE

const hookRenderer = setupUseContractActionRenderer({
  account,
  handlers: [handlers.chainIdCall({ chainId }), handlers.balanceCall({ balance: 0n, address: account })],
  args: { action: { type: 'borrow', token: borrowToken, value: borrowValue }, enabled: true },
})

describe(createBorrowActionConfig.name, () => {
  test('borrows native asset', async () => {
    const { result } = hookRenderer({
      args: { action: { type: 'borrow', token: nativeAsset, value: borrowValue }, enabled: true },
      extraHandlers: [
        handlers.contractCall({
          to: wethGatewayAddress[chainId],
          abi: wethGatewayAbi,
          functionName: 'borrowETH',
          args: [
            lendingPoolAddress[chainId],
            toBigInt(nativeAsset.toBaseUnit(borrowValue)),
            interestRateMode,
            referralCode,
          ],
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
  })

  test('borrows non-native asset', async () => {
    const { result } = hookRenderer({
      extraHandlers: [
        handlers.contractCall({
          to: lendingPoolAddress[chainId],
          abi: poolAbi,
          functionName: 'borrow',
          args: [
            borrowToken.address,
            toBigInt(borrowToken.toBaseUnit(borrowValue)),
            interestRateMode,
            referralCode,
            account,
          ],
          result: undefined,
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
