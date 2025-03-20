import { valueToBigNumber } from '@aave/math-utils'
import * as SliderPrimitive from '@radix-ui/react-slider'

import { formatPercentage } from '@/domain/common/format'
import { MODERATE_HEALTH_FACTOR_THRESHOLD, RISKY_HEALTH_FACTOR_THRESHOLD, RiskLevel } from '@/domain/common/risk'
import { healthFactorToLtv } from '@/domain/market-info/math'
import { assets } from '@/ui/assets'
import { cn } from '@/ui/utils/style'
import { Percentage } from '@marsfoundation/common-universal'

export interface LoanToValueSliderProps {
  ltv: Percentage
  maxAvailableLtv: Percentage
  liquidationLtv: Percentage
  onLtvChange: (value: Percentage) => void
  disabled?: boolean
  className?: string
}

export function LoanToValueSlider({
  maxAvailableLtv,
  liquidationLtv,
  disabled,
  ltv,
  className,
  onLtvChange,
}: LoanToValueSliderProps) {
  const steps = getSliderSteps(liquidationLtv)
  const value = ltv.toNumber() * maxSliderValue
  const maxSelectableValue = maxAvailableLtv.toNumber() * maxSliderValue
  const liquidationValue = liquidationLtv.toNumber() * 100
  const currentRiskLevel = getRiskLevel(steps, ltv)

  // eslint-disable-next-line func-style
  const onValueChange = (values: number[]) => {
    const value = Math.min(values[0] ?? 0, maxSelectableValue)

    const newLTV = valueToBigNumber(value).dividedBy(maxSliderValue)

    onLtvChange(Percentage(newLTV))
  }

  return (
    <div className={cn('px-2.5', className)}>
      <SliderPrimitive.Root
        disabled={disabled}
        className="relative my-8 flex w-full touch-none select-none items-center"
        max={maxSliderValue}
        value={[value]}
        onValueChange={onValueChange}
      >
        <SliderPrimitive.Track
          className="relative grid h-5 w-full gap-0.5"
          style={{
            gridTemplateColumns: getSliderStepsGridTemplateColumns(steps),
          }}
        >
          {steps.map((step, index, arr) => {
            const isActive = step.level === currentRiskLevel
            const isFirst = index === 0
            const isLast = index === arr.length - 1

            return (
              <div
                key={step.label}
                className={cn(
                  'flex h-full items-center justify-center bg-tertiary transition-colors duration-300',
                  isFirst && '-ml-2.5 rounded-s-full',
                  isLast && '-ml-0.5 -mr-1 rounded-e-full',
                )}
              >
                <div className={cn('-bottom-6 typography-label-4 absolute text-secondary', isActive && 'text-primary')}>
                  {step.label}
                </div>
              </div>
            )
          })}

          <div
            className="absolute top-0.5 bottom-0.5 w-0.5 bg-gradient-spark-primary-1"
            style={{
              left: `${(maxSelectableValue / maxSliderValue) * 100}%`,
            }}
          />

          <div
            className="absolute flex h-full w-0.5 justify-center"
            style={{
              left: `${liquidationValue}%`,
            }}
          >
            <div
              className="absolute top-0.5 bottom-0.5 w-0.5 bg-gradient-ltv-red"
              style={{
                left: `${(maxSelectableValue / maxSliderValue) * 100}%`,
              }}
            />
            <div className="typography-label-4 absolute bottom-7 bg-gradient-spark-primary-1 bg-clip-text text-transparent">
              {formatPercentage(liquidationLtv)}
            </div>
          </div>

          <SliderPrimitive.Range
            className={cn(
              '-mr-2.5 -ml-2.5 absolute h-full rounded-full',
              currentRiskLevel === 'healthy' && 'bg-gradient-ltv-green',
              currentRiskLevel === 'moderate' && 'bg-gradient-ltv-orange',
              currentRiskLevel === 'risky' && 'bg-gradient-ltv-red',
            )}
          />
        </SliderPrimitive.Track>

        <SliderPrimitive.Thumb className="transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50">
          <div
            className={cn(
              'flex transform items-center justify-center rounded-full bg-primary p-0.5 transition-transform',
              !disabled && 'hover:scale-125',
            )}
          >
            <img className="h-3 w-3" src={assets.sliderThumb} />
          </div>
        </SliderPrimitive.Thumb>
      </SliderPrimitive.Root>
    </div>
  )
}

const maxSliderValue = 10000

interface Step {
  label: string
  level: RiskLevel
  width: number
  from: number
}

function getSliderSteps(liquidationThreshold: Percentage): Step[] {
  const conservative: Step = {
    from: 0,
    width: healthFactorToLtv(MODERATE_HEALTH_FACTOR_THRESHOLD, liquidationThreshold).toNumber() * 100,
    level: 'healthy',
    label: 'Conservative',
  }

  const moderate: Step = {
    from: conservative.width,
    width: healthFactorToLtv(RISKY_HEALTH_FACTOR_THRESHOLD, liquidationThreshold).toNumber() * 100 - conservative.width,
    level: 'moderate',
    label: 'Moderate',
  }

  const aggressive: Step = {
    from: conservative.width + moderate.width,
    width: liquidationThreshold.toNumber() * 100 - conservative.width - moderate.width,
    level: 'risky',
    label: 'Aggressive',
  }

  const liquidation: Step = {
    from: conservative.width + moderate.width + aggressive.width,
    width: 100 - conservative.width - moderate.width - aggressive.width,
    level: 'liquidation',
    label: 'Liquidation',
  }

  return [conservative, moderate, aggressive, liquidation]
}

function getSliderStepsGridTemplateColumns(steps: Step[]): string {
  return steps.map((step) => `${step.width.toFixed(2)}%`).join(' ')
}

function getRiskLevel(steps: Step[], ltv: Percentage): RiskLevel {
  return (
    steps.find((step) => ltv.toNumber() * 100 >= step.from && ltv.toNumber() * 100 < step.from + step.width)?.level ??
    'unknown'
  )
}
