import { getChainConfigEntry } from '@/config/chain'
import { Token } from '@/domain/types/Token'
import { assert } from '@sparkdotfi/common-universal'
import { Signature } from 'viem'

export interface Permit {
  token: Token
  deadline: Date
  signature: Signature
}

export interface PermitStore {
  add: (permit: Permit) => void
  find: (token: Token) => Permit | undefined
}

export function createPermitStore(): PermitStore {
  const permits: Permit[] = []

  /* eslint-disable func-style */
  const add = (permit: Permit): void => {
    permits.push(permit)
  }

  const find = (token: Token): Permit | undefined => {
    const permitsForToken = permits.filter((permit) => permit.token.address === token.address)
    assert(permitsForToken.length <= 1, 'PermitStore: multiple permits for the same token')
    return permitsForToken[0]
  }
  /* eslint-enable func-style */

  return {
    add,
    find,
  }
}

export function isPermitSupported(chainId: number, token: Token): boolean {
  const { permitSupport } = getChainConfigEntry(chainId)
  return permitSupport[token.address] ?? false
}
