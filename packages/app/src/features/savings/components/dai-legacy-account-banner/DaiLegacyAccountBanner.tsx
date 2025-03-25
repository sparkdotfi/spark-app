import { formatPercentage } from '@/domain/common/format'
import { assets } from '@/ui/assets'
import { LinkButton } from '@/ui/atoms/link-button/LinkButton'
import { Panel } from '@/ui/atoms/panel/Panel'
import { links } from '@/ui/constants/links'
import { cn } from '@/ui/utils/style'
import { Percentage } from '@sparkdotfi/common-universal'

export interface UpgradeSavingsBannerProps {
  apyImprovement?: Percentage
}

export function DaiLegacyAccountBanner({ apyImprovement }: UpgradeSavingsBannerProps) {
  return (
    <Panel spacing="xs" className="flex items-center gap-3 bg-primary sm:gap-8">
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
        <div className="flex flex-col gap-1">
          <div className="typography-label-2 sm:typography-heading-5 text-primary">
            This is a legacy Savings Account. <br className="hidden sm:inline" />
            You can deposit your DAI into USDS Savings <br className="hidden sm:inline" />
            {apyImprovement ? (
              <>
                and get <span className="text-system-success-primary">{formatPercentage(apyImprovement)}</span> higher
                APY!
              </>
            ) : (
              <>and unlock the full potential of Spark Savings.</>
            )}
          </div>
        </div>
        <LinkButton to={links.docs.savings.newSavings} external variant="tertiary" className="sm:mr-4" size="m">
          Learn more
        </LinkButton>
      </div>
    </Panel>
  )
}
