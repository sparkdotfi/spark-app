import { formatPercentage } from '@/domain/common/format'
import { assets } from '@/ui/assets'
import { Button } from '@/ui/atoms/button/Button'
import { LinkButton } from '@/ui/atoms/link-button/LinkButton'
import { Panel } from '@/ui/atoms/panel/Panel'
import { links } from '@/ui/constants/links'
import { cn } from '@/ui/utils/style'
import { testIds } from '@/ui/utils/testIds'
import { Percentage } from '@sparkdotfi/common-universal'

export interface UpgradeSavingsBannerProps {
  onUpgradeSavingsClick: () => void
  apyImprovement?: Percentage
}

export function UpgradeSavingsBanner({ onUpgradeSavingsClick, apyImprovement }: UpgradeSavingsBannerProps) {
  return (
    <Panel
      spacing="xs"
      className="flex items-center gap-3 bg-primary sm:gap-8"
      data-testid={testIds.savings.upgradeSDaiBanner}
    >
      <img
        src={assets.savings.sdaiUpgradeBannerIcon}
        alt="savings-upgrade-banner-icon"
        className="w-[72px] lg:w-auto"
      />
      <div
        className={cn(
          'grid w-full grid-rows-[1fr_auto] items-center gap-2 sm:gap-4 lg:grid-cols-[1fr_auto] lg:grid-rows-1 lg:gap-6',
        )}
      >
        <div className="flex max-w-[420px] flex-col gap-1">
          <div className="typography-label-2 sm:typography-heading-5 text-primary">
            Upgrade your DAI Savings to USDS Savings
            {apyImprovement ? (
              <>
                {' '}
                and get <span className="text-system-success-primary">{formatPercentage(apyImprovement)}</span> higher
                APY!
              </>
            ) : (
              <> and unlock the full potential of Spark Savings.</>
            )}
          </div>
          <div className="typography-body-4 hidden text-secondary lg:flex">
            Upgrade at any size with no slippage. The upgrade is optional,
            <br />
            and you can continue using DAI Savings.
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 lg:min-w-64 lg:gap-4">
          <Button variant="secondary" size="m" onClick={onUpgradeSavingsClick}>
            Upgrade now
          </Button>
          <LinkButton to={links.docs.savings.upgradeSdai} external variant="tertiary" size="m">
            Learn more
          </LinkButton>
        </div>
      </div>
    </Panel>
  )
}
