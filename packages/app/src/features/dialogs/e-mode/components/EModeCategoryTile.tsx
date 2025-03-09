import { getTokenImage } from '@/ui/assets'
import { IconStack } from '@/ui/molecules/icon-stack/IconStack'
import { cn } from '@/ui/utils/style'

import { Badge } from '@/ui/atoms/badge/Badge'
import { EModeCategory } from '../types'

interface EModeCategoryTileProps {
  eModeCategory: EModeCategory
}

export function EModeCategoryTile({ eModeCategory }: EModeCategoryTileProps) {
  if (eModeCategory.tokens.length === 0) {
    return null
  }

  const iconPaths = eModeCategory.tokens.map(({ symbol }) => getTokenImage(symbol))
  const variant = eModeCategory.isActive ? 'active' : 'inactive'

  return (
    <button
      onClick={eModeCategory.onSelect}
      className={cn(
        'grid grid-rows-3 items-center justify-start gap-2 text-start',
        'rounded-sm bg-primary p-2 outline outline-1 outline-primary sm:p-4',
        'transition-all duration-200 hover:shadow-lg',
        'focus-visible:outline-0 focus-visible:ring focus-visible:ring-primary-200 focus-visible:ring-offset-0',
        eModeCategory.isSelected && 'outline-0 ring-1 ring-borrow-200 ring-offset-0',
      )}
    >
      <Badge variant={variant === 'active' ? 'success' : 'neutral'} appearance="soft" size="sm">
        {variant === 'active' ? 'Active' : 'Inactive'}
      </Badge>
      <h4 className="typography-label-2">{eModeCategory.name}</h4>
      <IconStack items={iconPaths} maxIcons={4} />
    </button>
  )
}
