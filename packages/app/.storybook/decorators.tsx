import { Dialog, DialogContent } from '@/ui/atoms/dialog/Dialog'
import { TooltipProvider } from '@/ui/atoms/tooltip/Tooltip'
import { CheckedAddress } from '@sparkdotfi/common-universal'
import { StoryFn } from '@storybook/react'
import { QueryClient, QueryClientConfig, QueryClientProvider } from '@tanstack/react-query'
import { useEffect, useRef } from 'react'
import { custom, encodeFunctionResult } from 'viem'
import { erc20Abi } from 'viem'
import { mainnet } from 'viem/chains'
import { WagmiProvider, createConfig, useAccount, useConnect } from 'wagmi'
import { mock } from 'wagmi/connectors'
import { DevContainer } from './DevContainer'
import { STORYBOOK_TIMESTAMP } from './consts'

export function WithTooltipProvider() {
  return function WithTooltipProvider(Story: StoryFn) {
    return (
      <TooltipProvider delayDuration={0}>
        <Story />
      </TooltipProvider>
    )
  }
}

export function WithClassname(classname: string) {
  return function WithClassname(Story: StoryFn) {
    return (
      <div data-sb="decorator">
        <div className={classname}>
          <Story />
        </div>
      </div>
    )
  }
}

export function WithDevContainer() {
  return function WithDevContainer(Story: StoryFn) {
    return (
      <DevContainer>
        <Story />
      </DevContainer>
    )
  }
}

export function ZeroAllowanceWagmiDecorator({ requestFnOverride }: { requestFnOverride?: () => Promise<string> } = {}) {
  const config = createConfig({
    chains: [mainnet],
    transports: {
      [mainnet.id]: custom({
        request:
          requestFnOverride ??
          (async (): Promise<string> => {
            return encodeFunctionResult({
              abi: erc20Abi,
              functionName: 'allowance',
              result: 0n,
            })
          }),
      }),
    },
    connectors: [
      mock({
        accounts: [CheckedAddress.ZERO()],
      }),
    ],
    batch: {
      multicall: false,
    },
  })

  // explicitly retries connection if it fails when auto connecting. This is the case for incognito mode
  function ForceConnectWrapper({ children }: { children: React.ReactNode }) {
    const { connect, connectors } = useConnect()
    const { address } = useAccount()
    useEffect(() => {
      if (!address) {
        connect({
          connector: connectors[0]!,
        })
      }
    }, [address, connect, connectors])

    if (!address) {
      return <div> Loading account </div>
    }
    return <>{children}</>
  }

  return function ZeroAllowanceWagmiDecorator(Story: StoryFn) {
    return (
      <WagmiProvider config={config}>
        <ForceConnectWrapper>
          <Story />
        </ForceConnectWrapper>
      </WagmiProvider>
    )
  }
}

export function WithQueryClient(config?: QueryClientConfig) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false }, ...config },
  })

  // stories with errors should explicitly fail
  queryClient.getQueryCache().subscribe(({ query }) => {
    if (query.state.status === 'error') {
      throw query.state.error
    }
  })
  queryClient.getMutationCache().subscribe(({ mutation }) => {
    if (mutation && mutation.state.status === 'error') {
      throw mutation.state.error
    }
  })

  return function WithQueryClient(Story: StoryFn) {
    return (
      <QueryClientProvider client={queryClient}>
        <Story />
      </QueryClientProvider>
    )
  }
}

export function WithFixedDate() {
  return function WithFixedDate(Story: StoryFn) {
    // biome-ignore lint/correctness/useHookAtTopLevel: the second one is the actual component that gets rendered
    const firstRender = useRef(true)
    if (firstRender.current) {
      Date.now = () => STORYBOOK_TIMESTAMP

      firstRender.current = false
    }

    return <Story />
  }
}

export function WithWrappingDialog() {
  return function WithWrappingDialog(Story: StoryFn) {
    return (
      <Dialog open={true}>
        <DialogContent>
          <Story />
        </DialogContent>
      </Dialog>
    )
  }
}
