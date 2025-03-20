import { formatPercentage } from '@/domain/common/format'
import { TokenSymbol } from '@/domain/types/TokenSymbol'
import { getTokenImage } from '@/ui/assets'
import { Button } from '@/ui/atoms/button/Button'
import { Link } from '@/ui/atoms/link/Link'
import { Panel } from '@/ui/atoms/panel/Panel'
import { links } from '@/ui/constants/links'
import { cn } from '@/ui/utils/style'
import { NormalizedUnitNumber, Percentage } from '@marsfoundation/common-universal'
import { VariantProps, cva } from 'class-variance-authority'
import { ExternalLinkIcon } from 'lucide-react'

type StakeSparkActionProps =
  | {
      type: 'connected'
      spkBalance: NormalizedUnitNumber
      stake: () => void
    }
  | {
      type: 'disconnected'
      connectWallet: () => void
      tryInSandbox: () => void
    }

export type StakeSparkCTAPanelProps = {
  apy: Percentage
  className?: string
} & StakeSparkActionProps

export function StakeSparkCTAPanel({ apy, className, ...actionsProps }: StakeSparkCTAPanelProps) {
  return (
    <Panel
      spacing="m"
      className={cn(
        'flex flex-col justify-between gap-4',
        'bg-cover bg-right bg-no-repeat',
        'bg-[url(/src/ui/assets/spark-staking/stake-cta-panel-bg.svg)] bg-primary-inverse',
        className,
      )}
    >
      <div className="flex flex-col gap-4">
        <div className="typography-heading-3 sm:typography-heading-2 text-primary-inverse">
          Stake <TokenBadge variant="spk" />
          <br />
          Earn rewards in <TokenBadge variant="usds" />
        </div>
        <div className="typography-body-3 max-w-[48ch] text-tertiary">
          Deposit Spark Token listed below and start staking SPK to earn USDS rewards. Withdrawal delay up to 2 weeks.{' '}
          {/* @todo: spark staking - replace with proper docs link */}
          <Link to={links.docs.sparkStaking} className="inline-flex items-center gap-1" external>
            Learn more <ExternalLinkIcon className="icon-xxs text-farms-600" />
          </Link>
        </div>
      </div>
      <div className="typography-body-3 text-tertiary sm:mt-12">
        APY:{' '}
        <span className="typography-heading-2 text-primary-inverse">{formatPercentage(apy, { skipSign: true })}</span>
        <span className="typography-heading-2 bg-gradient-spark-primary-2 bg-clip-text text-transparent">%</span>
      </div>
      <Actions {...actionsProps} />
    </Panel>
  )
}

const tokenBadgeVariants = cva(
  'inline-flex h-7 items-center gap-1.5 rounded-full p-2 pr-2.5 sm:h-12 sm:gap-2 sm:pr-3',
  {
    variants: {
      variant: {
        spk: 'bg-[linear-gradient(104.99deg,rgba(255,197,85,0.15)_-21.89%,rgba(251,74,185,0.15)_87.44%)]',
        usds: 'bg-[radial-gradient(160.27%_160.27%_at_50.08%_115.91%,rgba(255,210,50,0.15)_0%,rgba(255,109,109,0.15)_100%)]',
      },
    },
  },
)

const tokenBadgeTextVariants = cva('typography-heading-5 sm:typography-heading-3 bg-clip-text text-transparent', {
  variants: {
    variant: {
      spk: 'bg-gradient-spark-primary-2',
      usds: 'bg-[radial-gradient(160.27%_160.27%_at_50.08%_115.91%,#FFD232_0%,#FF6D6D_100%)]',
    },
  },
})

export interface TokenBadgeProps extends VariantProps<typeof tokenBadgeVariants> {}

function TokenBadge({ variant }: TokenBadgeProps) {
  return (
    <div className={tokenBadgeVariants({ variant })}>
      <img
        src={getTokenImage(variant === 'spk' ? TokenSymbol('SPK') : TokenSymbol('USDS'))}
        className="size-4 rounded-full sm:size-8"
      />
      <span className={tokenBadgeTextVariants({ variant })}>{variant === 'spk' ? 'SPK' : 'USDS'}</span>
    </div>
  )
}

function Actions(props: StakeSparkActionProps) {
  if (props.type === 'connected') {
    return (
      <Button variant="primary" size="l" className="w-full" onClick={props.stake} disabled={props.spkBalance.isZero()}>
        Stake
      </Button>
    )
  }

  if (props.type === 'disconnected') {
    return (
      <div className="grid grid-cols-2 gap-4">
        <Button variant="primary" size="l" onClick={props.connectWallet}>
          Connect Wallet
        </Button>
        <Button variant="secondary" size="l" onClick={props.tryInSandbox}>
          Try in Sandbox
        </Button>
      </div>
    )
  }
}
