import { TokenWithBalance } from '@/domain/common/types'
import { Token } from '@/domain/types/Token'
import { NormalizedUnitNumber } from '@sparkdotfi/common-universal'
import { MigrationInfo } from '../../logic/makeMigrationInfo'
import { ChartsData, InterestData, SavingsAccountSupportedStablecoin } from '../../logic/useSavings'
import { AccountMetadata, AccountSparkRewardsSummary } from '../../types'
import { AccountMainPanelGroup } from '../account-main-panel-group/AccountMainPanelGroup'
import { DaiLegacyAccountBanner } from '../dai-legacy-account-banner/DaiLegacyAccountBanner'
import { DepositCTAPanel } from '../deposit-cta-panel/DepositCTAPanel'
import { EntryAssetsPanel } from '../entry-assets-panel/EntryAssetsPanel'
import { SavingsCharts } from '../savings-charts/SavingsCharts'
import { UpgradeSavingsBanner } from '../upgrade-savings-baner/UpgradeSavingsBanner'

export interface SavingsAccountProps {
  savingsToken: Token
  savingsTokenBalance: NormalizedUnitNumber
  underlyingToken: Token
  interestData: InterestData
  supportedStablecoins: SavingsAccountSupportedStablecoin[]
  mostValuableAsset: TokenWithBalance
  showConvertDialogButton: boolean
  chartsData: ChartsData
  openDepositDialog: (tokenToDeposit: Token) => void
  openSendDialog: () => void
  openWithdrawDialog: () => void
  openConvertStablesDialog: () => void
  openSandboxModal: () => void
  openConnectModal: () => void
  guestMode: boolean
  isInSandbox: boolean
  migrationInfo?: MigrationInfo
  metadata: AccountMetadata
  sparkRewardsSummary: AccountSparkRewardsSummary
}

export function SavingsAccount({
  savingsToken,
  savingsTokenBalance,
  underlyingToken,
  interestData,
  supportedStablecoins,
  mostValuableAsset,
  showConvertDialogButton,
  chartsData,
  openDepositDialog,
  openSendDialog,
  openWithdrawDialog,
  openConvertStablesDialog,
  openSandboxModal,
  openConnectModal,
  guestMode,
  isInSandbox,
  migrationInfo,
  metadata,
  sparkRewardsSummary,
}: SavingsAccountProps) {
  const displayDepositCallToAction = guestMode || savingsTokenBalance.eq(0)
  const displayUpgradeBanner = migrationInfo !== undefined && savingsTokenBalance.gt(0)
  const displayDaiLegacyBanner = migrationInfo !== undefined && savingsTokenBalance.eq(0)
  const primaryAction = guestMode
    ? { title: 'Connect Wallet' as const, action: openConnectModal }
    : {
        title: 'Deposit' as const,
        action: () => openDepositDialog(mostValuableAsset.token),
      }

  return (
    <div className="grid grid-cols-1 gap-6">
      {displayDepositCallToAction ? (
        <DepositCTAPanel
          savingsRate={interestData.APY}
          apyExplainer={metadata.apyExplainer}
          apyExplainerDocsLink={metadata.apyExplainerDocsLink}
          entryTokens={supportedStablecoins.map((asset) => asset.token)}
          savingsToken={savingsToken}
          isInSandbox={isInSandbox}
          description={{
            text: metadata.description,
            docsLink: metadata.descriptionDocsLink,
          }}
          actions={{
            primary: primaryAction,
            secondary: { title: 'Try in Sandbox', action: openSandboxModal },
          }}
          sparkRewardsSummary={sparkRewardsSummary}
          className="min-h-[320px]"
        />
      ) : (
        <AccountMainPanelGroup
          underlyingToken={underlyingToken}
          savingsToken={savingsToken}
          savingsTokenBalance={savingsTokenBalance}
          calculateUnderlyingTokenBalance={interestData.calculateUnderlyingTokenBalance}
          balanceRefreshIntervalInMs={interestData.balanceRefreshIntervalInMs}
          openDepositDialog={() => openDepositDialog(mostValuableAsset.token)}
          openSendDialog={openSendDialog}
          openWithdrawDialog={openWithdrawDialog}
          oneYearProjection={interestData.oneYearProjection}
          sparkRewardsOneYearProjection={interestData.sparkRewardsOneYearProjection}
          apy={interestData.APY}
          apyExplainer={metadata.apyExplainer}
          apyExplainerDocsLink={metadata.apyExplainerDocsLink}
          sparkRewardsSummary={sparkRewardsSummary}
          className="min-h-[320px]"
        />
      )}
      {displayDaiLegacyBanner && <DaiLegacyAccountBanner apyImprovement={migrationInfo.apyImprovement} />}
      {displayUpgradeBanner && (
        <UpgradeSavingsBanner
          onUpgradeSavingsClick={migrationInfo.openSDaiToSUsdsUpgradeDialog}
          apyImprovement={migrationInfo.apyImprovement}
        />
      )}
      {chartsData.chartsSupported && <SavingsCharts savingsToken={savingsToken} {...chartsData} />}
      <EntryAssetsPanel
        assets={supportedStablecoins}
        openDepositDialog={openDepositDialog}
        openConvertStablesDialog={openConvertStablesDialog}
        showConvertDialogButton={showConvertDialogButton}
        guestMode={guestMode}
      />
    </div>
  )
}
