import { formatPercentage } from '@/domain/common/format'
import { Token, USD_MOCK_TOKEN } from '@/domain/types/Token'
import { Link } from '@/ui/atoms/link/Link'
import { Panel } from '@/ui/atoms/panel/Panel'
import { TokenIcon } from '@/ui/atoms/token-icon/TokenIcon'
import { cn } from '@/ui/utils/style'
import { testIds } from '@/ui/utils/testIds'
import { NormalizedNumber, Percentage } from '@sparkdotfi/common-universal'
import { AccountSparkRewardsSummary } from '../../types'
import { AdditionalInfo } from './AdditionalInfo'
import { PlusSparkRewards } from './PlusSparkRewards'

export interface BottomPanelProps {
  underlyingToken: Token
  savingsToken: Token
  savingsTokenBalance: NormalizedNumber
  apy: Percentage
  apyExplainer: string
  apyExplainerDocsLink: string
  oneYearProjection: NormalizedNumber
  sparkRewardsOneYearProjection: NormalizedNumber
  sparkRewardsSummary: AccountSparkRewardsSummary
  className?: string
}

export function BottomPanel({
  underlyingToken,
  savingsToken,
  savingsTokenBalance,
  apy,
  apyExplainer,
  apyExplainerDocsLink,
  oneYearProjection,
  sparkRewardsOneYearProjection,
  sparkRewardsSummary,
  className,
}: BottomPanelProps) {
  return (
    <Panel variant="secondary" className={cn('flex flex-col gap-3', className)}>
      <BottomPanelItem>
        <AdditionalInfo.Label
          tooltipContent={
            <>
              {apyExplainer}{' '}
              <Link to={apyExplainerDocsLink} external>
                Learn more
              </Link>
            </>
          }
        >
          APY
        </AdditionalInfo.Label>
        <AdditionalInfo.Content>
          <div
            className="typography-label-2 flex items-center gap-1 text-primary-inverse"
            data-testid={testIds.savings.account.mainPanel.apy}
          >
            {formatPercentage(apy, { minimumFractionDigits: 0 })}
            {sparkRewardsSummary.totalApy.gt(0) && (
              <PlusSparkRewards text={formatPercentage(sparkRewardsSummary.totalApy, { minimumFractionDigits: 0 })} />
            )}
          </div>
        </AdditionalInfo.Content>
      </BottomPanelItem>
      <BottomPanelItem>
        <AdditionalInfo.Label tooltipContent="This is an estimate of what you could earn in 1 year.">
          1-year projection
        </AdditionalInfo.Label>
        <AdditionalInfo.Content>
          <div className="typography-label-2 flex items-center gap-1">
            <div className="flex items-center gap-1.5">
              <div className="flex gap-[1px]">
                <div className="text-feature-savings-primary">+</div>
                <div className="text-primary-inverse">
                  {underlyingToken.format(oneYearProjection, { style: 'auto' })}
                </div>
              </div>
              <TokenIcon token={underlyingToken} className="size-4" />
            </div>
            {sparkRewardsOneYearProjection.gt(0) && (
              <PlusSparkRewards text={USD_MOCK_TOKEN.formatUSD(sparkRewardsOneYearProjection)} />
            )}
          </div>
        </AdditionalInfo.Content>
      </BottomPanelItem>
      <BottomPanelItem>
        <AdditionalInfo.Label>Your {savingsToken.symbol} balance</AdditionalInfo.Label>
        <AdditionalInfo.Content>
          <div className="typography-label-2 flex items-center gap-1.5">
            {savingsToken.format(savingsTokenBalance, { style: 'auto' })}
            <TokenIcon token={savingsToken} className="size-4" />
          </div>
        </AdditionalInfo.Content>
      </BottomPanelItem>
    </Panel>
  )
}

function BottomPanelItem({ children }: { children: React.ReactNode }) {
  return <div className="flex items-center justify-between">{children}</div>
}
