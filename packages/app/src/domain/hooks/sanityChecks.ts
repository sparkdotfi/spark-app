import { wethGatewayAddress } from '@/config/contracts-generated'
import { assert, CheckedAddress } from '@sparkdotfi/common-universal'
import { Address, zeroAddress } from 'viem'
import { gnosis } from 'viem/chains'

/**
 * Do basic sanity checks when sending txs.
 * These checks should never fail in real life scenario but it's the final line of defense against bugs in the app.
 */
export function sanityCheckTx(tx: { address?: Address; value?: bigint }, chainId: number): void {
  assert(tx.address, 'Address is required')
  assert(tx.address.toLowerCase() !== CheckedAddress.EEEE().toLowerCase(), 'Cannot interact with ETH mock address')
  assert(tx.address !== zeroAddress, 'Cannot interact with zero address')

  if (tx.value && chainId !== gnosis.id) {
    assert(
      tx.address === (wethGatewayAddress as any)[chainId],
      'Sending the native asset is only allowed to gateway contracts',
    )
  }
}
