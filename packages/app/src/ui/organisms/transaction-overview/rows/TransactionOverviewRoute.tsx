import { Token } from '@/domain/types/Token'
import { HorizontalScroll } from '@/ui/atoms/horizontal-scroll/HorizontalScroll'
import { TokenAmount } from '@/ui/molecules/token-amount/TokenAmount'
import { cn } from '@/ui/utils/style'
import { testIds } from '@/ui/utils/testIds'
import { NormalizedUnitNumber } from '@sparkdotfi/common-universal'
import { MoveRightIcon } from 'lucide-react'
import { Fragment, HTMLAttributes } from 'react'

export type RouteItem =
  | {
      type: 'token-amount'
      token: Token
      amount: NormalizedUnitNumber
      usdAmount?: NormalizedUnitNumber
    }
  | {
      type: 'generic'
      upperText: string
      lowerText: string
      upperTextDataTestId?: string
      lowerTextDataTestId?: string
    }

export interface TransactionOverviewRouteProps {
  route: RouteItem[]
}

export function TransactionOverviewRoute({ route }: TransactionOverviewRouteProps) {
  return (
    <HorizontalScroll>
      <div className="flex min-h-[42px] items-center gap-2.5">
        {route.map((item, index) => (
          <Fragment key={item.type === 'token-amount' ? item.token.symbol : item.upperText}>
            {item.type === 'token-amount' ? (
              <TokenAmount
                token={item.token}
                amount={item.amount}
                usdAmount={item.usdAmount}
                amountDataTestId={testIds.dialog.transactionOverview.routeItem.tokenWithAmount(index)}
                usdAmountDataTestId={testIds.dialog.transactionOverview.routeItem.tokenUsdValue(index)}
              />
            ) : (
              <div className="flex flex-col items-end gap-1.5">
                <div className="typography-label-2 text-primary" data-testid={item.upperTextDataTestId}>
                  {item.upperText}
                </div>
                <div className="typography-body-4 text-secondary" data-testid={item.lowerTextDataTestId}>
                  {item.lowerText}
                </div>
              </div>
            )}
            {index !== route.length - 1 && <MoveRightIcon className="icon-xxs icon-secondary mt-[3px] flex-shrink-0" />}
          </Fragment>
        ))}
      </div>
    </HorizontalScroll>
  )
}

export function TransactionOverviewRoutePlaceholder({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      {...rest}
      className={cn('typography-label-2 flex min-h-[42px] flex-col justify-center text-primary', className)}
    />
  )
}
