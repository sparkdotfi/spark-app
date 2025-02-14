import { paths } from '@/config/paths'
import { TokenSymbol } from '@/domain/types/TokenSymbol'
import { getTokenImage } from '@/ui/assets'
import { LinkButton } from '@/ui/atoms/link-button/LinkButton'
import { Panel } from '@/ui/atoms/panel/Panel'
import { IconStack } from '@/ui/molecules/icon-stack/IconStack'
import { cn } from '@/ui/utils/style'

const TOKEN_ICON_PATHS = ['USDS', 'wstETH', 'ETH', 'USDC', 'DAI'].map(TokenSymbol).map(getTokenImage)

interface CreatePositionPanelProps {
  className?: string
}

export function CreatePositionPanel({ className }: CreatePositionPanelProps) {
  return (
    <Panel className={cn('flex flex-col gap-6 text-center', className)}>
      <div className="flex flex-col items-center gap-6 text-center">
        <IconStack items={TOKEN_ICON_PATHS} size="lg" stackingOrder="first-on-top" />
        <div className="typography-heading-4 sm:typography-heading-3 max-w-[30ch]">
          Use our Easy Borrow Flow to quickly deposit your assets and borrow DAI
        </div>
      </div>
      <LinkButton to={paths.easyBorrow}>Create position</LinkButton>
    </Panel>
  )
}
