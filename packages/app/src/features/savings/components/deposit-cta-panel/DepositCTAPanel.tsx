import { Token } from '@/domain/types/Token'
import { Panel } from '@/ui/atoms/panel/Panel'
import { cn } from '@/ui/utils/style'
import { testIds } from '@/ui/utils/testIds'
import { Percentage } from '@sparkdotfi/common-universal'
import { cva } from 'class-variance-authority'
import { AccountSparkRewardsSummary } from '../../types'
import { savingsTokenToAccountType } from '../common/utils'
import { Actions } from './components/Actions'
import { Details } from './components/Details'
import { Header } from './components/Header'

export interface DepositCTAPanelProps {
  savingsRate: Percentage
  entryTokens: Token[]
  savingsToken: Token
  description: {
    text: string
    docsLink: string
  }
  apyExplainer: string
  apyExplainerDocsLink: string
  actions: {
    primary: {
      title: 'Connect Wallet' | 'Deposit'
      action: () => void
    }
    secondary: {
      title: 'Try in Sandbox'
      action: () => void
    }
  }
  isInSandbox: boolean
  sparkRewardsSummary: AccountSparkRewardsSummary
  className?: string
}

export function DepositCTAPanel({
  savingsRate,
  entryTokens,
  savingsToken,
  description,
  apyExplainer,
  apyExplainerDocsLink,
  actions,
  isInSandbox,
  sparkRewardsSummary,
  className,
}: DepositCTAPanelProps) {
  return (
    <Panel
      spacing="m"
      className={cn(
        'flex flex-col justify-between gap-4',
        panelBgVariants({ bg: savingsTokenToAccountType(savingsToken) }),
        className,
      )}
      data-testid={testIds.savings.account.depositCTA.panel}
    >
      <Header
        savingsRate={savingsRate}
        savingsToken={savingsToken}
        inputTokens={entryTokens}
        apyExplainer={apyExplainer}
        apyExplainerDocsLink={apyExplainerDocsLink}
        sparkRewardsSummary={sparkRewardsSummary}
      />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[3fr_2fr]">
        <Details
          entryTokens={entryTokens}
          savingsToken={savingsToken}
          description={description}
          sparkRewardsSummary={sparkRewardsSummary}
        />
        <Actions actions={actions} isInSandbox={isInSandbox} className="mt-auto" />
      </div>
    </Panel>
  )
}

const panelBgVariants = cva('bg-cover bg-right bg-no-repeat', {
  variants: {
    bg: {
      susds: 'bg-[url(/src/ui/assets/savings/accounts/usds-bg.svg)] bg-primary-inverse',
      susdc: 'bg-[url(/src/ui/assets/savings/accounts/usdc-bg.svg)] bg-primary-inverse',
      sdai: 'bg-[url(/src/ui/assets/savings/accounts/dai-bg.svg)] bg-primary-inverse',
    },
  },
})
