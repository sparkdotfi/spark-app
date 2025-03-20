import { Token } from '@/domain/types/Token'
import { assets as uiAssets } from '@/ui/assets'
import { Button } from '@/ui/atoms/button/Button'
import { Panel } from '@/ui/atoms/panel/Panel'
import { DataTable, DataTableColumnDefinitions } from '@/ui/molecules/data-table/DataTable'
import { TokenCell } from '@/ui/molecules/data-table/components/TokenCell'
import { ViewContractMoreDropdown } from '@/ui/molecules/view-contract-more-dropdown/ViewContractMoreDropdown'
import { cn } from '@/ui/utils/style'
import { testIds } from '@/ui/utils/testIds'
import { useMemo } from 'react'
import { SavingsAccountSupportedStablecoin } from '../../logic/useSavings'

export interface EntryAssetsPanelProps {
  assets: SavingsAccountSupportedStablecoin[]
  openDepositDialog: (tokenToDeposit: Token) => void
  openConvertStablesDialog: () => void
  showConvertDialogButton: boolean
  guestMode: boolean
}

export function EntryAssetsPanel({
  assets,
  openDepositDialog,
  openConvertStablesDialog,
  showConvertDialogButton,
  guestMode,
}: EntryAssetsPanelProps) {
  const columnDef: DataTableColumnDefinitions<SavingsAccountSupportedStablecoin> = useMemo(
    () => ({
      token: {
        header: 'Token',
        renderCell: ({ token }) => <TokenCell token={token} />,
      },
      balance: {
        header: 'Balance',
        headerAlign: 'right',
        renderCell: ({ balance, token }) => (
          <div className="typography-label-2 flex w-full flex-row justify-end">
            {balance.eq(0) ? '-' : token.format(balance, { style: 'auto' })}
          </div>
        ),
      },
      actions: {
        header: '',
        renderCell: ({ token, balance, blockExplorerLink }) => {
          return (
            <div className="flex justify-end gap-1 sm:gap-3">
              <Button variant="secondary" size="s" disabled={balance.eq(0)} onClick={() => openDepositDialog(token)}>
                Deposit
              </Button>
              <ViewContractMoreDropdown blockExplorerLink={blockExplorerLink} />
            </div>
          )
        },
      },
    }),
    [openDepositDialog],
  )

  return (
    <Panel spacing="none">
      <div className={cn('flex flex-col gap-6 p-4 md:px-8 md:py-6', showConvertDialogButton && 'pb-0 md:pb-0')}>
        <h3 className="typography-heading-4 text-primary">Supported stablecoins</h3>
        <DataTable
          gridTemplateColumnsClassName="grid-cols-[repeat(2,_1fr)_120px] sm:grid-cols-[repeat(2,_1fr)_140px]"
          data={assets}
          columnDef={columnDef}
        />
      </div>
      {showConvertDialogButton && (
        <div
          className="w-full gap-6 border-primary border-t p-4 md:px-8 md:py-6"
          data-testid={testIds.component.ConvertStablesPanel}
        >
          <div className="grid grid-cols-[1fr_auto] items-center gap-3">
            <div className="flex items-center gap-3">
              <img src={uiAssets.token.sky} className="h-8 w-8 rounded-full border-2 border-[#DBCAF4]" />
              <div className="flex flex-col">
                <div className="typography-label-3 text-primary">Convert stablecoins without fees and slippage!</div>
                <div className="typography-body-4 text-secondary">
                  Use SKY infrastructure to convert between supported stablecoins.
                </div>
              </div>
            </div>
            <Button
              size="s"
              variant="secondary"
              onClick={openConvertStablesDialog}
              data-testid={testIds.component.ConvertStablesButton}
              disabled={guestMode}
            >
              Convert
            </Button>
          </div>
        </div>
      )}
    </Panel>
  )
}
