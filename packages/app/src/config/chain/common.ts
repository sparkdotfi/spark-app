import { TokenSymbol } from '@/domain/types/TokenSymbol'

export const commonTokenSymbolToReplacedName = {
  [TokenSymbol('DAI')]: { name: 'DAI Stablecoin', symbol: TokenSymbol('DAI') },
  [TokenSymbol('USDC')]: { name: 'Circle USD', symbol: TokenSymbol('USDC') },
  [TokenSymbol('wstETH')]: { name: 'Lido Staked ETH', symbol: TokenSymbol('wstETH') },
  [TokenSymbol('rETH')]: { name: 'Rocket Pool Staked ETH', symbol: TokenSymbol('rETH') },
  [TokenSymbol('GNO')]: { name: 'Gnosis Token', symbol: TokenSymbol('GNO') },
  [TokenSymbol('WETH')]: { name: 'Ethereum', symbol: TokenSymbol('ETH') },
  [TokenSymbol('weETH')]: { name: 'Ether.fi Staked ETH', symbol: TokenSymbol('weETH') },
  [TokenSymbol('tBTC')]: { name: 'Threshold BTC', symbol: TokenSymbol('tBTC') },
  [TokenSymbol('rsETH')]: { name: 'Kelp DAO Restaked ETH', symbol: TokenSymbol('rsETH') },
}
