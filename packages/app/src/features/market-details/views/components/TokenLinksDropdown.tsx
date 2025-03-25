import { useBlockExplorerAddressLink } from '@/domain/hooks/useBlockExplorerAddressLink'
import { Token } from '@/domain/types/Token'
import BoxArrowTopRight from '@/ui/assets/box-arrow-top-right.svg?react'
import { Address } from '@/ui/atoms/address/Address'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/ui/atoms/dropdown/DropdownMenu'
import { IconButton } from '@/ui/atoms/icon-button/IconButton'
import { Link } from '@/ui/atoms/link/Link'
import { TokenIcon } from '@/ui/atoms/token-icon/TokenIcon'
import { CheckedAddress } from '@sparkdotfi/common-universal'
import { MoreVerticalIcon } from 'lucide-react'
import { PropsWithChildren, ReactNode } from 'react'

export interface TokenLinksDropdownProps {
  token: Token
  aToken: Token
  variableDebtTokenAddress: CheckedAddress
  chainId: number
}

export function TokenLinksDropdown({ token, aToken, variableDebtTokenAddress, chainId }: TokenLinksDropdownProps) {
  const tokenContractsLinks = [
    { token, address: token.address, label: token.symbol },
    { token: aToken, address: aToken.address, label: aToken.symbol },
    { token: aToken, address: variableDebtTokenAddress, label: `Variable Debt ${token.symbol}` },
  ]
  return (
    <TokenLinksWrapper>
      <DropdownMenuLabel className="p-4 pb-0 text-secondary">Token Contracts</DropdownMenuLabel>
      {tokenContractsLinks.map((contractLink) => (
        <BlockExplorerAddressLink key={contractLink.address} address={contractLink.address} chainId={chainId}>
          <TokenLinksDropdownItem {...contractLink} />
        </BlockExplorerAddressLink>
      ))}
    </TokenLinksWrapper>
  )
}

function TokenLinksWrapper({ children }: PropsWithChildren) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <IconButton icon={MoreVerticalIcon} variant="tertiary" size="s" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">{children}</DropdownMenuContent>
    </DropdownMenu>
  )
}

interface BlockExplorerAddressLinkProps {
  address: CheckedAddress
  children: ReactNode
  chainId: number
}

function BlockExplorerAddressLink({ address, children, chainId }: BlockExplorerAddressLinkProps) {
  const contractLink = useBlockExplorerAddressLink({ address, chainId })

  return contractLink ? (
    <Link to={contractLink} variant="unstyled" external>
      {children}
    </Link>
  ) : (
    <>{children}</>
  )
}

interface TokenLinksDropdownItemProps {
  address: CheckedAddress
  label: string
  token: Token
}

function TokenLinksDropdownItem({ address, token, label }: TokenLinksDropdownItemProps) {
  return (
    <DropdownMenuItem key={address} className="cursor-pointer">
      <div className="flex max-w-60 flex-1 flex-col gap-1">
        <div className="flex items-center gap-1">
          <TokenIcon token={token} className="h-4 w-4" />
          <div className="typography-label-4 flex flex-row items-center gap-2.5 text-secondary group-hover:text-brand-primary lg:gap-1">
            {label}
          </div>
        </div>
        <div className="typography-body-3 flex items-center gap-2 text-primary">
          <Address address={address} postfix={<BoxArrowTopRight className="h-3.5 w-3.5" />} />
        </div>
      </div>
    </DropdownMenuItem>
  )
}
