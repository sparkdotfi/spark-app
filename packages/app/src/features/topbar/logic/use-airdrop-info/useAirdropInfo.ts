import { CheckedAddress } from '@sparkdotfi/common-universal'
import { useQuery } from '@tanstack/react-query'
import { useAccount } from 'wagmi'
import { TopbarAirdropProps } from '../../components/topbar-airdrop/TopbarAirdrop'
import { airdropInfo } from './airdropInfo'
import { extendAirdropResponse } from './utils/extendAirdropResponse'

interface UseAirdropInfoParams {
  refreshIntervalInMs: number
}

export function useAirdropInfo({ refreshIntervalInMs }: UseAirdropInfoParams): TopbarAirdropProps {
  const { address } = useAccount()

  const result = useQuery(airdropInfo(address && CheckedAddress(address)))

  const airdrop = extendAirdropResponse({ airdropInfoResponse: result.data, refreshIntervalInMs })
  const isLoading = result.isLoading
  const isError = result.isError

  return {
    airdrop,
    isLoading,
    isError,
  }
}
