import { SPK_MOCK_TOKEN } from '@/domain/types/Token'
import { useGrowingAirdropAmount } from '@/features/topbar/logic/use-airdrop-info/useGrowingAirdropAmount'
import { assets } from '@/ui/assets'
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from '@/ui/atoms/dialog/Dialog'
import { Link } from '@/ui/atoms/link/Link'
import { MenuItem, MenuItemIcon } from '@/ui/atoms/menu-item/MenuItem'
import { Skeleton } from '@/ui/atoms/skeleton/Skeleton'
import { links } from '@/ui/constants/links'
import { NormalizedUnitNumber } from '@sparkdotfi/common-universal'
import { ChevronRight, ExternalLinkIcon } from 'lucide-react'
import { useState } from 'react'
import { Airdrop, TopbarAirdropProps } from '../../topbar-airdrop/TopbarAirdrop'
import { formatAirdropAmount } from '../../topbar-airdrop/TopbarAirdropDropdown'

export function TopbarMenuAirdropItem({ airdrop, isLoading, isError }: TopbarAirdropProps) {
  if (isError) {
    return null
  }

  if (isLoading) {
    return <TopbarMenuAirdropDialog isLoading />
  }

  if (!airdrop) {
    return <TopbarMenuAirdropDialog />
  }

  return <TopbarDynamicAirdrop airdrop={airdrop} />
}

interface TopbarDynamicAirdropProps {
  airdrop: Airdrop
}
function TopbarDynamicAirdrop({ airdrop }: TopbarDynamicAirdropProps) {
  const [enableCounter, setEnableCounter] = useState(false)
  const amount = useGrowingAirdropAmount(airdrop, enableCounter)
  const isGrowing = airdrop.tokenRatePerSecond.gt(0)

  return (
    <TopbarMenuAirdropDialog
      amount={amount}
      precision={airdrop.tokenRatePrecision}
      isGrowing={isGrowing}
      setEnableCounter={setEnableCounter}
    />
  )
}

export interface TopbarAirdropDropdownProps {
  amount?: NormalizedUnitNumber
  precision?: number
  isLoading?: boolean
  isGrowing?: boolean
  setEnableCounter?: (value: boolean) => void
}

function TopbarMenuAirdropDialog({
  amount = NormalizedUnitNumber(0),
  precision = 0,
  isLoading,
  isGrowing = false,
  setEnableCounter,
}: TopbarAirdropDropdownProps) {
  return (
    <Dialog onOpenChange={(open) => setEnableCounter?.(open)}>
      <DialogTrigger asChild>
        <MenuItem variant="secondary" asChild withSeparator>
          <button className="flex items-center gap-2 rounded-none p-6">
            <div className="flex flex-col items-start gap-2">
              <span className="typography-label-3 text-secondary">Spark Airdrop Tokens</span>
              <div className="flex items-center gap-2">
                <img src={assets.brand.symbolGradient} alt="spark logo" className="icon-md" />
                {SPK_MOCK_TOKEN.format(amount ?? NormalizedUnitNumber(0), { style: 'compact' })}
              </div>
            </div>
            <MenuItemIcon icon={ChevronRight} className="icon-sm ml-auto" />
          </button>
        </MenuItem>
      </DialogTrigger>

      <DialogContent overlayVariant="default" contentVerticalPosition="bottom" className="gap-1.5 p-0">
        <DialogTitle className="border-primary border-b p-5 pt-6">Spark Airdrop Tokens</DialogTitle>

        <MenuItem className="flex flex-col items-start gap-2 p-6">
          <span className="typography-label-3 text-secondary">Amount</span>
          <div className="flex items-center gap-2">
            <img src={assets.brand.symbolGradient} className="icon-md" />
            {isLoading ? (
              <Skeleton className="h-6 w-10 rounded-sm" />
            ) : (
              <div className="typography-label-2" data-chromatic="ignore">
                {formatAirdropAmount({ amount, precision, isGrowing })} {SPK_MOCK_TOKEN.symbol}
              </div>
            )}
          </div>
        </MenuItem>

        <div className="flex flex-col gap-4 bg-secondary p-6">
          <span className="typography-body-3 text-secondary">
            DAI borrowers with volatile assets and ETH depositors will be eligible for a future ⚡ SPK airdrop.
          </span>

          <MenuItem asChild className="cursor-pointer">
            <Link to={links.docs.sparkAirdrop} variant="unstyled" external>
              Learn more
              <MenuItemIcon icon={ExternalLinkIcon} className="ml-auto" />
            </Link>
          </MenuItem>
        </div>
      </DialogContent>
    </Dialog>
  )
}
