import { EnsName } from '@/domain/types/EnsName'
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from '@/ui/atoms/dialog/Dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuItemIcon,
  DropdownMenuSeparator,
} from '@/ui/atoms/dropdown/DropdownMenu'
import { Link } from '@/ui/atoms/link/Link'
import { MenuItem, MenuItemIcon } from '@/ui/atoms/menu-item/MenuItem'
import { DropdownMenuTrigger } from '@radix-ui/react-dropdown-menu'
import { CheckedAddress } from '@sparkdotfi/common-universal'
import { ExternalLink, UnplugIcon } from 'lucide-react'
import { useState } from 'react'
import { TopbarWalletButton } from './TopbarWalletButton'
import { TopbarWalletAddressDisplay } from './components/TopbarWalletAddressDisplay'

export interface TopbarWalletDropdownTriggerInfo {
  mode: 'sandbox' | 'connected'
  avatar: string
  address: CheckedAddress
  ensName?: EnsName
}

export interface TopbarWalletDropdownContentInfo {
  walletIcon: string
  address: CheckedAddress
  onDisconnect: () => void
  blockExplorerAddressLink: string | undefined
}

export interface TopbarWalletDropdownProps {
  dropdownTriggerInfo: TopbarWalletDropdownTriggerInfo
  dropdownContentInfo: TopbarWalletDropdownContentInfo
  isMobileDisplay: boolean
}

export function TopbarWalletDropdown({
  dropdownTriggerInfo,
  dropdownContentInfo,
  isMobileDisplay,
}: TopbarWalletDropdownProps) {
  const [open, setOpen] = useState(false)

  const { address, blockExplorerAddressLink, walletIcon, onDisconnect } = dropdownContentInfo

  const triggerButton = <TopbarWalletButton open={open} {...dropdownTriggerInfo} />

  if (dropdownTriggerInfo.mode === 'sandbox') {
    return triggerButton
  }

  function handleDisconnect() {
    setOpen(false)
    onDisconnect()
  }

  if (isMobileDisplay) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>{triggerButton}</DialogTrigger>
        <DialogContent overlayVariant="default" contentVerticalPosition="bottom" className="gap-1.5">
          <DialogTitle className="pt-2 pb-4">Wallet</DialogTitle>
          <TopbarWalletAddressDisplay walletIcon={walletIcon} address={address} />

          <MenuItem asChild>
            <button className="cursor-pointer" onClick={handleDisconnect}>
              <MenuItemIcon icon={UnplugIcon} />
              Disconnect
            </button>
          </MenuItem>

          {blockExplorerAddressLink && (
            <>
              <div className="border-primary border-t" />

              <MenuItem asChild className="curser-pointer">
                <Link to={blockExplorerAddressLink} variant="unstyled" external>
                  <MenuItemIcon icon={ExternalLink} />
                  View on Explorer
                </Link>
              </MenuItem>
            </>
          )}
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>{triggerButton}</DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="flex w-60 flex-col gap-1.5 p-1 text-primary">
        <TopbarWalletAddressDisplay walletIcon={walletIcon} address={address} />

        <DropdownMenuItem asChild>
          <button className="cursor-pointer" onClick={handleDisconnect}>
            <DropdownMenuItemIcon icon={UnplugIcon} />
            Disconnect
          </button>
        </DropdownMenuItem>

        {blockExplorerAddressLink && (
          <>
            <DropdownMenuSeparator className="mx-1" />

            <DropdownMenuItem asChild className="cursor-pointer">
              <Link to={blockExplorerAddressLink} variant="unstyled" external>
                <DropdownMenuItemIcon icon={ExternalLink} />
                View on Explorer
              </Link>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

TopbarWalletDropdown.displayName = 'TopbarWalletDropdown'
