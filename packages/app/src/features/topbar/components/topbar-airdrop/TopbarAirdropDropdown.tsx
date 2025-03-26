import { SPK_MOCK_TOKEN } from '@/domain/types/Token'
import { assets } from '@/ui/assets'
import { Button } from '@/ui/atoms/button/Button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuItemIcon,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/ui/atoms/dropdown/DropdownMenu'
import { Link } from '@/ui/atoms/link/Link'
import { Skeleton } from '@/ui/atoms/skeleton/Skeleton'
import { links } from '@/ui/constants/links'
import { text } from '@/ui/constants/text'
import { testIds } from '@/ui/utils/testIds'
import { DropdownMenuGroup } from '@radix-ui/react-dropdown-menu'
import { NormalizedUnitNumber } from '@sparkdotfi/common-universal'
import { ExternalLinkIcon, LibraryIcon } from 'lucide-react'

export interface TopbarAirdropDropdownProps {
  amount?: NormalizedUnitNumber
  precision?: number
  isLoading?: boolean
  isGrowing?: boolean
  setEnableCounter?: (value: boolean) => void
}

export function TopbarAirdropDropdown({
  amount = NormalizedUnitNumber(0),
  precision = 0,
  isLoading,
  isGrowing = false,
  setEnableCounter,
}: TopbarAirdropDropdownProps) {
  return (
    <DropdownMenu onOpenChange={(open) => setEnableCounter?.(open)}>
      <DropdownMenuTrigger asChild>
        <Button
          size="m"
          variant="tertiary"
          data-testid={testIds.topbar.airdrop.badge}
          className="aspect-square [@media(min-width:1080px)]:aspect-auto"
        >
          <img src={assets.brand.symbolGradient} className="icon-sm" />
          <span className="hidden [@media(min-width:1080px)]:block">
            {isLoading ? (
              <Skeleton className="h-5 w-7 rounded-sm" />
            ) : (
              <div data-chromatic="ignore">{SPK_MOCK_TOKEN.format(amount, { style: 'compact' })}</div>
            )}
          </span>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-64 p-1" data-testid={testIds.topbar.airdrop.dropdown}>
        <DropdownMenuGroup className="py-2">
          <DropdownMenuLabel>Spark Airdrop Tokens</DropdownMenuLabel>
          <DropdownMenuItem className="pointer-events-none py-2">
            <img src={assets.brand.symbolGradient} className="icon-md" />
            {isLoading ? (
              <Skeleton className="h-6 w-10 rounded-sm" />
            ) : (
              <div className="typography-label-2 tabular-nums" data-chromatic="ignore">
                {formatAirdropAmount({ amount, precision, isGrowing })} {SPK_MOCK_TOKEN.symbol}
              </div>
            )}
          </DropdownMenuItem>
          <DropdownMenuSeparator className="my-2" />
          <DropdownMenuItem className="!typography-body-4 pointer-events-none py-2 text-secondary">
            {text.airdrop.preFarmingEligibilityMessage}
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuItem className="cursor-pointer" asChild>
          <Link to={links.docs.sparkAirdrop} variant="unstyled" external>
            <DropdownMenuItemIcon icon={LibraryIcon} />
            Learn more
            <DropdownMenuItemIcon icon={ExternalLinkIcon} className="ml-auto" />
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export interface FormatAirdropAmountParams {
  amount: NormalizedUnitNumber
  precision: number
  isGrowing?: boolean
}

export function formatAirdropAmount({ amount, precision, isGrowing }: FormatAirdropAmountParams): string {
  if (isGrowing) {
    const formatter = new Intl.NumberFormat('en-US', {
      minimumFractionDigits: precision,
      maximumFractionDigits: precision,
    })
    return formatter.format(amount.toNumber())
  }
  return SPK_MOCK_TOKEN.format(amount, { style: 'auto' })
}
