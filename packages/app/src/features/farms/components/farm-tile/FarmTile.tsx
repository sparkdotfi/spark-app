import { AssetsGroup } from '@/config/chain/types'
import { formatPercentage } from '@/domain/common/format'
import { Token } from '@/domain/types/Token'
import { getTokenColor, getTokenImage } from '@/ui/assets'
import { LinkDecorator } from '@/ui/atoms/link-decorator/LinkDecorator'
import { IconStack } from '@/ui/molecules/icon-stack/IconStack'
import { cn } from '@/ui/utils/style'
import { testIds } from '@/ui/utils/testIds'
import { NormalizedUnitNumber, Percentage } from '@sparkdotfi/common-universal'
import { useState } from 'react'

export interface FarmTileProps {
  entryAssetsGroup: AssetsGroup
  apy?: Percentage
  stakingToken: Token
  staked: NormalizedUnitNumber
  rewardToken: Token
  detailsLink: string
  isPointsFarm: boolean
  'data-testid'?: string
}

export function FarmTile({
  entryAssetsGroup,
  apy,
  stakingToken,
  staked,
  rewardToken,
  detailsLink,
  isPointsFarm,
  'data-testid': dataTestId,
}: FarmTileProps) {
  const [isHovered, setIsHovered] = useState(false)

  const rewardTokenSymbol = rewardToken.symbol
  const borderAccentColor = getTokenColor(rewardTokenSymbol, { alpha: Percentage(0.7) })
  const headerAccentColor = getTokenColor(rewardTokenSymbol, { alpha: Percentage(0.5) })
  const rewardIcon = getTokenImage(rewardTokenSymbol)
  const entryTokenIcons = entryAssetsGroup.assets.map((token) => getTokenImage(token))

  return (
    <LinkDecorator to={detailsLink}>
      <div
        style={isHovered ? { borderColor: borderAccentColor } : {}}
        className={cn(
          'flex w-full cursor-pointer flex-col overflow-hidden rounded-sm',
          'group hover:-translate-y-1 border border-primary bg-primary',
          'transition-all duration-300 hover:shadow-sm',
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        data-testid={dataTestId}
      >
        <div className="relative isolate">
          <div
            style={{ background: `linear-gradient(to bottom, white -20px, ${headerAccentColor})` }}
            className={cn(
              'absolute inset-1 opacity-50 transition-opacity duration-300',
              'z-0 h-24 rounded-xs opacity-50 group-hover:opacity-90',
            )}
          />
          <img src={rewardIcon} alt="farm-reward-icon" className="relative z-10 mt-16 mb-5 ml-6 h-16 w-16" />
        </div>
        <div className="flex h-full flex-col px-6 pb-7">
          <div className="mb-auto grid w-full grid-flow-col grid-cols-[auto,auto] grid-rows-[auto,auto]">
            <div className="typography-label-3 text-secondary" data-testid={testIds.farms.tile.stakeText}>
              Deposit {entryAssetsGroup.name}
            </div>
            <div className="typography-heading-3 text-primary" data-testid={testIds.farms.tile.rewardText}>
              Earn {isPointsFarm ? `${rewardToken.name} points` : rewardTokenSymbol}
            </div>
            {apy?.gt(0) && (
              <>
                <div className="typography-label-3 justify-self-end text-secondary">APY</div>
                <div
                  className="typography-heading-3 justify-self-end text-primary"
                  data-testid={testIds.farms.tile.apy}
                >
                  {formatPercentage(apy, { minimumFractionDigits: 0 })}
                </div>
              </>
            )}
          </div>
          <div className="mt-11 mb-6 border-primary border-t" />
          {staked.gt(0) ? (
            <>
              <div className="typography-label-3 mb-2 text-secondary">Tokens deposited:</div>
              <div className="typography-label-2 flex items-center gap-1.5">
                <img src={getTokenImage(stakingToken.symbol)} alt="farm-reward-icon" className="icon-md" />
                <span data-testid={testIds.farms.tile.staked}>{stakingToken.format(staked, { style: 'auto' })}</span>{' '}
                {stakingToken.symbol}
              </div>
            </>
          ) : (
            <>
              <div className="typography-label-3 mb-2 text-secondary">Tokens to deposit:</div>
              <IconStack items={entryTokenIcons} iconBorder="white" />
            </>
          )}
        </div>
      </div>
    </LinkDecorator>
  )
}
