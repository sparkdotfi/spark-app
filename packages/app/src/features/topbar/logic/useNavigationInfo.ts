import { getChainConfigEntry } from '@/config/chain'
import { paths } from '@/config/paths'
import { useBlockedPages } from '@/features/compliance/logic/useBlockedPages'
import { Percentage } from '@marsfoundation/common-universal'
import { matchPath, useLocation } from 'react-router-dom'
import { TopbarNavigationProps } from '../components/topbar-navigation/TopbarNavigation'
import { useSavingsConverter } from './useSavingsConverter'

interface UseNavigationInfoParams {
  chainId: number
}

export function useNavigationInfo({ chainId }: UseNavigationInfoParams): TopbarNavigationProps {
  const blockedPages = useBlockedPages()
  const savingsConverter = useSavingsConverter()
  const tokens = getChainConfigEntry(chainId)?.markets?.highlightedTokensToBorrow

  const borrowLabelTokens = tokens
    ? tokens.length > 1
      ? `${tokens.slice(0, -1).join(', ')} or ${tokens.slice(-1)}`
      : tokens[0]
    : ''

  const borrowSubLinks = [
    {
      to: paths.easyBorrow,
      label: `Borrow ${borrowLabelTokens}`,
    },
    {
      to: paths.myPortfolio,
      label: 'My portfolio',
    },
    {
      to: paths.markets,
      label: 'Markets',
    },
  ]

  const sparkTokenSubLinks = [paths.spkStaking]

  const location = useLocation()
  const isBorrowSubLinkActive = borrowSubLinks.some((link) => matchPath(`${link.to}/*`, location.pathname))
  const isSparkTokenSubLinkActive = sparkTokenSubLinks.some((link) => matchPath(`${link}/*`, location.pathname))

  return {
    savingsConverter,
    // @todo: spk staking - replace with actual apy
    spkStakingApy: Percentage(0.172),
    blockedPages,
    borrowSubLinks,
    isBorrowSubLinkActive,
    isSparkTokenSubLinkActive,
  }
}
