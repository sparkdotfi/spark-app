import BoxArrowTopRight from '@/ui/assets/box-arrow-top-right.svg?react'
import DocumentSketchIcon from '@/ui/assets/document-sketch.svg?react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/ui/atoms/dropdown/DropdownMenu'
import { IconButton } from '@/ui/atoms/icon-button/IconButton'
import { LinkDecorator } from '@/ui/atoms/link-decorator/LinkDecorator'
import { testIds } from '@/ui/utils/testIds'
import { MoreVerticalIcon } from 'lucide-react'

export interface ViewContractMoreDropdownProps {
  blockExplorerLink: string | undefined
  disabled?: boolean
}

export function ViewContractMoreDropdown({ blockExplorerLink, disabled }: ViewContractMoreDropdownProps) {
  return (
    <DropdownWrapper disabled={disabled}>
      {blockExplorerLink && (
        <LinkDecorator to={blockExplorerLink} external>
          <DropdownItem>
            <DocumentSketchIcon className="h-4 w-4" />
            View contract
            <BoxArrowTopRight className="ml-auto h-4 w-4" />
          </DropdownItem>
        </LinkDecorator>
      )}
    </DropdownWrapper>
  )
}

function DropdownWrapper({ children, disabled }: { children?: React.ReactNode; disabled?: boolean }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <IconButton
          variant="tertiary"
          size="s"
          disabled={disabled}
          data-testid={testIds.savings.supportedStablecoins.moreDropdown}
          icon={MoreVerticalIcon}
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">{children}</DropdownMenuContent>
    </DropdownMenu>
  )
}

function DropdownItem({
  children,
  onClick,
  disabled,
  'data-testid': dataTestId,
}: { children: React.ReactNode; onClick?: () => void; disabled?: boolean; 'data-testid'?: string }) {
  return (
    <DropdownMenuItem
      className="flex cursor-pointer items-center gap-2 text-secondary"
      onClick={onClick}
      disabled={disabled}
      data-testid={dataTestId}
    >
      {children}
    </DropdownMenuItem>
  )
}
