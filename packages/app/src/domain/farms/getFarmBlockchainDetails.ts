import { stakingRewardsAbi } from '@/config/abis/stakingRewardsAbi'
import { FarmConfig } from '@/config/chain/types'
import { FarmBlockchainDetails } from '@/domain/farms/types'
import { TokenRepository } from '@/domain/token-repository/TokenRepository'
import { BaseUnitNumber } from '@sparkdotfi/common-universal'
import { CheckedAddress } from '@sparkdotfi/common-universal'
import { Address } from 'viem'
import { Config } from 'wagmi'
import { readContract } from 'wagmi/actions'

export interface GetFarmBlockchainDetailsParams {
  farmConfig: FarmConfig
  wagmiConfig: Config
  tokenRepository: TokenRepository
  chainId: number
  account: Address | undefined
}

export async function getFarmBlockchainDetails({
  farmConfig,
  wagmiConfig,
  tokenRepository,
  chainId,
  account,
}: GetFarmBlockchainDetailsParams): Promise<FarmBlockchainDetails> {
  const contractData = await getFarmContractData({ farmConfig, wagmiConfig, chainId, account })

  const rewardToken =
    farmConfig.rewardType === 'token'
      ? tokenRepository.findOneTokenByAddress(CheckedAddress(contractData.rewardTokenAddress))
      : farmConfig.rewardPoints
  const stakingToken = tokenRepository.findOneTokenByAddress(CheckedAddress(contractData.stakingTokenAddress))

  return {
    ...farmConfig,
    name: farmConfig.rewardType === 'points' ? `${rewardToken.name} Points Farm` : `${rewardToken.symbol} Farm`,
    rewardToken, // @todo: Reward token price might not be correct - we don't provide oracles for all tokens in tokens info
    stakingToken,
    rewardRate: rewardToken.fromBaseUnit(BaseUnitNumber(contractData.rewardRate)),
    periodFinish: Number(contractData.periodFinish),
    totalSupply: stakingToken.fromBaseUnit(BaseUnitNumber(contractData.totalSupply)),
    earned: rewardToken.fromBaseUnit(BaseUnitNumber(contractData.earned)),
    staked: stakingToken.fromBaseUnit(BaseUnitNumber(contractData.staked)),
    earnedTimestamp: Number(contractData.earnedTimestamp),
  }
}

interface GetFarmContractDataParams {
  farmConfig: FarmConfig
  wagmiConfig: Config
  chainId: number
  account: Address | undefined
}

interface GetFarmContractDataResult {
  rewardTokenAddress: Address
  stakingTokenAddress: Address
  earned: bigint
  staked: bigint
  rewardRate: bigint
  earnedTimestamp: bigint
  periodFinish: bigint
  totalSupply: bigint
}

async function getFarmContractData({
  farmConfig,
  wagmiConfig,
  chainId,
  account,
}: GetFarmContractDataParams): Promise<GetFarmContractDataResult> {
  function getStaked(): Promise<bigint> {
    if (!account) {
      return Promise.resolve(0n)
    }

    const res = readContract(wagmiConfig, {
      address: farmConfig.address,
      abi: stakingRewardsAbi,
      functionName: 'balanceOf',
      args: [account],
      chainId,
    })

    return res
  }

  function getEarned(): Promise<bigint> {
    if (!account) {
      return Promise.resolve(0n)
    }

    const res = readContract(wagmiConfig, {
      address: farmConfig.address,
      abi: stakingRewardsAbi,
      functionName: 'earned',
      args: [account],
      chainId,
    })

    return res
  }

  const [
    staked,
    earned,
    rewardTokenAddress,
    stakingTokenAddress,
    rewardRate,
    earnedTimestamp,
    periodFinish,
    totalSupply,
  ] = await Promise.all([
    getStaked(),
    getEarned(),
    readContract(wagmiConfig, {
      address: farmConfig.address,
      abi: stakingRewardsAbi,
      functionName: 'rewardsToken',
      chainId,
    }),
    readContract(wagmiConfig, {
      address: farmConfig.address,
      abi: stakingRewardsAbi,
      functionName: 'stakingToken',
      chainId,
    }),
    readContract(wagmiConfig, {
      address: farmConfig.address,
      abi: stakingRewardsAbi,
      functionName: 'rewardRate',
      chainId,
    }),
    readContract(wagmiConfig, {
      address: farmConfig.address,
      abi: stakingRewardsAbi,
      functionName: 'lastTimeRewardApplicable',
      chainId,
    }),
    readContract(wagmiConfig, {
      address: farmConfig.address,
      abi: stakingRewardsAbi,
      functionName: 'periodFinish',
      chainId,
    }),
    readContract(wagmiConfig, {
      address: farmConfig.address,
      abi: stakingRewardsAbi,
      functionName: 'totalSupply',
      chainId,
    }),
  ])

  return {
    rewardTokenAddress,
    stakingTokenAddress,
    earned,
    staked,
    rewardRate,
    earnedTimestamp,
    periodFinish,
    totalSupply,
  }
}
