import { stakingRewardsAbi } from '@/config/abis/stakingRewardsAbi'
import { farmAddresses } from '@/config/chain/constants'
import { SPARK_UI_REFERRAL_CODE } from '@/config/consts'
import { getFarmsApiDetailsQueryKey } from '@/domain/farms/farmApiDetailsQuery'
import { getFarmsBlockchainDetailsQueryKey } from '@/domain/farms/farmBlockchainDetailsQuery'
import { TokenSymbol } from '@/domain/types/TokenSymbol'
import { getBalancesQueryKeyPrefix } from '@/domain/wallet/getBalancesQueryKeyPrefix'
import { getMockToken, testAddresses } from '@/test/integration/constants'
import { handlers } from '@/test/integration/mockTransport'
import { setupUseContractActionRenderer } from '@/test/integration/setupUseContractActionRenderer'
import { toBigInt } from '@sparkdotfi/common-universal'
import { NormalizedNumber } from '@sparkdotfi/common-universal'
import { waitFor } from '@testing-library/react'
import { mainnet } from 'viem/chains'
import { describe, test } from 'vitest'
import { allowanceQueryKey } from '../../approve/logic/query'
import { createStakeActionConfig } from './stakeAction'

const account = testAddresses.alice
const chainId = mainnet.id
const stakingToken = getMockToken({ symbol: TokenSymbol('USDS') })
const rewardToken = getMockToken({ symbol: TokenSymbol('SKY') })
const stakeAmount = NormalizedNumber(1)

const hookRenderer = setupUseContractActionRenderer({
  account,
  handlers: [handlers.chainIdCall({ chainId }), handlers.balanceCall({ balance: 0n, address: account })],
  args: {
    action: {
      type: 'stake',
      farm: farmAddresses[mainnet.id].skyUsds,
      stakeAmount,
      stakingToken,
      rewardToken,
    },
    enabled: true,
  },
})

describe(createStakeActionConfig.name, () => {
  test('stakes into farm', async () => {
    const { result, queryInvalidationManager } = hookRenderer({
      extraHandlers: [
        handlers.contractCall({
          to: farmAddresses[mainnet.id].skyUsds,
          abi: stakingRewardsAbi,
          functionName: 'stake',
          args: [toBigInt(stakingToken.toBaseUnit(stakeAmount)), SPARK_UI_REFERRAL_CODE],
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
      getFarmsBlockchainDetailsQueryKey({ account, chainId }),
    )
    await expect(queryInvalidationManager).toHaveReceivedInvalidationCall(getFarmsApiDetailsQueryKey())
    await expect(queryInvalidationManager).toHaveReceivedInvalidationCall(
      allowanceQueryKey({
        token: stakingToken.address,
        spender: farmAddresses[mainnet.id].skyUsds,
        account,
        chainId,
      }),
    )
  })
})
