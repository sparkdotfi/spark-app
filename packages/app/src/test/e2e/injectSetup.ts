import { Page } from '@playwright/test'

import {
  PLAYWRIGHT_CHAIN_ID,
  PLAYWRIGHT_SUSDC_CONTRACTS_AVAILABLE_KEY,
  PLAYWRIGHT_WALLET_ADDRESS_KEY,
  PLAYWRIGHT_WALLET_ATOMIC_BATCH_SUPPORTED_KEY,
  PLAYWRIGHT_WALLET_FORK_URL_KEY,
  PLAYWRIGHT_WALLET_PRIVATE_KEY_KEY,
} from '@/config/wagmi/e2e-consts'
import { TestnetClient } from '@sparkdotfi/common-testnets'
import { zeroAddress } from 'viem'
import { arbitrum, base, mainnet } from 'viem/chains'
import { InjectableWallet } from './setup'

export async function injectWalletConfiguration(
  page: Page,
  wallet: InjectableWallet,
  atomicBatchSupported = false,
): Promise<void> {
  await page.addInitScript(
    ({
      PLAYWRIGHT_WALLET_ADDRESS_KEY,
      PLAYWRIGHT_WALLET_PRIVATE_KEY_KEY,
      PLAYWRIGHT_WALLET_ATOMIC_BATCH_SUPPORTED_KEY,
      atomicBatchSupported,
      wallet,
    }) => {
      if ('privateKey' in wallet) {
        delete (window as any)[PLAYWRIGHT_WALLET_ADDRESS_KEY]
        ;(window as any)[PLAYWRIGHT_WALLET_PRIVATE_KEY_KEY] = wallet.privateKey
      } else {
        delete (window as any)[PLAYWRIGHT_WALLET_PRIVATE_KEY_KEY]
        ;(window as any)[PLAYWRIGHT_WALLET_ADDRESS_KEY] = wallet.address
      }

      if (atomicBatchSupported) {
        ;(window as any)[PLAYWRIGHT_WALLET_ATOMIC_BATCH_SUPPORTED_KEY] = true
      } else {
        delete (window as any)[PLAYWRIGHT_WALLET_ATOMIC_BATCH_SUPPORTED_KEY]
      }
    },
    {
      PLAYWRIGHT_WALLET_ADDRESS_KEY,
      PLAYWRIGHT_WALLET_PRIVATE_KEY_KEY,
      PLAYWRIGHT_WALLET_FORK_URL_KEY,
      PLAYWRIGHT_WALLET_ATOMIC_BATCH_SUPPORTED_KEY,
      atomicBatchSupported,
      wallet,
    },
  )
}

interface InjectNetworkConfigurationParams {
  page: Page
  rpcUrl: string
  chainId: number
}

export async function injectNetworkConfiguration({
  page,
  rpcUrl,
  chainId,
}: InjectNetworkConfigurationParams): Promise<void> {
  await page.addInitScript(
    ({ PLAYWRIGHT_WALLET_FORK_URL_KEY, PLAYWRIGHT_CHAIN_ID, rpcUrl, chainId }) => {
      ;(window as any)[PLAYWRIGHT_WALLET_FORK_URL_KEY] = rpcUrl
      ;(window as any)[PLAYWRIGHT_CHAIN_ID] = chainId
    },
    {
      PLAYWRIGHT_WALLET_FORK_URL_KEY,
      PLAYWRIGHT_CHAIN_ID,
      rpcUrl,
      chainId,
    },
  )
}

export async function injectFlags(page: Page, testnetClient: TestnetClient, chainId: number): Promise<void> {
  const isSusdcDeployed = await isSudcDeployed(testnetClient, chainId)

  await page.addInitScript(
    ({ PLAYWRIGHT_SUSDC_CONTRACTS_AVAILABLE_KEY, isSusdcDeployed }) => {
      if (isSusdcDeployed) {
        ;(window as any)[PLAYWRIGHT_SUSDC_CONTRACTS_AVAILABLE_KEY] = true
      }
    },
    { PLAYWRIGHT_SUSDC_CONTRACTS_AVAILABLE_KEY, isSusdcDeployed },
  )
}

async function isSudcDeployed(testnetClient: TestnetClient, chainId: number): Promise<boolean> {
  const susdcAddress = (() => {
    if (chainId === mainnet.id) {
      return '0xBc65ad17c5C0a2A4D159fa5a503f4992c7B545FE'
    }
    if (chainId === base.id) {
      return '0x3128a0F7f0ea68E7B7c9B00AFa7E41045828e858'
    }
    if (chainId === arbitrum.id) {
      return '0x940098b108fB7D0a7E374f6eDED7760787464609'
    }
    return zeroAddress
  })()

  const susdcBytecode = await testnetClient.getCode({ address: susdcAddress })
  return susdcBytecode !== undefined && susdcBytecode.length > 2
}

export async function overrideRoutes(page: Page): Promise<void> {
  await page.route('https://api.ipify.org/?format=json', async (route) => {
    await route.fulfill({
      status: 200,
      body: JSON.stringify({ ip: '196.247.180.132' }),
    })
  })
  await page.route(/ip\/status\?ip=196.247.180.132/, async (route) => {
    await route.fulfill({
      status: 200,
      body: JSON.stringify({ is_vpn: false, country_code: 'PL' }),
    })
  })
}
