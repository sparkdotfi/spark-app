export const weethOracleAbi = [
  {
    inputs: [],
    name: 'ethSource',
    outputs: [{ internalType: 'contract IPriceSource', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'weeth',
    outputs: [{ internalType: 'contract IWrappedEtherfiRestakedEth', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const

export const weethRatioAbi = [
  {
    inputs: [],
    name: 'getRate',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const

export const weethBaseAssetOracleAbi = [
  {
    inputs: [],
    name: 'decimals',
    outputs: [{ internalType: 'uint8', name: '', type: 'uint8' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'latestAnswer',
    outputs: [{ internalType: 'int256', name: '', type: 'int256' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const

export const rethOracleAbi = [
  {
    inputs: [],
    name: 'ethSource',
    outputs: [{ internalType: 'contract IPriceSource', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'reth',
    outputs: [{ internalType: 'contract IRocketPoolStakedEth', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const

export const rethRatioAbi = [
  {
    inputs: [],
    name: 'getExchangeRate',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const

export const rethBaseAssetOracleAbi = [
  {
    inputs: [],
    name: 'decimals',
    outputs: [{ internalType: 'uint8', name: '', type: 'uint8' }],
    stateMutability: 'view',
    type: 'function',
  },

  {
    inputs: [],
    name: 'latestAnswer',
    outputs: [{ internalType: 'int256', name: '', type: 'int256' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const

export const wstethOracleMainnetAbi = [
  {
    inputs: [],
    name: 'ethSource',
    outputs: [{ internalType: 'contract IPriceSource', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'steth',
    outputs: [{ internalType: 'contract ILidoStakedEth', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const

export const wstethRatioMainnetAbi = [
  {
    constant: true,
    inputs: [{ name: '_sharesAmount', type: 'uint256' }],
    name: 'getPooledEthByShares',
    outputs: [{ name: '', type: 'uint256' }],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
] as const

export const wstethBaseAssetOracleMainnetAbi = [
  {
    inputs: [],
    name: 'decimals',
    outputs: [{ internalType: 'uint8', name: '', type: 'uint8' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'latestAnswer',
    outputs: [{ internalType: 'int256', name: '', type: 'int256' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const

export const sdaiOracleGnosisAbi = [
  {
    inputs: [],
    name: 'DAI_TO_BASE',
    outputs: [{ internalType: 'contract IChainlinkAggregator', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'sDAI',
    outputs: [{ internalType: 'contract IERC4626', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const

export const sdaiRatioGnosisAbi = [
  {
    inputs: [{ internalType: 'uint256', name: 'shares', type: 'uint256' }],
    name: 'convertToAssets',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const

export const sdaiBaseAssetOracleGnosisAbi = [
  {
    inputs: [],
    name: 'decimals',
    outputs: [{ internalType: 'uint8', name: '', type: 'uint8' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'latestAnswer',
    outputs: [{ internalType: 'int256', name: '', type: 'int256' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const

// ezeth
export const ezethOracleAbi = [
  {
    inputs: [],
    name: 'ethSource',
    outputs: [{ internalType: 'contract IPriceSource', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'ezETH',
    outputs: [{ internalType: 'contract IEZETH', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'oracle',
    outputs: [{ internalType: 'contract IEZETHExchangeRateOracle', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const

export const ezethTvlsSourceAbi = [
  {
    inputs: [],
    name: 'calculateTVLs',
    outputs: [
      { internalType: 'uint256[][]', name: '', type: 'uint256[][]' },
      { internalType: 'uint256[]', name: '', type: 'uint256[]' },
      { internalType: 'uint256', name: '', type: 'uint256' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
] as const

export const ezethAbi = [
  {
    inputs: [],
    name: 'totalSupply',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const

// rseth
export const rsethOracleAbi = [
  {
    inputs: [],
    name: 'ethSource',
    outputs: [{ internalType: 'contract IPriceSource', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'oracle',
    outputs: [{ internalType: 'contract IKelpDAORestakedEthOracle', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const

export const rsethRatioSourceAbi = [
  {
    inputs: [],
    name: 'rsETHPrice',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const
