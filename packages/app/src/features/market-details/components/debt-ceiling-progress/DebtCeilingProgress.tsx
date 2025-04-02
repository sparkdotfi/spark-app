import { USD_MOCK_TOKEN } from '@/domain/types/Token'
import { Progress } from '@/features/market-details/components/debt-ceiling-progress/Progress'
import { Link } from '@/ui/atoms/link/Link'
import { links } from '@/ui/constants/links'
import { Info } from '@/ui/molecules/info/Info'
import { cn } from '@/ui/utils/style'
import { testIds } from '@/ui/utils/testIds'
import { NormalizedUnitNumber } from '@sparkdotfi/common-universal'

interface DebtCeilingProgressProps {
  debt: NormalizedUnitNumber
  debtCeiling: NormalizedUnitNumber
  className?: string
}

export function DebtCeilingProgress({ debt, debtCeiling }: DebtCeilingProgressProps) {
  const value = debt.div(debtCeiling).times(100).toNumber()

  const hasCeilingBeenReached = value === 100

  return (
    <div className="col-span-3 mt-6 flex flex-col gap-4 rounded-sm border border-primary p-4 sm:col-span-2 sm:col-start-2 sm:mt-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 text-secondary">
          <p className="typography-label-4">Isolated Debt Ceiling</p>
          <Info className="text-inherit">
            Debt ceiling limits the amount possible to borrow against this asset by protocol users. Debt ceiling is
            specific to assets in isolation mode and is denoted in USD.{' '}
            <Link to={links.docs.isolationModeBorrowingPower} external>
              Learn more
            </Link>
          </Info>
        </div>
        <p className="typography-label-4">
          <span
            className={cn('text-primary', hasCeilingBeenReached && 'text-system-error-primary')}
            data-testid={testIds.marketDetails.collateralStatusPanel.debt}
          >
            {USD_MOCK_TOKEN.formatUSD(debt, { compact: true })}
          </span>
          <span className="text-secondary">
            {' '}
            of{' '}
            <span data-testid={testIds.marketDetails.collateralStatusPanel.debtCeiling}>
              {USD_MOCK_TOKEN.formatUSD(debtCeiling, { compact: true })}
            </span>
          </span>
        </p>
      </div>
      <Progress value={value} variant={hasCeilingBeenReached ? 'finished' : 'in-progress'} />
    </div>
  )
}
