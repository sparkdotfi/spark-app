import { Token } from '@/domain/types/Token'
import { Button } from '@/ui/atoms/button/Button'
import { Panel } from '@/ui/atoms/panel/Panel'
import { AmountCell } from '@/ui/molecules/data-table/components/AmountCell'
import { TokenCell } from '@/ui/molecules/data-table/components/TokenCell'
import { ResponsiveDataTable } from '@/ui/organisms/responsive-data-table/ResponsiveDataTable'
import { NormalizedUnitNumber } from '@marsfoundation/common-universal'
import { TimeLeftCell } from './TimeLeftCell'

export interface WithdrawalsTableRow {
  token: Token
  amount: NormalizedUnitNumber
  timeToClaim: number // can't be UnixTime because it's a bigint
  claimableAt: Date
  action: () => void
  actionName: string
  isActionEnabled: boolean
}

export interface WithdrawalsTablePanelProps {
  rows: WithdrawalsTableRow[]
}

export function WithdrawalsTablePanel({ rows }: WithdrawalsTablePanelProps) {
  return (
    <Panel spacing="m" className="flex flex-col gap-6">
      <h3 className="typography-heading-5 flex items-baseline gap-1">Unstakes</h3>
      <ResponsiveDataTable
        gridTemplateColumnsClassName="grid-cols-[1fr_minmax(auto,140px)_minmax(auto,140px)_140px]"
        data={rows}
        columnDefinition={{
          token: {
            header: 'Token',
            renderCell: ({ token }) => <TokenCell token={token} />,
          },
          timeLeft: {
            header: 'Time left',
            headerAlign: 'right',
            renderCell: ({ timeToClaim, claimableAt }, mobileViewOptions) => (
              <TimeLeftCell timeLeft={timeToClaim} targetDate={claimableAt} mobileViewOptions={mobileViewOptions} />
            ),
          },
          amount: {
            header: 'Amount',
            headerAlign: 'right',
            renderCell: ({ amount, token }, mobileViewOptions) => (
              <AmountCell
                token={token}
                amount={amount}
                mobileViewOptions={mobileViewOptions}
                formattingOptions={{
                  zeroAmountHandling: 'show-zero',
                  showUsdValue: token.unitPriceUsd.isGreaterThan(0),
                }}
              />
            ),
          },
          actions: {
            header: '',
            renderCell: ({ action, actionName, isActionEnabled }) => {
              return (
                <div className="flex justify-end sm:pl-10">
                  <Button variant="secondary" size="s" disabled={!isActionEnabled} onClick={action} className="w-full">
                    {actionName}
                  </Button>
                </div>
              )
            },
          },
        }}
      />
    </Panel>
  )
}
