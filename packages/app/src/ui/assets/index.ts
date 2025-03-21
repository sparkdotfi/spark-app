import { TokenSymbol } from '@/domain/types/TokenSymbol'
import { Percentage } from '@marsfoundation/common-universal'
import approve from './actions/approve.svg'
import borrow from './actions/borrow.svg'
import deposit from './actions/deposit.svg'
import done from './actions/done.svg'
import exchange from './actions/exchange.svg'
import repay from './actions/repay.svg'
import withdraw from './actions/withdraw.svg'
import arrowRight from './arrow-right.svg'
import mkrToSkyTransform from './banners/mkr-to-sky-transform.svg'
import boxArrowTopRight from './box-arrow-top-right.svg'
import logoDark from './brand/logo-dark.svg'
import logoGradientDark from './brand/logo-gradient-dark.svg'
import logoGradientLight from './brand/logo-gradient-light.svg'
import logoLight from './brand/logo-light.svg'
import symbolDark from './brand/symbol-dark.svg'
import symbolGradient from './brand/symbol-gradient.svg'
import symboLight from './brand/symbol-light.svg'
import arbitrum from './chains/arbitrum.svg'
import base from './chains/base.svg'
import ethereum from './chains/ethereum.svg'
import gnosis from './chains/gnosis.svg'
import checkCircle from './check-circle.svg'
import chevronDown from './chevron-down.svg'
import circleInfo from './circle-info.svg'
import closeFilled from './close-filled.svg'
import close from './close.svg'
import cowSwap from './cow-swap.svg'
import down from './down.svg'
import downgrade from './downgrade.svg'
import equal from './equal.svg'
import eye from './eye.svg'
import flash from './flash.svg'
import giftGradient from './gift-gradient.svg'
import giftbox from './giftbox.svg'
import greenArrowUp from './green-arrow-up.svg'
import handCoins from './hand-coins.svg'
import lifiLogo from './lifi-logo.svg'
import link from './link.svg'
import magicWandCircle from './magic-wand-circle.svg'
import magicWand from './magic-wand.svg'
import makerLogo from './maker.svg'
import chart from './markets/chart.svg'
import inputOutput from './markets/input-output.svg'
import lock from './markets/lock.svg'
import output from './markets/output.svg'
import menu from './menu.svg'
import moreIconVertical from './more-icon-vertical.svg'
import moreIcon from './more-icon.svg'
import multiply from './multiply.svg'
import chainlink from './oracle-providers/chainlink.svg'
import chronicle from './oracle-providers/chronicle.svg'
import lido from './oracle-providers/lido.svg'
import redstoneOracle from './oracle-providers/redstone.svg'
import borrowCircleIcon from './page/borrow-icon-circle.svg'
import borrowIcon from './page/borrow-icon.svg'
import farmsCircleIcon from './page/farms-icon-circle.svg'
import farmsIcon from './page/farms-icon.svg'
import savingsCircleIcon from './page/savings-icon-circle.svg'
import savingsIcon from './page/savings-icon.svg'
import sparkRewardsCircleIcon from './page/spark-rewards-icon-circle.svg'
import sparkRewardsIcon from './page/spark-rewards-icon.svg'
import pause from './pause.svg'
import guestModePanelIcon from './rewards/guest-mode-panel-icon.svg'
import rocket from './rocket.svg'
import daiUpgrade from './savings/dai-upgrade.webp'
import savingsWelcome from './savings/savings-welcome.webp'
import sdaiUpgradeBannerIcon from './savings/sdai-upgrade-banner-icon.svg'
import sdaiUpgrade from './savings/sdai-upgrade.webp'
import upgradeBannerBg from './savings/upgrade-banner-bg.svg'
import sliderThumb from './slider-thumb.svg'
import snowflake from './snowflake.svg'
import discord from './social-platforms/discord.svg'
import x from './social-platforms/x.svg'
import sparkIcon from './spark-icon.svg'
import success from './success.svg'
import threeDots from './three-dots.svg'
import timer from './timer.svg'
import cbbtc from './tokens/cbbtc.svg'
import cle from './tokens/cle.svg'
import dai from './tokens/dai.svg'
import eth from './tokens/eth.svg'
import eure from './tokens/eure.svg'
import gno from './tokens/gno.svg'
import lbtc from './tokens/lbtc.svg'
import mkr from './tokens/mkr.svg'
import red from './tokens/red.svg'
import reth from './tokens/reth.svg'
import sdai from './tokens/sdai.svg'
import sky from './tokens/sky.svg'
import spk from './tokens/spk.svg'
import steth from './tokens/steth.svg'
import susdc from './tokens/susdc.svg'
import susds from './tokens/susds.svg'
import tbtc from './tokens/tbtc.svg'
import unknown from './tokens/unknown.svg'
import usdc from './tokens/usdc.svg'
import usds from './tokens/usds.svg'
import usdt from './tokens/usdt.svg'
import wbtc from './tokens/wbtc.svg'
import weeth from './tokens/weeth.svg'
import weth from './tokens/weth.svg'
import wsteth from './tokens/wsteth.svg'
import wxdai from './tokens/wxdai.svg'
import xdai from './tokens/xdai.svg'
import up from './up.svg'
import upgrade from './upgrade.svg'
import coinbase from './wallet-icons/coinbase.svg'
import defaultWallet from './wallet-icons/default.svg'
import enjin from './wallet-icons/enjin.svg'
import metamask from './wallet-icons/metamask.svg'
import torus from './wallet-icons/torus.svg'
import walletConnect from './wallet-icons/wallet-connect.svg'
import wallet from './wallet.svg'
import warning from './warning.svg'
import xCircle from './x-circle.svg'

export const assets = {
  sparkIcon,
  lifiLogo,
  chevronDown,
  sliderThumb,
  circleInfo,
  up,
  down,
  success,
  wallet,
  link,
  cowSwap,
  threeDots,
  arrowRight,
  warning,
  pause,
  snowflake,
  xCircle,
  checkCircle,
  flash,
  greenArrowUp,
  boxArrowTopRight,
  magicWand,
  magicWandCircle,
  moreIcon,
  moreIconVertical,
  eye,
  menu,
  close,
  closeFilled,
  makerLogo,
  giftbox,
  rocket,
  downgrade,
  timer,
  multiply,
  equal,
  handCoins,
  giftGradient,

  markets: {
    chart,
    inputOutput,
    lock,
    output,
  },
  actions: {
    upgrade,
    downgrade,
    approve,
    done,
    borrow,
    deposit,
    withdraw,
    repay,
    exchange,
  },
  chain: {
    gnosis,
    ethereum,
    unknown,
    base,
    arbitrum,
  },
  token: {
    dai,
    eth,
    eure,
    gno,
    mkr,
    sky,
    usds,
    reth,
    sdai,
    susds,
    steth,
    usdc,
    susdc,
    'usdc.e': usdc,
    usdt,
    wbtc,
    weeth,
    weth,
    wsteth,
    wxdai,
    xdai,
    cbbtc,
    cle,
    red,
    spk,
    lbtc,
    tbtc,
    unknown,
  },
  socialPlatforms: {
    x,
    discord,
  },
  walletIcons: {
    coinbase,
    enjin,
    metamask,
    torus,
    walletConnect,
    default: defaultWallet,
  },
  savings: {
    sdaiUpgradeBannerIcon,
    upgradeBannerBg,
    daiUpgrade,
    sdaiUpgrade,
    savingsWelcome,
  },
  rewards: {
    guestModePanelIcon,
  },
  banners: {
    mkrToSkyTransform,
  },
  oracleProviders: {
    chainlink,
    chronicle,
    redstone: redstoneOracle,
    lido,
  },

  page: {
    savings: savingsIcon,
    savingsCircle: savingsCircleIcon,
    farms: farmsIcon,
    farmsCircle: farmsCircleIcon,
    borrow: borrowIcon,
    borrowCircle: borrowCircleIcon,
    sparkRewards: sparkRewardsIcon,
    sparkRewardsCircle: sparkRewardsCircleIcon,
  },

  brand: {
    symbolGradient,
    symbolDark,
    symboLight,
    logoDark,
    logoLight,
    logoGradientLight,
    logoGradientDark,
  },
}

export function isTokenImageAvailable(symbol: TokenSymbol): boolean {
  return typeof assets.token[symbol.toLocaleLowerCase() as keyof typeof assets.token] === 'string'
}

export function getTokenImage(symbol: TokenSymbol): string {
  const image = assets.token[symbol.toLocaleLowerCase() as keyof typeof assets.token]
  if (!image) {
    return assets.token.unknown
  }

  return image
}

export function getSocialPlatformIcon(platform: string): string {
  const icon = assets.socialPlatforms[platform as keyof typeof assets.socialPlatforms]
  if (!icon) {
    return assets.token.unknown
  }
  return icon
}

export function getTokenColor(symbol: TokenSymbol, options?: { alpha?: Percentage; fallback?: string }): string {
  const color = tokenColors[symbol]
  const alpha = (options?.alpha ?? Percentage(1)).toFixed(2)
  const fallback = options?.fallback ?? `rgb(217 217 217 / ${alpha})`

  return color ? `rgb(${color} / ${alpha})` : fallback
}

const tokenColors: Record<TokenSymbol, `${number} ${number} ${number}`> = {
  [TokenSymbol('DAI')]: '255 192 70',
  [TokenSymbol('ETH')]: '124 192 255',
  [TokenSymbol('EURe')]: '0 134 194',
  [TokenSymbol('GNO')]: '62 105 87',
  [TokenSymbol('MKR')]: '26 171 155',
  [TokenSymbol('SKY')]: '178 104 252',
  [TokenSymbol('USDS')]: '255 163 76',
  [TokenSymbol('rETH')]: '255 151 125',
  [TokenSymbol('sDAI')]: '53 181 82',
  [TokenSymbol('sUSDS')]: '53 181 82',
  [TokenSymbol('stETH')]: '143 146 236',
  [TokenSymbol('USDC')]: '51 146 248',
  [TokenSymbol('sUSDC')]: '17 160 179',
  [TokenSymbol('USDC.e')]: '51 146 248',
  [TokenSymbol('USDT')]: '38 161 123',
  [TokenSymbol('WBTC')]: '240 146 66',
  [TokenSymbol('weETH')]: '90 68 190',
  [TokenSymbol('WETH')]: '134 168 239',
  [TokenSymbol('wstETH')]: '0 163 255',
  [TokenSymbol('WXDAI')]: '253 177 31',
  [TokenSymbol('XDAI')]: '255 192 70',
  [TokenSymbol('CLE')]: '47 208 91',
  [TokenSymbol('cbBTC')]: '0 82 255',
  [TokenSymbol('RED')]: '174 8 34',
  [TokenSymbol('SPK')]: '358 54 99',
  [TokenSymbol('LBTC')]: '58 114 107',
  [TokenSymbol('tBTC')]: '29 34 41',
}
