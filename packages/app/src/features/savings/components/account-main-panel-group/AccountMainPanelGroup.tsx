import { paths } from '@/config/paths'
import { Token } from '@/domain/types/Token'
import { assets } from '@/ui/assets'
import { Button } from '@/ui/atoms/button/Button'
import { Link } from '@/ui/atoms/link/Link'
import { Panel } from '@/ui/atoms/panel/Panel'
import { cn } from '@/ui/utils/style'
import { testIds } from '@/ui/utils/testIds'
import { NormalizedNumber, Percentage } from '@sparkdotfi/common-universal'
import { cva } from 'class-variance-authority'
import { ChevronRightIcon } from 'lucide-react'
import { SavingsOverview } from '../../logic/makeSavingsOverview'
import { AccountSparkRewardsSummary } from '../../types'
import { savingsTokenToAccountType } from '../common/utils'
import { BottomPanel } from './BottomPanel'
import { GrowingBalance } from './GrowingBalance'
import { SidePanelGroup } from './SidePanelGroup'

export interface AccountMainPanelGroupProps {
  underlyingToken: Token
  savingsToken: Token
  savingsTokenBalance: NormalizedNumber
  calculateUnderlyingTokenBalance: (timestampInMs: number) => SavingsOverview
  balanceRefreshIntervalInMs: number | undefined
  openDepositDialog: () => void
  openSendDialog: () => void
  openWithdrawDialog: () => void
  oneYearProjection: NormalizedNumber
  sparkRewardsOneYearProjection: NormalizedNumber
  apy: Percentage
  apyExplainer: string
  apyExplainerDocsLink: string
  sparkRewardsSummary: AccountSparkRewardsSummary
  className?: string
}

export function AccountMainPanelGroup({
  underlyingToken,
  oneYearProjection,
  sparkRewardsOneYearProjection,
  apy,
  savingsToken,
  savingsTokenBalance,
  openDepositDialog,
  openSendDialog,
  openWithdrawDialog,
  calculateUnderlyingTokenBalance,
  balanceRefreshIntervalInMs,
  apyExplainer,
  apyExplainerDocsLink,
  sparkRewardsSummary,
  className,
}: AccountMainPanelGroupProps) {
  return (
    <div
      className={cn('grid grid-cols-1 gap-2 lg:grid-cols-[1fr_auto]', className)}
      data-testid={testIds.savings.account.mainPanel.container}
    >
      <Panel
        variant="secondary"
        className={cn(
          mainPanelVariants({ bg: savingsTokenToAccountType(savingsToken) }),
          'flex flex-col justify-between gap-12',
        )}
      >
        <div className="flex justify-between">
          <div className="typography-heading-5 text-primary-inverse">{underlyingToken.symbol} Savings</div>
          <MainPanelActions
            className="hidden lg:block"
            openDepositDialog={openDepositDialog}
            openSendDialog={openSendDialog}
            openWithdrawDialog={openWithdrawDialog}
          />
        </div>
        <div className="flex flex-row items-end justify-between">
          <GrowingBalance
            underlyingToken={underlyingToken}
            savingsToken={savingsToken}
            calculateUnderlyingTokenBalance={calculateUnderlyingTokenBalance}
            balanceRefreshIntervalInMs={balanceRefreshIntervalInMs}
          />
          <ViewRewardsPill sparkRewardsSummary={sparkRewardsSummary} className="hidden lg:flex" />
        </div>

        <div className="flex flex-col gap-2 lg:hidden">
          <ViewRewardsPill sparkRewardsSummary={sparkRewardsSummary} className="lg:hidden" />
          <MainPanelActions
            openDepositDialog={openDepositDialog}
            openSendDialog={openSendDialog}
            openWithdrawDialog={openWithdrawDialog}
          />
        </div>
      </Panel>
      <SidePanelGroup
        underlyingToken={underlyingToken}
        savingsToken={savingsToken}
        savingsTokenBalance={savingsTokenBalance}
        apy={apy}
        apyExplainer={apyExplainer}
        apyExplainerDocsLink={apyExplainerDocsLink}
        oneYearProjection={oneYearProjection}
        sparkRewardsOneYearProjection={sparkRewardsOneYearProjection}
        sparkRewardsSummary={sparkRewardsSummary}
        className="hidden lg:block"
      />
      <BottomPanel
        underlyingToken={underlyingToken}
        savingsToken={savingsToken}
        savingsTokenBalance={savingsTokenBalance}
        apy={apy}
        apyExplainer={apyExplainer}
        apyExplainerDocsLink={apyExplainerDocsLink}
        oneYearProjection={oneYearProjection}
        sparkRewardsOneYearProjection={sparkRewardsOneYearProjection}
        sparkRewardsSummary={sparkRewardsSummary}
        className="lg:hidden"
      />
    </div>
  )
}

interface MainPanelActionsProps {
  openDepositDialog: () => void
  openSendDialog: () => void
  openWithdrawDialog: () => void
  className?: string
}
function MainPanelActions({ openDepositDialog, openSendDialog, openWithdrawDialog, className }: MainPanelActionsProps) {
  return (
    <div className={className}>
      <div className="grid grid-cols-3 items-center gap-2.5 lg:flex">
        <Button variant="primary" onClick={openDepositDialog} className="lg:px-6">
          Deposit
        </Button>
        <Button variant="secondary" onClick={openSendDialog} className="lg:px-6">
          Send
        </Button>
        <Button variant="secondary" onClick={openWithdrawDialog} className="lg:px-6">
          Withdraw
        </Button>
      </div>
    </div>
  )
}

const mainPanelVariants = cva('bg-cover bg-right bg-no-repeat', {
  variants: {
    bg: {
      susds: 'bg-[url(/src/ui/assets/savings/accounts/usds-bg.svg)] bg-primary-inverse',
      susdc: 'bg-[url(/src/ui/assets/savings/accounts/usdc-bg.svg)] bg-primary-inverse',
      sdai: 'bg-[url(/src/ui/assets/savings/accounts/dai-bg.svg)] bg-primary-inverse',
    },
  },
})

function ViewRewardsPill({
  sparkRewardsSummary,
  className,
}: { sparkRewardsSummary: AccountSparkRewardsSummary; className?: string }) {
  if (sparkRewardsSummary.rewards.length === 0) {
    return null
  }

  return (
    <Link to={paths.sparkRewards} variant="unstyled">
      <div
        className={cn(
          'typography-label-4 flex w-fit items-center gap-1 rounded-full bg-primary/10 p-1 text-primary-inverse backdrop-blur-sm',
          className,
        )}
      >
        <img src={assets.page.sparkRewardsCircle} alt={'Spark Rewards'} className="size-6" />
        <div>View Rewards</div>
        <ChevronRightIcon className="size-4" />
      </div>
    </Link>
  )
}
