import { infoSkyApiUrl, spark2ApiUrl } from '@/config/consts'
import {
  testSpkStakingAbi,
  testSpkStakingAddress,
  testStakingRewardsAbi,
  testStakingRewardsAddress,
} from '@/config/contracts-generated'
import { getContractAddress } from '@/domain/hooks/useContractAddress'
import { testAddresses } from '@/test/integration/constants'
import { handlers } from '@/test/integration/mockTransport'
import { setupHookRenderer } from '@/test/integration/setupHookRenderer'
import { CheckedAddress, NormalizedUnitNumber, Percentage } from '@sparkdotfi/common-universal'
import { waitFor } from '@testing-library/react'
import { erc20Abi, parseEther } from 'viem'
import { mainnet } from 'viem/chains'
import { afterEach, describe, expect, test, vi } from 'vitest'
import { useSpkStaking } from './useSpkStaking'

const chainId = mainnet.id
const usds = CheckedAddress('0xdC035D45d973E3EC169d2276DDab16f1e407384F')
const spk = CheckedAddress('0x56072C95FAA701256059aa122697B133aDEd9279')
const account = testAddresses.alice

const chainIdCall = handlers.chainIdCall({ chainId })

const hookRenderer = setupHookRenderer({
  hook: useSpkStaking,
  account,
  handlers: [chainIdCall],
  args: undefined,
})

describe(useSpkStaking.name, () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  test('returns the chainId', async () => {
    vi.stubGlobal('fetch', async (...args: Parameters<typeof fetch>) => {
      if (args[0] === `${infoSkyApiUrl}/spk-staking/stats/`) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              tvl: '1000000',
              number_of_wallets: 100,
              apr: '0.1',
            }),
        })
      }

      if (args[0] === `${spark2ApiUrl}/spk-staking/${chainId}/${account}/`) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              amount_staked: '100',
              pending_amount_normalized: '2',
              pending_amount_rate: '0.1',
              timestamp: 10000000,
              cumulative_amount_normalized: '1',
              apy: '0.1',
            }),
        })
      }
    })

    const { result } = hookRenderer({
      extraHandlers: [
        handlers.contractCall({
          to: getContractAddress(testSpkStakingAddress, chainId),
          abi: testSpkStakingAbi,
          functionName: 'activeSharesOf',
          args: [account],
          result: parseEther('10'),
        }),
        handlers.contractCall({
          to: getContractAddress(testStakingRewardsAddress, chainId),
          abi: testStakingRewardsAbi,
          functionName: 'cumulativeClaimed',
          args: [account, usds, 1n],
          result: 0n,
        }),
        handlers.contractCall({
          to: usds,
          abi: erc20Abi,
          functionName: 'balanceOf',
          args: [account],
          result: parseEther('1'),
        }),
        handlers.contractCall({
          to: usds,
          abi: erc20Abi,
          functionName: 'decimals',
          result: 18,
        }),
        handlers.contractCall({
          to: usds,
          abi: erc20Abi,
          functionName: 'symbol',
          result: 'USDS',
        }),
        handlers.contractCall({
          to: usds,
          abi: erc20Abi,
          functionName: 'name',
          result: 'USDS',
        }),
        handlers.contractCall({
          to: spk,
          abi: erc20Abi,
          functionName: 'balanceOf',
          args: [account],
          result: parseEther('10'),
        }),
        handlers.contractCall({
          to: spk,
          abi: erc20Abi,
          functionName: 'decimals',
          result: 18,
        }),
        handlers.contractCall({
          to: spk,
          abi: erc20Abi,
          functionName: 'symbol',
          result: 'SPK',
        }),
        handlers.contractCall({
          to: spk,
          abi: erc20Abi,
          functionName: 'name',
          result: 'SPK',
        }),
        handlers.blockCall({
          timestamp: 330,
        }),
        handlers.contractCall({
          to: getContractAddress(testSpkStakingAddress, chainId),
          abi: testSpkStakingAbi,
          functionName: 'currentEpoch',
          result: 4n,
        }),
        handlers.contractCall({
          to: getContractAddress(testSpkStakingAddress, chainId),
          abi: testSpkStakingAbi,
          functionName: 'epochDuration',
          result: 60,
        }),
        handlers.contractCall({
          to: getContractAddress(testSpkStakingAddress, chainId),
          abi: testSpkStakingAbi,
          functionName: 'epochDurationInit',
          result: 60,
        }),
        handlers.contractCall({
          to: getContractAddress(testSpkStakingAddress, chainId),
          abi: testSpkStakingAbi,
          functionName: 'withdrawalSharesOf',
          args: [1n, account],
          result: 0n,
        }),
        handlers.contractCall({
          to: getContractAddress(testSpkStakingAddress, chainId),
          abi: testSpkStakingAbi,
          functionName: 'withdrawalSharesOf',
          args: [2n, account],
          result: parseEther('1'),
        }),
        handlers.contractCall({
          to: getContractAddress(testSpkStakingAddress, chainId),
          abi: testSpkStakingAbi,
          functionName: 'withdrawalSharesOf',
          args: [3n, account],
          result: parseEther('2'),
        }),
        handlers.contractCall({
          to: getContractAddress(testSpkStakingAddress, chainId),
          abi: testSpkStakingAbi,
          functionName: 'withdrawalSharesOf',
          args: [4n, account],
          result: parseEther('4'),
        }),
      ],
    })
    await waitFor(() => {
      expect(result.current.chainId).toBe(chainId)
      expect(result.current.generalStats).toMatchObject({
        data: {
          tvl: NormalizedUnitNumber(1000000),
          stakers: 100,
          apr: Percentage(0.1),
        },
        isPending: false,
        isError: false,
      })
      expect(result.current.mainPanelData).toMatchObject({
        type: 'active',
        props: {
          apy: Percentage(0.1),
          stakedAmount: NormalizedUnitNumber(10),
          rewardToken: expect.objectContaining({
            symbol: 'SPK',
            address: spk,
          }),
          stakingToken: expect.objectContaining({
            symbol: 'USDS',
            address: usds,
          }),
          claimableRewards: NormalizedUnitNumber(1),
          calculateReward: expect.any(Function),
        },
      })
      expect(result.current.withdrawalsTableRows).toEqual([
        {
          token: expect.objectContaining({
            symbol: 'SPK',
            address: spk,
          }),
          amount: NormalizedUnitNumber(3),
          timeToClaim: 0,
          claimableAt: expect.any(Date),
          action: expect.any(Function),
          actionName: 'Claim',
          isActionEnabled: true,
        },
        {
          token: expect.objectContaining({
            symbol: 'SPK',
            address: spk,
          }),
          amount: NormalizedUnitNumber(4),
          timeToClaim: 30,
          claimableAt: expect.any(Date),
          action: expect.any(Function),
          actionName: 'Claim',
          isActionEnabled: false,
        },
      ])
      expect(result.current.availableToStakeRow).toMatchObject({
        token: expect.objectContaining({
          symbol: 'SPK',
          address: spk,
        }),
        balance: NormalizedUnitNumber(10),
        blockExplorerLink: `https://etherscan.io/address/${spk}`,
        openStakeDialog: expect.any(Function),
      })
    })
  })
})
