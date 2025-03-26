import { testAddresses } from '@/test/integration/constants'
import { handlers } from '@/test/integration/mockTransport'
import { setupHookRenderer } from '@/test/integration/setupHookRenderer'
import { CheckedAddress, NormalizedUnitNumber, Percentage, UnixTime } from '@sparkdotfi/common-universal'
import { act, waitFor } from '@testing-library/react'
import { erc20Abi, parseEther } from 'viem'
import { mainnet } from 'viem/chains'
import { describe, expect, test, vi } from 'vitest'
import { useStakeDialog } from './useStakeDialog'

const chainId = mainnet.id
const usds = CheckedAddress('0xdC035D45d973E3EC169d2276DDab16f1e407384F')
const spk = CheckedAddress('0x56072C95FAA701256059aa122697B133aDEd9279')
const account = testAddresses.alice

const chainIdCall = handlers.chainIdCall({ chainId })

const hookRenderer = setupHookRenderer({
  hook: useStakeDialog,
  account,
  handlers: [chainIdCall],
  args: {
    apy: Percentage(0.17),
    spkStakingEpochs: {
      currentEpoch: 9n,
      epochDuration: UnixTime(604800),
      epochDurationInit: UnixTime(1737071795),
    },
  },
})

describe(useStakeDialog.name, () => {
  beforeEach(() => {
    vi.useFakeTimers({
      shouldAdvanceTime: true,
    })
    const fixedTime = new Date(2025, 2, 26).getTime()
    vi.setSystemTime(fixedTime)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  test('returns proper data', async () => {
    const { result } = hookRenderer({
      extraHandlers: [
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
          result: 0n,
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
      ],
    })

    vi.advanceTimersByTime(5000)

    await waitFor(() => {
      expect(result.current.form.getValues()).toMatchObject({
        symbol: 'SPK',
        value: '',
      })
    })

    act(() => result.current.form.setValue('value', '10'))

    await waitFor(() => {
      expect(result.current.form.getValues()).toMatchObject({
        symbol: 'SPK',
        value: '10',
      })
      expect(result.current.txOverview).toMatchObject({
        status: 'success',
        apy: Percentage(0.17),
        unstakingDelay: 802590,
        rewardsPerYearUsd: NormalizedUnitNumber(0), // No price for SPK yet
      })
      expect(result.current.objectives).toMatchObject([
        {
          type: 'stakeSpk',
          amount: NormalizedUnitNumber(10),
        },
      ])
    })
  })
})
