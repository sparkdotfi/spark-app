import { Token } from '@/domain/types/Token'
import { assets as uiAssets } from '@/ui/assets'
import { Button } from '@/ui/atoms/button/Button'
import { LinkButton } from '@/ui/atoms/link-button/LinkButton'
import { Panel } from '@/ui/atoms/panel/Panel'
import { DataTable, DataTableColumnDefinitions } from '@/ui/molecules/data-table/DataTable'
import { TokenCell } from '@/ui/molecules/data-table/components/TokenCell'
import { ViewContractMoreDropdown } from '@/ui/molecules/view-contract-more-dropdown/ViewContractMoreDropdown'
import { NormalizedUnitNumber } from '@sparkdotfi/common-universal'
import { useMemo } from 'react'

export interface AvailableToStakeRow {
  token: Token
  balance: NormalizedUnitNumber
  blockExplorerLink: string
  openStakeDialog: () => void
}

export function AvailableToStakePanel({ token, balance, blockExplorerLink, openStakeDialog }: AvailableToStakeRow) {
  const rows: AvailableToStakeRow[] = [{ token, balance, blockExplorerLink, openStakeDialog }]

  const columnDef: DataTableColumnDefinitions<AvailableToStakeRow> = useMemo(
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
        renderCell: ({ balance, blockExplorerLink, openStakeDialog }) => {
          return (
            <div className="flex justify-end gap-1 sm:gap-3">
              <Button variant="secondary" size="s" disabled={balance.eq(0)} onClick={openStakeDialog}>
                Stake
              </Button>
              <ViewContractMoreDropdown blockExplorerLink={blockExplorerLink} />
            </div>
          )
        },
      },
    }),
    [],
  )

  return (
    <Panel spacing="none">
      <div className="flex flex-col gap-6 p-4 pb-0 md:px-8 md:py-6 md:pb-0">
        <h3 className="typography-heading-4 text-primary">Available to stake</h3>
        <DataTable
          gridTemplateColumnsClassName="grid-cols-[repeat(2,_1fr)_120px] sm:grid-cols-[repeat(2,_1fr)_140px]"
          data={rows}
          columnDef={columnDef}
        />
      </div>
      <div className="w-full gap-6 border-primary border-t p-4 md:px-8 md:py-6">
        <div className="grid grid-cols-[1fr_auto] items-center gap-3">
          <div className="flex items-center gap-3">
            <img src={uiAssets.cowSwap} className="h-8 w-8 rounded-full" />
            <div className="flex flex-col">
              <div className="typography-label-3 text-primary">Use CoW Swap to get {token.symbol} Tokens!</div>
              <div className="typography-body-4 text-secondary">Easily swap your other tokens for {token.name}.</div>
            </div>
          </div>
          <LinkButton to="https://swap.cow.fi/" size="s" variant="tertiary" external>
            Swap
            <img src={uiAssets.boxArrowTopRight} className="h-4 w-4" />
          </LinkButton>
        </div>
      </div>
    </Panel>
  )
}
