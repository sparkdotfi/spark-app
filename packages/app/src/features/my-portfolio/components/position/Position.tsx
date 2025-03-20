import { USD_MOCK_TOKEN } from '@/domain/types/Token'
import { getTokenColor } from '@/ui/assets'
import { Panel } from '@/ui/atoms/panel/Panel'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/ui/atoms/tooltip/Tooltip'
import { Info } from '@/ui/molecules/info/Info'
import { getRandomColor } from '@/ui/utils/get-random-color'
import { cn } from '@/ui/utils/style'
import { testIds } from '@/ui/utils/testIds'
import { NormalizedUnitNumber } from '@marsfoundation/common-universal'
import { getPositionFormattedValue, getTicks } from '../../logic/position'
import { PositionSummary } from '../../logic/types'

export interface PositionProps {
  positionSummary?: PositionSummary
  numLabels?: number
  ticksPerLabel?: number
  xAxisFallbackMax?: NormalizedUnitNumber
  className?: string
}

export function Position({
  positionSummary,
  numLabels = 5,
  ticksPerLabel = 2,
  xAxisFallbackMax = NormalizedUnitNumber(90_000),
  className,
}: PositionProps) {
  const ticks = getTicks({
    numLabels,
    ticksPerLabel,
    totalCollateralUSD: positionSummary?.totalCollateralUSD,
    xAxisFallbackMax,
  })

  return (
    <Panel className={cn('flex flex-col gap-6', className)}>
      <div className="flex items-center gap-1">
        <h3 className="typography-heading-4 text-primary">Your position</h3>
        <Info>Amount of all your assets supplied to the protocol.</Info>
      </div>

      <div className="mt-auto flex flex-col gap-6">
        <Deposited positionSummary={positionSummary} ticks={ticks} />
        <Borrow positionSummary={positionSummary} ticks={ticks} />
      </div>
    </Panel>
  )
}

interface TicksProps {
  ticks: {
    x: number
    label?: string
  }[]
}
function Ticks({ ticks }: TicksProps) {
  return (
    <div className="relative h-8">
      {ticks.map(({ label, x }) => (
        <div className="-translate-x-[50%] absolute flex flex-col items-center" style={{ left: `${x}%` }} key={x}>
          <div className="h-2 w-[1px] bg-neutral-600" />
          {label && <div className="typography-body-4 text-secondary">{label}</div>}
        </div>
      ))}
    </div>
  )
}

interface DepositedProps {
  positionSummary?: PositionSummary
  ticks: TicksProps['ticks']
}

function Deposited({ positionSummary, ticks }: DepositedProps) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex flex-row justify-between">
        <div className="typography-label-2 text-primary">Collateral deposited</div>
        <div className="typography-label-2 text-primary" data-testid={testIds.myPortfolio.deposited}>
          {getPositionFormattedValue(positionSummary?.totalCollateralUSD)}
        </div>
      </div>
      <CollateralBar positionSummary={positionSummary} />
      <Ticks ticks={ticks} />
    </div>
  )
}

interface CollateralBarProps {
  positionSummary?: PositionSummary
}

function CollateralBar({ positionSummary }: CollateralBarProps) {
  if (!positionSummary?.hasCollaterals) {
    return <EmptyBar />
  }

  const collateralWithPercentages = positionSummary.collaterals.map((c) => ({
    ...c,
    x: c.token.toUSD(c.value).dividedBy(positionSummary.totalCollateralUSD).multipliedBy(100),
  }))

  return (
    <div className="relative flex h-7 flex-row">
      {collateralWithPercentages.map((c, i) => (
        <Tooltip key={c.token.symbol}>
          <TooltipTrigger asChild>
            <div
              className="rounded-sm"
              style={{
                width: i === 0 ? `${c.x}%` : `calc(${c.x}% + 1rem)`,
                marginLeft: i === 0 ? 0 : '-1rem',
                backgroundColor: getTokenColor(positionSummary.collaterals[i]!.token.symbol, {
                  fallback: getRandomColor(),
                }),
                zIndex: collateralWithPercentages.length - i,
              }}
            />
          </TooltipTrigger>
          <TooltipContent>
            You have deposited {USD_MOCK_TOKEN.formatUSD(c.token.toUSD(c.value))} worth of {c.token.symbol}.
          </TooltipContent>
        </Tooltip>
      ))}
    </div>
  )
}

interface BorrowProps {
  positionSummary?: PositionSummary
  ticks: TicksProps['ticks']
}

function Borrow({ positionSummary, ticks }: BorrowProps) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex flex-row justify-between">
        <div className="typography-label-2 text-primary">Borrow</div>
        <div className="typography-label-2 text-primary" data-testid={testIds.myPortfolio.borrowed}>
          {getPositionFormattedValue(positionSummary?.borrow.current)}
        </div>
      </div>
      <BorrowBar positionSummary={positionSummary} />
      <Ticks ticks={ticks} />
    </div>
  )
}

interface BorrowBarProps {
  positionSummary?: PositionSummary
}

function BorrowBar({ positionSummary }: BorrowBarProps) {
  if (!positionSummary?.hasCollaterals || positionSummary.borrow.max.eq(0)) {
    return <EmptyBar />
  }
  const { borrow } = positionSummary

  return (
    <div className="relative flex h-7 flex-row">
      {borrow.percents.borrowed !== 0 && (
        <Tooltip>
          <TooltipTrigger asChild>
            <div
              className="z-[1] rounded-sm bg-gradient-spark-primary-1"
              style={{
                width: `${borrow.percents.borrowed}%`,
              }}
            />
          </TooltipTrigger>
          <TooltipContent>You have borrowed {USD_MOCK_TOKEN.formatUSD(positionSummary.borrow.current)}.</TooltipContent>
        </Tooltip>
      )}
      {borrow.percents.rest !== 0 && (
        <div
          className="rounded-sm border bg-neutral-50"
          style={{
            width: borrow.percents.rest === 100 ? '100%' : `calc(${borrow.percents.rest}% + 1rem)`,
            marginLeft: borrow.percents.rest === 100 ? '0' : '-1rem',
          }}
        />
      )}
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className="-translate-x-[1px] absolute z-[2] h-7 border-primary border-l-2 pl-2"
            style={{ left: `${borrow.percents.max}%` }}
          >
            <div className="typography-label-4 flex min-h-full flex-col justify-center text-neutral-600">max</div>
          </div>
        </TooltipTrigger>
        <TooltipContent>You can borrow up to {USD_MOCK_TOKEN.formatUSD(positionSummary.borrow.max)}.</TooltipContent>
      </Tooltip>
    </div>
  )
}

function EmptyBar() {
  return (
    <div className="relative flex h-7 flex-row">
      <div className="w-full rounded-lg border bg-secondary" />
    </div>
  )
}
