import { assert, BaseUnitNumber, CheckedAddress, Hash, RAY, bigNumberify, toBigInt } from '@sparkdotfi/common-universal'
import { encodeAbiParameters, encodePacked, hexToBigInt, keccak256, parseAbi, toHex } from 'viem'
import { TestnetClient } from '../TestnetClient.js'

export async function setAaveUsingAsCollateral({
  client,
  tokenAddress,
  account,
  lendingPoolAddress,
  usingAsCollateral,
}: {
  client: TestnetClient
  tokenAddress: CheckedAddress
  account: CheckedAddress
  lendingPoolAddress: CheckedAddress
  usingAsCollateral: boolean
}): Promise<void> {
  const { id: reserveIndex } = await client.readContract({
    address: lendingPoolAddress,
    abi: poolAbi,
    functionName: 'getReserveData',
    args: [tokenAddress],
  })

  const mappingSlot = 53n
  const storageSlot = Hash(
    keccak256(encodeAbiParameters([{ type: 'address' }, { type: 'uint256' }], [account, mappingSlot])),
  )

  const storageValue = await client.getStorageAt({
    address: lendingPoolAddress,
    slot: storageSlot,
  })

  assert(storageValue, 'storage value should exist')
  const oldData = hexToBigInt(storageValue)

  const bit = 1n << ((BigInt(reserveIndex) << 1n) + 1n)

  const newData = usingAsCollateral ? oldData | bit : oldData & ~bit

  await client.setStorageAt(lendingPoolAddress, storageSlot, toHex(newData, { size: 32 }))
}

export async function setATokenBalance({
  client,
  aTokenAddress,
  account,
  balance,
}: {
  client: TestnetClient
  aTokenAddress: CheckedAddress
  account: CheckedAddress
  balance: BaseUnitNumber
}): Promise<void> {
  const newBalance = await getNewATokenBalance({ client, aTokenAddress, balance })
  const mappingSlot = 52n
  const storageSlot = keccak256(encodeAbiParameters([{ type: 'address' }, { type: 'uint256' }], [account, mappingSlot]))
  const storageValue = await client.getStorageAt({
    address: aTokenAddress,
    slot: storageSlot,
  })

  assert(storageValue, 'storage value should exist')
  const oldStorageValue = storageValue.replace('0x', '')
  const oldData = BigInt(`0x${oldStorageValue.slice(0, oldStorageValue.length / 2)}`)

  await client.setStorageAt(
    aTokenAddress,
    Hash(storageSlot),
    encodePacked(['uint128', 'uint128'], [oldData, toBigInt(newBalance)]),
  )
}

const poolAbi = [
  {
    inputs: [
      {
        internalType: 'address',
        name: 'asset',
        type: 'address',
      },
    ],
    name: 'getReserveData',
    outputs: [
      {
        components: [
          {
            components: [
              {
                internalType: 'uint256',
                name: 'data',
                type: 'uint256',
              },
            ],
            internalType: 'struct DataTypes.ReserveConfigurationMap',
            name: 'configuration',
            type: 'tuple',
          },
          {
            internalType: 'uint128',
            name: 'liquidityIndex',
            type: 'uint128',
          },
          {
            internalType: 'uint128',
            name: 'currentLiquidityRate',
            type: 'uint128',
          },
          {
            internalType: 'uint128',
            name: 'variableBorrowIndex',
            type: 'uint128',
          },
          {
            internalType: 'uint128',
            name: 'currentVariableBorrowRate',
            type: 'uint128',
          },
          {
            internalType: 'uint128',
            name: 'currentStableBorrowRate',
            type: 'uint128',
          },
          {
            internalType: 'uint40',
            name: 'lastUpdateTimestamp',
            type: 'uint40',
          },
          {
            internalType: 'uint16',
            name: 'id',
            type: 'uint16',
          },
          {
            internalType: 'address',
            name: 'aTokenAddress',
            type: 'address',
          },
          {
            internalType: 'address',
            name: 'stableDebtTokenAddress',
            type: 'address',
          },
          {
            internalType: 'address',
            name: 'variableDebtTokenAddress',
            type: 'address',
          },
          {
            internalType: 'address',
            name: 'interestRateStrategyAddress',
            type: 'address',
          },
          {
            internalType: 'uint128',
            name: 'accruedToTreasury',
            type: 'uint128',
          },
          {
            internalType: 'uint128',
            name: 'unbacked',
            type: 'uint128',
          },
          {
            internalType: 'uint128',
            name: 'isolationModeTotalDebt',
            type: 'uint128',
          },
        ],
        internalType: 'struct DataTypes.ReserveData',
        name: '',
        type: 'tuple',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
] as const

async function getNewATokenBalance({
  balance,
  client,
  aTokenAddress,
}: {
  client: Pick<TestnetClient, 'readContract' | 'multicall'>
  aTokenAddress: CheckedAddress
  balance: BaseUnitNumber
}): Promise<BaseUnitNumber> {
  if (balance.isZero()) {
    return balance
  }

  const [underlyingAsset, pool] = await client.multicall({
    allowFailure: false,
    contracts: [
      {
        address: aTokenAddress,
        abi: parseAbi(['function UNDERLYING_ASSET_ADDRESS() external view returns (address)']),
        functionName: 'UNDERLYING_ASSET_ADDRESS',
      },
      {
        address: aTokenAddress,
        abi: parseAbi(['function POOL() external view returns (address)']),
        functionName: 'POOL',
      },
    ],
  })

  const normalizedIncome = await client.readContract({
    address: pool,
    abi: parseAbi(['function getReserveNormalizedIncome(address asset) external view returns (uint256)']),
    functionName: 'getReserveNormalizedIncome',
    args: [underlyingAsset],
  })

  return BaseUnitNumber(balance.times(RAY()).div(bigNumberify(normalizedIncome)).toFixed(0))
}
