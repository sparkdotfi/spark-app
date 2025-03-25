import { formatPercentage } from '@/domain/common/format'
import { Token } from '@/domain/types/Token'
import { AccountSparkRewardsSummary } from '@/features/savings/types'
import { assets } from '@/ui/assets'
import { Link } from '@/ui/atoms/link/Link'
import { Info } from '@/ui/molecules/info/Info'
import { cn } from '@/ui/utils/style'
import { testIds } from '@/ui/utils/testIds'
import { Percentage } from '@sparkdotfi/common-universal'
import { cva } from 'class-variance-authority'
import { savingsTokenToAccountType } from '../../common/utils'

export interface HeaderProps {
  savingsToken: Token
  savingsRate: Percentage
  apyExplainer: string
  apyExplainerDocsLink: string
  inputTokens: Token[]
  sparkRewardsSummary: AccountSparkRewardsSummary
}

export function Header({
  savingsToken,
  savingsRate,
  inputTokens,
  apyExplainer,
  apyExplainerDocsLink,
  sparkRewardsSummary,
}: HeaderProps) {
  const depositText = `Deposit your ${inputTokens.length > 1 ? 'stablecoins' : inputTokens[0]!.symbol}`
  const apyComponent = (
    <span
      className={cn('text-transparent', apyBgVariants({ bg: savingsTokenToAccountType(savingsToken) }))}
      data-testid={testIds.savings.account.depositCTA.apy}
      style={{ backgroundPosition: '-142px -41px', backgroundSize: '463px 96px' }}
    >
      {formatPercentage(savingsRate, { minimumFractionDigits: 0 })}
    </span>
  )
  const apyExplainerComponent = (
    <Info className="mb-2 ml-1 inline text-tertiary">
      <>
        {apyExplainer}{' '}
        <Link to={apyExplainerDocsLink} external>
          Learn more
        </Link>
      </>
    </Info>
  )

  const headerContent = (() => {
    if (sparkRewardsSummary.totalApy.isZero()) {
      return (
        <div>
          {depositText}
          <br /> and earn {apyComponent} APY!{apyExplainerComponent}
        </div>
      )
    }

    return (
      <div>
        {depositText} and earn
        <br className="hidden sm:block" /> {apyComponent} APY{apyExplainerComponent}{' '}
        <div className="inline-flex items-center gap-1.5">
          + <img src={assets.page.sparkRewardsCircle} alt="Spark Rewards" className="size-10" />
          <div>
            <span className="bg-gradient-spark-rewards-1 bg-clip-text text-transparent">
              {formatPercentage(sparkRewardsSummary.totalApy, { minimumFractionDigits: 0 })}
            </span>{' '}
            in Rewards
          </div>
        </div>
      </div>
    )
  })()

  return (
    <div className="typography-heading-3 md:typography-heading-2 inline-flex text-primary-inverse">{headerContent}</div>
  )
}

const apyBgVariants = cva('bg-clip-text', {
  variants: {
    bg: {
      susds: 'bg-[radial-gradient(103.52%_1308.64%_at_8.98%_83.33%,#FFFFFF_0%,#80D98D_50%,#00C2A1_100%)]',
      susdc: 'bg-[radial-gradient(103.52%_1308.64%_at_8.98%_83.33%,#FFFFFF_0%,#80D98D_18%,#2775CA_68.5%)]',
      sdai: 'bg-[radial-gradient(103.52%_1308.64%_at_8.98%_83.33%,#FFFFFF_0%,#F4B731_8.5%,#8DD053_39%)]',
    },
  },
})
