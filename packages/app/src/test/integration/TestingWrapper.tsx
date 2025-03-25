import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter } from 'react-router-dom'
import { WagmiProvider, useAccount } from 'wagmi'

import { useAutoConnect } from '@/domain/wallet/useAutoConnect'

import { Suspense } from 'react'
import { createWagmiTestConfig } from './wagmi-config'

export function TestingWrapper({
  config,
  children,
  queryClient,
  initialPath,
}: {
  config: ReturnType<typeof createWagmiTestConfig>
  children: React.ReactNode
  queryClient: QueryClient
  initialPath?: string
}) {
  const waitForAccount = config.connectors.length > 0
  useAutoConnect({ config })

  return (
    <MemoryRouter initialEntries={[initialPath ?? '/']}>
      <Suspense fallback={null}>
        <WagmiProvider config={config}>
          <QueryClientProvider client={queryClient}>
            {waitForAccount ? <WaitForAccountToConnect>{children}</WaitForAccountToConnect> : children}
          </QueryClientProvider>
        </WagmiProvider>
      </Suspense>
    </MemoryRouter>
  )
}

function WaitForAccountToConnect({ children }: { children: React.ReactNode }) {
  const { address } = useAccount()
  if (!address) {
    return null
  }
  return <>{children}</>
}
