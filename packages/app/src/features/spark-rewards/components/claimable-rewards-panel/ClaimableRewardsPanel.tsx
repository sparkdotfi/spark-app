import { TokenSymbol } from '@/domain/types/TokenSymbol'
import { getTokenImage } from '@/ui/assets'
import { Button } from '@/ui/atoms/button/Button'
import { Panel } from '@/ui/atoms/panel/Panel'
import { Skeleton } from '@/ui/atoms/skeleton/Skeleton'
import { AmountCell } from '@/ui/molecules/data-table/components/AmountCell'
import { TokenCell } from '@/ui/molecules/data-table/components/TokenCell'
import { IconStack } from '@/ui/molecules/icon-stack/IconStack'
import { Info } from '@/ui/molecules/info/Info'
import { ResponsiveDataTable } from '@/ui/organisms/responsive-data-table/ResponsiveDataTable'
import { testIds } from '@/ui/utils/testIds'
import { AlertTriangleIcon } from 'lucide-react'
import { UseClaimableRewardsResult } from '../../logic/useClaimableRewards'

export interface ClaimableRewardsPanelProps {
  claimableRewardsResult: UseClaimableRewardsResult
}

export function ClaimableRewardsPanel({ claimableRewardsResult }: ClaimableRewardsPanelProps) {
  if (claimableRewardsResult.isPending) {
    return <PendingPanel />
  }

  if (claimableRewardsResult.isError) {
    return <ErrorPanel />
  }

  if (claimableRewardsResult.data.length === 0) {
    return <NoRewards />
  }

  return (
    <Panel spacing="m" className="flex flex-col gap-6">
      <Header />
      <ResponsiveDataTable
        gridTemplateColumnsClassName="grid-cols-[3fr_2fr_2fr_140px]"
        data={claimableRewardsResult.data}
        columnDefinition={{
          token: {
            header: 'Reward',
            renderCell: ({ token, chainId }) => <TokenCell token={token} chainId={chainId} iconBorder="white" />,
          },
          amountPending: {
            header: 'Pending',
            headerAlign: 'right',
            renderCell: ({ amountPending, token }, mobileViewOptions) => (
              <AmountCell
                token={token}
                amount={amountPending}
                mobileViewOptions={mobileViewOptions}
                formattingOptions={{
                  zeroAmountHandling: 'show-zero',
                  showUsdValue: token.unitPriceUsd.gt(0),
                }}
              />
            ),
          },
          amountToClaim: {
            header: 'Available to claim',
            headerAlign: 'right',
            renderCell: ({ amountToClaim, token }, mobileViewOptions) => (
              <AmountCell
                token={token}
                amount={amountToClaim}
                mobileViewOptions={mobileViewOptions}
                data-testid={testIds.sparkRewards.claimableRewardsPanel.amountToClaim}
                formattingOptions={{
                  zeroAmountHandling: 'show-zero',
                  showUsdValue: token.unitPriceUsd.gt(0),
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

function Header() {
  return (
    <h3 className="typography-heading-5 flex items-baseline gap-1">
      Claimable rewards
      <Info>
        Claimable Rewards show rewards you can claim. While rewards accrue in real time, they are distributed
        periodically. Check back regularly to claim what's available.
      </Info>
    </h3>
  )
}

export function PendingPanel() {
  return (
    <Panel spacing="m" className="flex min-h-60 flex-col gap-9 sm:min-h-72">
      <Skeleton className="h-6 w-28" />
      <div className="flex flex-col gap-5">
        <Skeleton className="h-4 w-44" />
        <div className="flex flex-col gap-7">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
    </Panel>
  )
}

function ErrorPanel() {
  return (
    <Panel spacing="m" className="flex min-h-60 flex-col sm:min-h-72">
      <div className="my-auto flex items-center justify-center">
        <div className="typography-label-3 flex items-center gap-2 rounded-full bg-secondary px-3 py-1 text-secondary/80">
          <AlertTriangleIcon className="icon-xs" /> Failed to load rewards data
        </div>
      </div>
    </Panel>
  )
}

function NoRewards() {
  const rewards = [TokenSymbol('wstETH'), TokenSymbol('USDS'), TokenSymbol('SPK')].map(getTokenImage)
  return (
    <Panel spacing="m" className="flex min-h-60 flex-col gap-9 sm:min-h-72">
      <div className="my-auto flex flex-col items-center gap-5">
        <IconStack size="lg" items={rewards} iconBorder="white" />
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="typography-heading-5 text-primary">You don't have any rewards yet</div>
          <div className="typography-body-3 max-w-[32ch] text-secondary">
            Explore our ongoing campaigns and begin your journey to earning rewards today!
          </div>
        </div>
      </div>
    </Panel>
  )
}
