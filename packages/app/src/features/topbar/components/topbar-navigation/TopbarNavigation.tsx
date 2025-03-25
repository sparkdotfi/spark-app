import { Path, paths } from '@/config/paths'
import { formatPercentage } from '@/domain/common/format'
import { SavingsAPYBadge } from '@/features/savings/components/navbar-item/SavingsAPYBadge'
import { SavingsConverterQueryResults } from '@/features/topbar/types'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/ui/atoms/dropdown/DropdownMenu'
import { cn } from '@/ui/utils/style'
import { Percentage } from '@marsfoundation/common-universal'
import { ChevronDown } from 'lucide-react'
import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { TopbarButton } from './TopbarButton'
import { SparkTokenNavLinkContent } from './components/SparkTokenNavLinkContent'
import { LINKS_DATA } from './constants'

export interface TopbarNavigationInfo {
  daiSymbol?: string
  usdsSymbol?: string
}

export interface TopbarNavigationProps {
  savingsConverter: SavingsConverterQueryResults | undefined
  spkStakingApy: Percentage | undefined
  blockedPages: Path[]
  borrowSubLinks: {
    to: string
    label: string
  }[]
  isBorrowSubLinkActive: boolean
  isSparkTokenSubLinkActive: boolean
}

export function TopbarNavigation({
  savingsConverter,
  spkStakingApy,
  blockedPages,
  borrowSubLinks,
  isBorrowSubLinkActive,
  isSparkTokenSubLinkActive,
}: TopbarNavigationProps) {
  const [borrowDropdownOpen, setBorrowDropdownOpen] = useState(false)
  const [sparkTokenDropdownOpen, setSparkTokenDropdownOpen] = useState(false)

  function handleNavigate() {
    setBorrowDropdownOpen(false)
    setSparkTokenDropdownOpen(false)
  }

  return (
    <div className="hidden gap-2 sm:flex">
      {!blockedPages.some((page) => page === 'savings') && ( // some instead of includes for better type inference
        <TopbarButton
          to={paths.savings}
          label={LINKS_DATA.savings.label}
          prefixIcon={LINKS_DATA.savings.icon}
          type="savings"
          postfixSlot={
            savingsConverter?.data || savingsConverter?.isLoading ? (
              <SavingsAPYBadge
                APY={savingsConverter.data?.apy}
                isLoading={savingsConverter.isLoading}
                className="hidden lg:inline-flex"
              />
            ) : undefined
          }
        />
      )}

      <DropdownMenu open={borrowDropdownOpen} onOpenChange={setBorrowDropdownOpen}>
        <DropdownMenuTrigger asChild>
          <TopbarButton
            label={LINKS_DATA.borrow.label}
            type="borrow"
            prefixIcon={LINKS_DATA.borrow.icon}
            postfixSlot={
              <ChevronDown className={cn('transition-transform duration-300', borrowDropdownOpen && 'rotate-180')} />
            }
            active={isBorrowSubLinkActive}
            highlighted={borrowDropdownOpen}
          />
        </DropdownMenuTrigger>

        <DropdownMenuContent className="w-72 shadow-2xl" align="start">
          {borrowSubLinks.map((link) => (
            <DropdownMenuItem
              key={link.to}
              asChild
              className="cursor-pointer rounded-none border-b border-b-primary p-0 first:rounded-t-xs last:rounded-b-xs last:border-none"
            >
              <NavLink to={link.to} onClick={handleNavigate}>
                {({ isActive }) => (
                  <div
                    className={cn('relative w-full p-6 text-secondary hover:text-primary', isActive && 'text-primary')}
                  >
                    <div
                      className={cn(
                        // @note: one time use gradient
                        'absolute top-0 bottom-0 left-0 hidden w-[3px] bg-gradient-to-br from-[#FFCD4D] to-[#FF895D] opacity-0',
                        isActive && 'block opacity-1',
                      )}
                    />
                    {link.label}
                  </div>
                )}
              </NavLink>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {import.meta.env.VITE_DEV_SPARK_TOKEN === '1' && (
        <DropdownMenu open={sparkTokenDropdownOpen} onOpenChange={setSparkTokenDropdownOpen}>
          <DropdownMenuTrigger asChild>
            <TopbarButton
              label={LINKS_DATA.sparkToken.label}
              type="sparkToken"
              prefixIcon={LINKS_DATA.sparkToken.icon}
              postfixSlot={
                <ChevronDown
                  className={cn('transition-transform duration-300', sparkTokenDropdownOpen && 'rotate-180')}
                />
              }
              active={isSparkTokenSubLinkActive}
              highlighted={sparkTokenDropdownOpen}
            />
          </DropdownMenuTrigger>

          <DropdownMenuContent className="w-72 shadow-2xl" align="start">
            <DropdownMenuItem
              key={paths.spkStaking}
              asChild
              className="cursor-pointer rounded-none border-b border-b-primary p-0 first:rounded-t-xs last:rounded-b-xs last:border-none"
            >
              <NavLink to={paths.spkStaking} onClick={handleNavigate}>
                {({ isActive }) => (
                  <SparkTokenNavLinkContent isActive={isActive}>
                    <div className="flex flex-col gap-2">
                      <div className="typography-label-2 text-primary">Staking</div>
                      <div className="typography-body-4 text-secondary">Deposit SPK and earn USDS rewards.</div>
                    </div>
                    <div className="typography-label-3 rounded-full bg-gradient-spark-primary-2 px-1.5 py-0.5 text-primary-inverse">
                      {formatPercentage(spkStakingApy)}
                    </div>
                  </SparkTokenNavLinkContent>
                )}
              </NavLink>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}

      <TopbarButton to={paths.farms} type="farms" label={LINKS_DATA.farms.label} prefixIcon={LINKS_DATA.farms.icon} />
    </div>
  )
}
