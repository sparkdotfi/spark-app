import { raise } from '@sparkdotfi/common-universal'
import { getChainConfigEntry } from '..'
import { NativeAssetInfo } from '../types'

export function getNativeAssetInfo(chainId: number): NativeAssetInfo {
  return (
    getChainConfigEntry(chainId).markets?.nativeAssetInfo ?? raise('Native asset info is not defined on this chain')
  )
}
