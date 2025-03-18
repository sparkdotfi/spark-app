import { DialogTitle } from '@/ui/atoms/dialog/Dialog'
import { cn } from '@/ui/utils/style'
import { MultiPanelDialog } from '../../common/components/MultiPanelDialog'
import { NetworkStatusBadge } from '../components/NetworkStatusBadge'
import { Chain } from '../types'

export interface SelectNetworkDialogViewProps {
  chains: Chain[]
}

export function SelectNetworkDialogView({ chains }: SelectNetworkDialogViewProps) {
  return (
    <MultiPanelDialog>
      <DialogTitle className="py-2 md:p-0">Select network</DialogTitle>
      <div className="flex flex-col gap-3.5">
        {chains.map((chain) => (
          <button
            className={cn(
              'relative isolate flex flex-col rounded-sm border border-primary',
              'hover:-translate-y-1 hover:shadow-lg',
              'focus-visible:border-transparent focus-visible:outline-none focus-visible:ring focus-visible:ring-primary-200 focus-visible:ring-offset-0',
              'cursor-pointer transition-all duration-300',
              !chain.selected && 'hover:border-brand-tertiary',
              chain.selected && [
                'before:absolute before:inset-[-1px] before:z-[-2] before:rounded-[9px] before:bg-gradient-spark-primary-1',
                'after:absolute after:inset-0 after:z-[-1] after:rounded-sm after:bg-primary',
                'focus-visible:after:hidden focus-visible:before:hidden',
              ],
              !chain.selected && chain.isInSwitchingProcess && 'border-brand-tertiary',
            )}
            onClick={() => chain.onSelect()}
            key={chain.name}
          >
            <div className="flex w-full items-center justify-between border-b px-4 py-5">
              <div className="typography-label-2 flex items-center gap-2">
                <img src={chain.logo} className="h-6 w-6" />
                {chain.name}
              </div>
              {chain.selected ? (
                <NetworkStatusBadge status="connected" />
              ) : chain.isInSwitchingProcess ? (
                <NetworkStatusBadge status="pending" />
              ) : undefined}
            </div>
            <div className="typography-label-4 p-4 text-left">
              <span className="text-secondary">Network available for:</span> {chain.supportedPages.join(', ')}
            </div>
          </button>
        ))}
      </div>
    </MultiPanelDialog>
  )
}
