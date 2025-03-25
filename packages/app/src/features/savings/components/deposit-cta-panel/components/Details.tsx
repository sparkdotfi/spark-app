import { AccountSparkRewardsSummary } from '@/features/savings/types'
import { assets, getTokenImage } from '@/ui/assets'
import { Link } from '@/ui/atoms/link/Link'
import { IconStack } from '@/ui/molecules/icon-stack/IconStack'
import { Info } from '@/ui/molecules/info/Info'
import { raise } from '@sparkdotfi/common-universal'
import { cva } from 'class-variance-authority'
import { ChevronsRight, ExternalLinkIcon } from 'lucide-react'
import { savingsTokenToAccountType } from '../../common/utils'
import { DepositCTAPanelProps } from '../DepositCTAPanel'

export type DetailsProps = Pick<
  DepositCTAPanelProps,
  'description' | 'entryTokens' | 'savingsToken' | 'sparkRewardsSummary'
>

export function Details({ description, entryTokens, savingsToken, sparkRewardsSummary }: DetailsProps) {
  return (
    <div className="flex flex-col gap-2 lg:gap-4">
      <div className="flex items-center gap-3">
        <div className={tokensRouteVariants({ bg: savingsTokenToAccountType(savingsToken) })}>
          <IconStack items={entryTokens} iconClassName="box-content border-2 border-[#1E3B33]" />
          <ChevronsRight className="icon-xs icon-primary-inverse" />
          <IconStack items={[savingsToken]} iconBorder="transparent" />
        </div>
        <EligibleForRewardPill sparkRewardsSummary={sparkRewardsSummary} />
      </div>
      <div className="typography-body-3 flex max-w-[48ch] flex-col text-tertiary">
        {description.text}{' '}
        <Link to={description.docsLink} className="flex items-center gap-1 text-savings" external>
          Learn more <ExternalLinkIcon className="icon-xxs" />
        </Link>
      </div>
    </div>
  )
}

const tokensRouteVariants = cva('flex w-fit items-center gap-1 rounded-full p-0.5', {
  variants: {
    bg: {
      susds: 'bg-[linear-gradient(90deg,rgb(43,79,74,0.2)_0%,rgb(43,79,74)_100%)]',
      susdc: 'bg-[linear-gradient(90deg,rgb(42,78,92,0.2)_0%,rgb(42,78,92)_100%)]',
      sdai: 'bg-[linear-gradient(90deg,rgb(39,81,60,0.2)_0%,rgb(39,81,60)_100%)]',
    },
  },
})

function EligibleForRewardPill({ sparkRewardsSummary }: { sparkRewardsSummary: AccountSparkRewardsSummary }) {
  if (sparkRewardsSummary.rewards.length === 0) {
    return null
  }

  function Pill({ children }: { children: React.ReactNode }) {
    return (
      <div className="typography-label-3 flex w-fit items-center gap-1 rounded-full bg-primary/10 p-1 text-primary-inverse backdrop-blur-sm">
        {children}
      </div>
    )
  }

  if (sparkRewardsSummary.rewards.length === 1) {
    const { rewardTokenSymbol, longDescription } = sparkRewardsSummary.rewards[0] ?? raise('No reward found')

    return (
      <Pill>
        <img src={getTokenImage(rewardTokenSymbol)} alt={rewardTokenSymbol} className="size-6" />
        <div>Rewards in {rewardTokenSymbol} Token</div>
        <Info>{longDescription}</Info>
      </Pill>
    )
  }

  return (
    <Pill>
      <img src={assets.page.sparkRewardsCircle} alt={'Spark Rewards'} className="size-6" />
      <div>Eligible for rewards</div>
      <Info>
        Eligible for rewards in the follwoing tokens:{' '}
        {sparkRewardsSummary.rewards.map(({ rewardTokenSymbol }) => rewardTokenSymbol).join(', ')}
      </Info>
    </Pill>
  )
}
