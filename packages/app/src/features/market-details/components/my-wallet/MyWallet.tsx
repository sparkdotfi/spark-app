import { BorrowEligibilityStatus } from '@/domain/market-info/reserve-status'
import { OpenDialogFunction } from '@/domain/state/dialogs'
import { Token } from '@/domain/types/Token'
import { borrowDialogConfig } from '@/features/dialogs/borrow/BorrowDialog'
import { depositDialogConfig } from '@/features/dialogs/deposit/DepositDialog'
import { NormalizedNumber } from '@sparkdotfi/common-universal'
import { ActionRow } from './components/ActionRow'
import { BorrowRow } from './components/BorrowRow'
import { TokenBalance } from './components/TokenBalance'
import { WalletPanelContent } from './components/WalletPanelContent'

export interface MyWalletProps {
  token: Token
  tokenBalance: NormalizedNumber
  lend?: {
    available: NormalizedNumber
    token: Token
  }
  deposit: {
    available: NormalizedNumber
    token: Token
  }
  borrow: {
    available: NormalizedNumber
    token: Token
    eligibility: BorrowEligibilityStatus
  }
  openDialog: OpenDialogFunction
}

export function MyWallet({ token, tokenBalance, lend, deposit, borrow, openDialog }: MyWalletProps) {
  return (
    <WalletPanelContent>
      <h3 className="typography-heading-4 text-primary">My Wallet</h3>
      <TokenBalance token={token} balance={tokenBalance} />
      {lend && (
        <ActionRow
          token={lend.token}
          value={lend.available}
          onAction={() => openDialog(depositDialogConfig, { token: lend.token })}
          label="Available to lend"
          buttonText="Lend"
        />
      )}
      <ActionRow
        token={deposit.token}
        value={deposit.available}
        onAction={() => openDialog(depositDialogConfig, { token: deposit.token })}
        label={token.symbol === 'DAI' ? 'Deposit DAI as collateral' : 'Available to deposit'}
        buttonText="Deposit"
      />
      <BorrowRow
        token={borrow.token}
        onAction={() => openDialog(borrowDialogConfig, { token: borrow.token })}
        availableToBorrow={borrow.available}
        eligibility={borrow.eligibility}
      />
    </WalletPanelContent>
  )
}
