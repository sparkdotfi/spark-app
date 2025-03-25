import { spark2ApiUrl } from '@/config/consts'
import { testSparkRewardsConfig } from '@/config/contracts-generated'
import { getContractAddress } from '@/domain/hooks/useContractAddress'
import { Token } from '@/domain/types/Token'
import { TokenSymbol } from '@/domain/types/TokenSymbol'
import { testAddresses } from '@/test/integration/constants'
import { handlers } from '@/test/integration/mockTransport'
import { setupHookRenderer } from '@/test/integration/setupHookRenderer'
import { Hex, NormalizedUnitNumber, toBigInt } from '@sparkdotfi/common-universal'
import { waitFor } from '@testing-library/react'
import { times } from 'remeda'
import { erc20Abi } from 'viem'
import { mainnet } from 'viem/chains'
import { afterEach, describe, expect, test, vi } from 'vitest'
import { useClaimableRewards } from './useClaimableRewards'

const account = testAddresses.alice
const chainId = mainnet.id
const rewardToken = new Token({
  address: testAddresses.token,
  symbol: TokenSymbol('RED'),
  name: 'RedStone',
  decimals: 18,
  unitPriceUsd: '0',
})
const sparkRewardsAddress = getContractAddress(testSparkRewardsConfig.address, chainId)
const merkleRoot = Hex.random()

const chainIdCall = handlers.chainIdCall({ chainId })

const hookRenderer = setupHookRenderer({
  hook: useClaimableRewards,
  account,
  handlers: [chainIdCall],
  args: undefined,
})

describe(useClaimableRewards.name, () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  test('fetches claimable rewards', async () => {
    const cumulativeAmountNormalized = NormalizedUnitNumber(123.45)
    const pendingAmountNormalized = NormalizedUnitNumber(10.23)
    const preClaimed = NormalizedUnitNumber(98.7654321)

    vi.stubGlobal('fetch', (...args: Parameters<typeof fetch>) => {
      if (args[0] === `${spark2ApiUrl}/rewards/roots/${chainId}/${merkleRoot}/${account}/`) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve([
              {
                root_hash: merkleRoot,
                epoch: 1,
                wallet_address: account,
                token_address: rewardToken.address,
                pending_amount_normalized: pendingAmountNormalized.toFixed(),
                claimable_amount_normalized: cumulativeAmountNormalized.toFixed(),
                proof: times(5, () => Hex.random()),
                restricted_country_codes: ['US'],
              },
            ]),
        })
      }
    })

    const { result } = hookRenderer({
      handlers: [
        handlers.contractCall({
          to: sparkRewardsAddress,
          abi: testSparkRewardsConfig.abi,
          functionName: 'merkleRoot',
          result: merkleRoot,
        }),
        handlers.contractCall({
          to: rewardToken.address,
          abi: erc20Abi,
          functionName: 'symbol',
          result: rewardToken.symbol,
        }),
        handlers.contractCall({
          to: rewardToken.address,
          abi: erc20Abi,
          functionName: 'name',
          result: rewardToken.name,
        }),
        handlers.contractCall({
          to: rewardToken.address,
          abi: erc20Abi,
          functionName: 'decimals',
          result: 18,
        }),
        handlers.contractCall({
          to: sparkRewardsAddress,
          abi: testSparkRewardsConfig.abi,
          functionName: 'cumulativeClaimed',
          args: [account, rewardToken.address, 1n],
          result: toBigInt(rewardToken.toBaseUnit(preClaimed)),
        }),
      ],
    })

    await waitFor(() => expect(result.current.isPending).toBe(false))
    expect(result.current.isError).toBe(false)
    expect(result.current.error).toBeNull()
    expect(result.current.data).toEqual([
      {
        token: rewardToken,
        amountPending: pendingAmountNormalized,
        amountToClaim: NormalizedUnitNumber(cumulativeAmountNormalized.minus(preClaimed)),
        action: expect.any(Function),
        actionName: 'Claim',
        isActionEnabled: true,
        chainId,
      },
    ])
  })
})
