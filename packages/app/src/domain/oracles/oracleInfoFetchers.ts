import {
  ezethAbi,
  ezethOracleAbi,
  ezethTvlsSourceAbi,
  rethBaseAssetOracleAbi,
  rethOracleAbi,
  rethRatioAbi,
  rsethOracleAbi,
  rsethRatioSourceAbi,
  sdaiBaseAssetOracleGnosisAbi,
  sdaiOracleGnosisAbi,
  sdaiRatioGnosisAbi,
  weethBaseAssetOracleAbi,
  weethOracleAbi,
  weethRatioAbi,
  wstethBaseAssetOracleMainnetAbi,
  wstethOracleMainnetAbi,
  wstethRatioMainnetAbi,
} from '@/config/abis/yieldingTokensRatioAbi'
import { chronicleAggorEthUsdAbi } from '@/config/contracts-generated'
import { assert, toBigInt } from '@sparkdotfi/common-universal'
import { CheckedAddress } from '@sparkdotfi/common-universal'
import { BaseUnitNumber, NormalizedNumber } from '@sparkdotfi/common-universal'
import { gnosis, mainnet } from 'viem/chains'
import { Config } from 'wagmi'
import { readContract } from 'wagmi/actions'
import { Reserve } from '../market-info/marketInfo'

export interface OracleInfoFetcherParams {
  reserve: Reserve
  wagmiConfig: Config
}

export interface OracleInfoFetcherResult {
  ratio: NormalizedNumber
  ratioSourceOracle: CheckedAddress
  baseAssetOracle: CheckedAddress
  baseAssetPrice: NormalizedNumber
}

export async function fetchWstethOracleInfoMainnet({
  reserve,
  wagmiConfig,
}: OracleInfoFetcherParams): Promise<OracleInfoFetcherResult> {
  const [steth, baseAssetOracle] = await Promise.all([
    readContract(wagmiConfig, {
      abi: wstethOracleMainnetAbi,
      address: reserve.priceOracle,
      functionName: 'steth',
      args: [],
      chainId: mainnet.id,
    }),
    readContract(wagmiConfig, {
      abi: wstethOracleMainnetAbi,
      address: reserve.priceOracle,
      functionName: 'ethSource',
      args: [],
      chainId: mainnet.id,
    }),
  ])

  const [ratio, baseAssetPrice, baseAssetPriceDecimals] = await Promise.all([
    readContract(wagmiConfig, {
      abi: wstethRatioMainnetAbi,
      address: steth,
      functionName: 'getPooledEthByShares',
      args: [toBigInt(reserve.token.toBaseUnit(NormalizedNumber(1)))],
      chainId: mainnet.id,
    }),
    readContract(wagmiConfig, {
      abi: wstethBaseAssetOracleMainnetAbi,
      address: baseAssetOracle,
      account: reserve.priceOracle,
      functionName: 'latestAnswer',
      args: [],
      chainId: mainnet.id,
    }),
    readContract(wagmiConfig, {
      abi: wstethBaseAssetOracleMainnetAbi,
      address: baseAssetOracle,
      account: reserve.priceOracle,
      functionName: 'decimals',
      args: [],
      chainId: mainnet.id,
    }),
  ])

  return {
    ratio: reserve.token.fromBaseUnit(BaseUnitNumber(ratio)),
    ratioSourceOracle: CheckedAddress(steth),
    baseAssetOracle: CheckedAddress(baseAssetOracle),
    baseAssetPrice: NormalizedNumber(BaseUnitNumber(baseAssetPrice).shiftedBy(-baseAssetPriceDecimals)),
  }
}

export async function fetchSdaiOracleInfoGnosis({
  reserve,
  wagmiConfig,
}: OracleInfoFetcherParams): Promise<OracleInfoFetcherResult> {
  const [sdaiAddress, baseAssetOracle] = await Promise.all([
    readContract(wagmiConfig, {
      abi: sdaiOracleGnosisAbi,
      address: reserve.priceOracle,
      functionName: 'sDAI',
      args: [],
      chainId: gnosis.id,
    }),
    readContract(wagmiConfig, {
      abi: sdaiOracleGnosisAbi,
      address: reserve.priceOracle,
      functionName: 'DAI_TO_BASE',
      args: [],
      chainId: gnosis.id,
    }),
  ])

  const [ratio, baseAssetPrice, baseAssetPriceDecimals] = await Promise.all([
    readContract(wagmiConfig, {
      abi: sdaiRatioGnosisAbi,
      address: sdaiAddress,
      functionName: 'convertToAssets',
      args: [toBigInt(reserve.token.toBaseUnit(NormalizedNumber(1)))],
      chainId: gnosis.id,
    }),
    readContract(wagmiConfig, {
      abi: sdaiBaseAssetOracleGnosisAbi,
      address: baseAssetOracle,
      functionName: 'latestAnswer',
      args: [],
      chainId: gnosis.id,
    }),
    readContract(wagmiConfig, {
      abi: sdaiBaseAssetOracleGnosisAbi,
      address: baseAssetOracle,
      functionName: 'decimals',
      args: [],
      chainId: gnosis.id,
    }),
  ])

  return {
    ratio: reserve.token.fromBaseUnit(BaseUnitNumber(ratio)),
    ratioSourceOracle: CheckedAddress(sdaiAddress),
    baseAssetOracle: CheckedAddress(baseAssetOracle),
    baseAssetPrice: NormalizedNumber(BaseUnitNumber(baseAssetPrice).shiftedBy(-baseAssetPriceDecimals)),
  }
}

export async function fetchRethOracleInfo({
  reserve,
  wagmiConfig,
}: OracleInfoFetcherParams): Promise<OracleInfoFetcherResult> {
  const [reth, baseAssetOracle] = await Promise.all([
    readContract(wagmiConfig, {
      abi: rethOracleAbi,
      address: reserve.priceOracle,
      functionName: 'reth',
      args: [],
      chainId: mainnet.id,
    }),
    readContract(wagmiConfig, {
      abi: rethOracleAbi,
      address: reserve.priceOracle,
      functionName: 'ethSource',
      args: [],
      chainId: mainnet.id,
    }),
  ])

  const [ratio, baseAssetPrice, baseAssetPriceDecimals] = await Promise.all([
    readContract(wagmiConfig, {
      abi: rethRatioAbi,
      address: reth,
      functionName: 'getExchangeRate',
      args: [],
      chainId: mainnet.id,
    }),
    readContract(wagmiConfig, {
      abi: rethBaseAssetOracleAbi,
      address: baseAssetOracle,
      account: reserve.priceOracle,
      functionName: 'latestAnswer',
      args: [],
      chainId: mainnet.id,
    }),
    readContract(wagmiConfig, {
      abi: rethBaseAssetOracleAbi,
      address: baseAssetOracle,
      account: reserve.priceOracle,
      functionName: 'decimals',
      args: [],
      chainId: mainnet.id,
    }),
  ])

  return {
    ratio: reserve.token.fromBaseUnit(BaseUnitNumber(ratio)),
    ratioSourceOracle: CheckedAddress(reth),
    baseAssetOracle: CheckedAddress(baseAssetOracle),
    baseAssetPrice: NormalizedNumber(BaseUnitNumber(baseAssetPrice).shiftedBy(-baseAssetPriceDecimals)),
  }
}

export async function fetchWeethOracleInfo({
  reserve,
  wagmiConfig,
}: OracleInfoFetcherParams): Promise<OracleInfoFetcherResult> {
  const [weeth, baseAssetOracle] = await Promise.all([
    readContract(wagmiConfig, {
      abi: weethOracleAbi,
      address: reserve.priceOracle,
      functionName: 'weeth',
      args: [],
      chainId: mainnet.id,
    }),
    readContract(wagmiConfig, {
      abi: weethOracleAbi,
      address: reserve.priceOracle,
      functionName: 'ethSource',
      args: [],
      chainId: mainnet.id,
    }),
  ])

  const [ratio, baseAssetPrice, baseAssetPriceDecimals] = await Promise.all([
    readContract(wagmiConfig, {
      abi: weethRatioAbi,
      address: weeth,
      functionName: 'getRate',
      args: [],
      chainId: mainnet.id,
    }),
    readContract(wagmiConfig, {
      abi: weethBaseAssetOracleAbi,
      address: baseAssetOracle,
      account: reserve.priceOracle,
      functionName: 'latestAnswer',
      args: [],
      chainId: mainnet.id,
    }),
    readContract(wagmiConfig, {
      abi: weethBaseAssetOracleAbi,
      address: baseAssetOracle,
      account: reserve.priceOracle,
      functionName: 'decimals',
      args: [],
      chainId: mainnet.id,
    }),
  ])

  return {
    ratio: reserve.token.fromBaseUnit(BaseUnitNumber(ratio)),
    ratioSourceOracle: CheckedAddress(weeth),
    baseAssetOracle: CheckedAddress(baseAssetOracle),
    baseAssetPrice: NormalizedNumber(BaseUnitNumber(baseAssetPrice).shiftedBy(-baseAssetPriceDecimals)),
  }
}

export async function fetchEzethOracleInfo({
  reserve,
  wagmiConfig,
}: OracleInfoFetcherParams): Promise<OracleInfoFetcherResult> {
  const [ezethTvlsSource, ethPriceSource, ezeth] = await Promise.all([
    readContract(wagmiConfig, {
      abi: ezethOracleAbi,
      address: reserve.priceOracle,
      functionName: 'oracle',
      args: [],
      chainId: mainnet.id,
    }),
    readContract(wagmiConfig, {
      abi: ezethOracleAbi,
      address: reserve.priceOracle,
      functionName: 'ethSource',
      args: [],
      chainId: mainnet.id,
    }),
    readContract(wagmiConfig, {
      abi: ezethOracleAbi,
      address: reserve.priceOracle,
      functionName: 'ezETH',
      args: [],
      chainId: mainnet.id,
    }),
  ])

  const [[, , tvl], ezethTotalSupply, ethPrice, ethPriceDecimals] = await Promise.all([
    readContract(wagmiConfig, {
      abi: ezethTvlsSourceAbi,
      address: ezethTvlsSource,
      functionName: 'calculateTVLs',
      args: [],
      chainId: mainnet.id,
    }),
    readContract(wagmiConfig, {
      abi: ezethAbi,
      address: ezeth,
      functionName: 'totalSupply',
      args: [],
      chainId: mainnet.id,
    }),
    readContract(wagmiConfig, {
      abi: chronicleAggorEthUsdAbi,
      address: ethPriceSource,
      functionName: 'latestAnswer',
      args: [],
      chainId: mainnet.id,
    }),
    readContract(wagmiConfig, {
      abi: chronicleAggorEthUsdAbi,
      address: ethPriceSource,
      functionName: 'decimals',
      args: [],
      chainId: mainnet.id,
    }),
  ])

  assert(ezethTotalSupply > 0n, 'ezethTotalSupply should be greater than 0')
  const ratio = (tvl * BigInt(10 ** reserve.token.decimals)) / ezethTotalSupply

  return {
    ratio: reserve.token.fromBaseUnit(BaseUnitNumber(ratio)),
    ratioSourceOracle: CheckedAddress(ezethTvlsSource),
    baseAssetOracle: CheckedAddress(ethPriceSource),
    baseAssetPrice: BaseUnitNumber.toNormalizedUnit(BaseUnitNumber(ethPrice), ethPriceDecimals),
  }
}

export async function fetchRsethOracleInfo({
  reserve,
  wagmiConfig,
}: OracleInfoFetcherParams): Promise<OracleInfoFetcherResult> {
  const [rsethRatioSource, ethPriceSource] = await Promise.all([
    readContract(wagmiConfig, {
      abi: rsethOracleAbi,
      address: reserve.priceOracle,
      functionName: 'oracle',
      args: [],
      chainId: mainnet.id,
    }),
    readContract(wagmiConfig, {
      abi: rsethOracleAbi,
      address: reserve.priceOracle,
      functionName: 'ethSource',
      args: [],
      chainId: mainnet.id,
    }),
  ])

  const [ratio, ethPrice, ethPriceDecimals] = await Promise.all([
    readContract(wagmiConfig, {
      abi: rsethRatioSourceAbi,
      address: rsethRatioSource,
      functionName: 'rsETHPrice',
      args: [],
      chainId: mainnet.id,
    }),
    readContract(wagmiConfig, {
      abi: chronicleAggorEthUsdAbi,
      address: ethPriceSource,
      functionName: 'latestAnswer',
      args: [],
      chainId: mainnet.id,
    }),
    readContract(wagmiConfig, {
      abi: chronicleAggorEthUsdAbi,
      address: ethPriceSource,
      functionName: 'decimals',
      args: [],
      chainId: mainnet.id,
    }),
  ])

  return {
    ratio: reserve.token.fromBaseUnit(BaseUnitNumber(ratio)),
    ratioSourceOracle: CheckedAddress(rsethRatioSource),
    baseAssetOracle: CheckedAddress(ethPriceSource),
    baseAssetPrice: BaseUnitNumber.toNormalizedUnit(BaseUnitNumber(ethPrice), ethPriceDecimals),
  }
}
