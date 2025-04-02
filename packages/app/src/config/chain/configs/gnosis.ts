import { fetchSdaiOracleInfoGnosis } from '@/domain/oracles/oracleInfoFetchers'
import { gnosisSavingsDaiConverterQuery } from '@/domain/savings-converters/gnosisSavingsConverter'
import { TokenSymbol } from '@/domain/types/TokenSymbol'
import { assets } from '@/ui/assets'
import { CheckedAddress, NormalizedNumber } from '@sparkdotfi/common-universal'
import { gnosis } from 'viem/chains'
import { commonTokenSymbolToReplacedName } from '../common'
import { ChainConfigEntry } from '../types'
import { defineToken } from '../utils/defineToken'

const xdai = defineToken({
  address: CheckedAddress.EEEE(),
  oracleType: 'fixed-usd',
  symbol: TokenSymbol('XDAI'),
})

const wxdai = defineToken({
  address: CheckedAddress('0xe91D153E0b41518A2Ce8Dd3D7944Fa863463a97d'),
  oracleType: 'fixed-usd',
  symbol: TokenSymbol('WXDAI'),
})

const sdai = defineToken({
  address: CheckedAddress('0xaf204776c7245bF4147c2612BF6e5972Ee483701'),
  oracleType: 'vault',
  symbol: TokenSymbol('sDAI'),
})

export const gnosisConfig: ChainConfigEntry = {
  originChainId: gnosis.id,
  daiSymbol: xdai.symbol,
  sdaiSymbol: sdai.symbol,
  usdsSymbol: undefined,
  susdsSymbol: undefined,
  meta: {
    name: 'Gnosis',
    logo: assets.chain.gnosis,
  },
  tokensWithMalformedApprove: [],
  permitSupport: {
    [CheckedAddress('0x9C58BAcC331c9aa871AFD802DB6379a98e80CEdb')]: false, // GNO
    [CheckedAddress('0xe91D153E0b41518A2Ce8Dd3D7944Fa863463a97d')]: false, // WXDAI
    [CheckedAddress('0xaf204776c7245bF4147c2612BF6e5972Ee483701')]: false, // sDAI
    [CheckedAddress('0x6A023CCd1ff6F2045C3309768eAd9E68F978f6e1')]: false, // WETH
    [CheckedAddress('0x6C76971f98945AE98dD7d4DFcA8711ebea946eA6')]: false, // wstETH
    [CheckedAddress('0xDDAfbb505ad214D7b80b1f830fcCc89B60fb7A83')]: false, // USDC
    [CheckedAddress('0x4ECaBa5870353805a9F068101A40E0f32ed605C6')]: false, // USDT
    [CheckedAddress('0xcB444e90D8198415266c6a2724b7900fb12FC56E')]: false, // EURe
  },
  airdrop: {},
  markets: {
    defaultAssetToBorrow: wxdai.symbol,
    highlightedTokensToBorrow: [wxdai.symbol],
    nativeAssetInfo: {
      nativeAssetName: 'XDAI',
      wrappedNativeAssetSymbol: TokenSymbol('WXDAI'),
      wrappedNativeAssetAddress: CheckedAddress('0xe91D153E0b41518A2Ce8Dd3D7944Fa863463a97d'),
      nativeAssetSymbol: TokenSymbol('XDAI'),
      minRemainingNativeAssetBalance: NormalizedNumber(0.1),
    },
    tokenSymbolToReplacedName: {
      ...commonTokenSymbolToReplacedName,
      [TokenSymbol('WXDAI')]: { name: 'DAI Stablecoin', symbol: TokenSymbol('XDAI') },
      [TokenSymbol('sDAI')]: { name: 'Savings DAI', symbol: TokenSymbol('sDAI') },
      [TokenSymbol('USDC')]: { name: 'Circle USD (Legacy)', symbol: TokenSymbol('USDC') },
      [TokenSymbol('USDC.e')]: { name: 'Circle USD (Bridged)', symbol: TokenSymbol('USDC') },
      [TokenSymbol('USDT')]: { name: 'Tether USD (Bridged)', symbol: TokenSymbol('USDT') },
      [TokenSymbol('EURe')]: { name: 'Monerium EURO', symbol: TokenSymbol('EURe') },
    },
    oracles: {
      [TokenSymbol('EURe')]: {
        type: 'underlying-asset',
        asset: 'EUR',
      },
      [TokenSymbol('WETH')]: {
        type: 'market-price',
        providedBy: ['chainlink'],
      },
      [TokenSymbol('wstETH')]: {
        type: 'market-price',
        providedBy: ['chainlink'],
      },
      [TokenSymbol('GNO')]: {
        type: 'market-price',
        providedBy: ['chainlink'],
      },
      [TokenSymbol('USDC')]: {
        type: 'fixed',
      },
      [TokenSymbol('USDC.e')]: {
        type: 'fixed',
      },
      [TokenSymbol('USDT')]: {
        type: 'fixed',
      },
      [TokenSymbol('WXDAI')]: {
        type: 'fixed',
      },
      [TokenSymbol('sDAI')]: {
        type: 'yielding-fixed',
        baseAssetSymbol: TokenSymbol('DAI'),
        providedBy: ['chainlink'],
        oracleFetcher: fetchSdaiOracleInfoGnosis,
      },
    },
  },
  savings: {
    accounts: [
      {
        savingsToken: sdai.symbol,
        underlyingToken: xdai.symbol,
        supportedStablecoins: [xdai.symbol],
        fetchConverterQuery: gnosisSavingsDaiConverterQuery,
        savingsRateQueryOptions: undefined,
        myEarningsQueryOptions: undefined,
      },
    ],
    psmStables: undefined,
  },
  farms: undefined,
  sparkToken: undefined,
  definedTokens: [xdai, wxdai, sdai],
}
