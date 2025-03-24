import { getChainConfigEntry } from '@/config/chain'
import { Path, getSupportedPages, pathGroups, paths } from '@/config/paths'
import { matchPath, useLocation } from 'react-router-dom'
import { mainnet } from 'viem/chains'
import { useChainId } from 'wagmi'

export interface UsePageChainIdResult {
  chainId: number
  pageSupported: boolean
  pageName: string
  activePathGroup: keyof typeof pathGroups | null
}

export function usePageChainId(): UsePageChainIdResult {
  const chainId = useChainId()
  const location = useLocation()
  const supportedPages = getSupportedPages(getChainConfigEntry(chainId), chainId)

  const currentPage = Object.entries(paths).find(([_, path]) => matchPath(path, location.pathname))?.[0] as Path
  const pageName = pageNamesMap[currentPage]

  const activePathGroup = Object.entries(pathGroups).find(([_, paths]) =>
    paths.includes(currentPage),
  )?.[0] as keyof typeof pathGroups

  if (!currentPage) {
    // @note When the current page is not found in the paths that means the page is
    // not existent *but* supported so we can display 404 page
    return { chainId, pageSupported: true, pageName: '', activePathGroup: null }
  }

  if (supportedPages.includes(currentPage)) {
    return { chainId, pageSupported: true, pageName, activePathGroup }
  }

  return { chainId: mainnet.id, pageSupported: false, pageName, activePathGroup }
}

const pageNamesMap: Record<Path, string> = {
  easyBorrow: 'Easy Borrow',
  myPortfolio: 'Portfolio',
  markets: 'Markets',
  marketDetails: 'Market',
  savings: 'Savings',
  farms: 'Farms',
  farmDetails: 'Farm',
  sparkRewards: 'Rewards',
  spkStaking: 'SPK Staking',
}
