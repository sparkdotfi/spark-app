import { BaseUnitNumber, CheckedAddress } from '@sparkdotfi/common-universal'
import { expect } from 'earl'
import { isAddressEqual, parseEther } from 'viem'
import { mainnet } from 'viem/chains'
import { TestnetClient } from '../TestnetClient.js'
import { createTestnetFactoriesForE2ETests } from '../test-utils/createTestnetFactoriesForE2ETests.js'
import { setATokenBalance, setAaveUsingAsCollateral } from './aave.js'

const wstETH = CheckedAddress('0x7f39C581F595B53c5cb19bD0b3f8dA6c935E2Ca0')
const spwstETH = CheckedAddress('0x12B54025C112Aa61fAce2CDB7118740875A566E9')
const account = CheckedAddress.random('alice')

const factories = createTestnetFactoriesForE2ETests()

for (const factory of factories.slice(0, 1)) {
  describe(`${factory.constructor.name} aave helpers`, () => {
    let testnetClient: TestnetClient
    let cleanup: () => Promise<void>

    before(async () => {
      ;({ client: testnetClient, cleanup } = await factory.create({
        id: 'test',
        originChain: mainnet,
        forkChainId: 1,
        blockNumber: 21439277n,
      }))
      await testnetClient.baselineSnapshot()
    })
    after(async () => {
      await cleanup()
    })
    beforeEach(async () => {
      await testnetClient.revertToBaseline()
    })

    it(setATokenBalance.name, async () => {
      const reservesBefore = await getUserReservesData({ testnetClient, account })
      expect(reservesBefore).toEqual(modifyReservesSnapshot(wstETH, 'scaledATokenBalance', 0n))

      const newBalance = BaseUnitNumber(parseEther('1'))
      const expectedScaledATokenBalance = 999959801482089561n // just a snapshot

      await setATokenBalance({
        client: testnetClient,
        aTokenAddress: spwstETH,
        account,
        balance: newBalance,
      })

      const reservesAfter = await getUserReservesData({ testnetClient, account })
      expect(reservesAfter).toEqual(modifyReservesSnapshot(wstETH, 'scaledATokenBalance', expectedScaledATokenBalance))
    })

    it(setAaveUsingAsCollateral.name, async () => {
      const reservesBefore = await getUserReservesData({ testnetClient, account })
      expect(reservesBefore).toEqual(modifyReservesSnapshot(wstETH, 'usageAsCollateralEnabledOnUser', false))

      await setAaveUsingAsCollateral({
        client: testnetClient,
        lendingPoolAddress,
        tokenAddress: wstETH,
        account,
        usingAsCollateral: true,
      })

      const reservesAfterEnabling = await getUserReservesData({ testnetClient, account })
      expect(reservesAfterEnabling).toEqual(modifyReservesSnapshot(wstETH, 'usageAsCollateralEnabledOnUser', true))

      await setAaveUsingAsCollateral({
        client: testnetClient,
        lendingPoolAddress,
        tokenAddress: wstETH,
        account,
        usingAsCollateral: false,
      })

      const reservesAfterDisabling = await getUserReservesData({ testnetClient, account })
      expect(reservesAfterDisabling).toEqual(modifyReservesSnapshot(wstETH, 'usageAsCollateralEnabledOnUser', false))
    })
  })
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
async function getUserReservesData({
  testnetClient,
  account,
}: { testnetClient: TestnetClient; account: CheckedAddress }) {
  const [userReservesData] = await testnetClient.readContract({
    address: CheckedAddress(uiPoolDataProviderAddress),
    abi: uiPoolDataProviderAbi,
    functionName: 'getUserReservesData',
    args: [lendingPoolAddressProviderAddress, account],
  })

  return userReservesData
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function modifyReservesSnapshot<K extends keyof (typeof userReservesSnapshot)[number]>(
  asset: CheckedAddress,
  field: K,
  value: (typeof userReservesSnapshot)[number][K],
) {
  return userReservesSnapshot.map((reserve) => {
    const underlyingAsset = CheckedAddress(reserve.underlyingAsset)
    if (isAddressEqual(underlyingAsset, asset)) {
      return {
        ...reserve,
        underlyingAsset,
        [field]: value,
      }
    }
    return {
      ...reserve,
      underlyingAsset,
    }
  })
}

const userReservesSnapshot = [
  {
    underlyingAsset: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
    scaledATokenBalance: 0n,
    usageAsCollateralEnabledOnUser: false,
    stableBorrowRate: 0n,
    scaledVariableDebt: 0n,
    principalStableDebt: 0n,
    stableBorrowLastUpdateTimestamp: 0n,
  },
  {
    underlyingAsset: '0x83F20F44975D03b1b09e64809B757c47f942BEeA',
    scaledATokenBalance: 0n,
    usageAsCollateralEnabledOnUser: false,
    stableBorrowRate: 0n,
    scaledVariableDebt: 0n,
    principalStableDebt: 0n,
    stableBorrowLastUpdateTimestamp: 0n,
  },
  {
    underlyingAsset: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    scaledATokenBalance: 0n,
    usageAsCollateralEnabledOnUser: false,
    stableBorrowRate: 0n,
    scaledVariableDebt: 0n,
    principalStableDebt: 0n,
    stableBorrowLastUpdateTimestamp: 0n,
  },
  {
    underlyingAsset: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
    scaledATokenBalance: 0n,
    usageAsCollateralEnabledOnUser: false,
    stableBorrowRate: 0n,
    scaledVariableDebt: 0n,
    principalStableDebt: 0n,
    stableBorrowLastUpdateTimestamp: 0n,
  },
  {
    underlyingAsset: '0x7f39C581F595B53c5cb19bD0b3f8dA6c935E2Ca0',
    scaledATokenBalance: 0n,
    usageAsCollateralEnabledOnUser: false,
    stableBorrowRate: 0n,
    scaledVariableDebt: 0n,
    principalStableDebt: 0n,
    stableBorrowLastUpdateTimestamp: 0n,
  },
  {
    underlyingAsset: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
    scaledATokenBalance: 0n,
    usageAsCollateralEnabledOnUser: false,
    stableBorrowRate: 0n,
    scaledVariableDebt: 0n,
    principalStableDebt: 0n,
    stableBorrowLastUpdateTimestamp: 0n,
  },
  {
    underlyingAsset: '0x6810e776880C02933D47DB1b9fc05908e5386b96',
    scaledATokenBalance: 0n,
    usageAsCollateralEnabledOnUser: false,
    stableBorrowRate: 0n,
    scaledVariableDebt: 0n,
    principalStableDebt: 0n,
    stableBorrowLastUpdateTimestamp: 0n,
  },
  {
    underlyingAsset: '0xae78736Cd615f374D3085123A210448E74Fc6393',
    scaledATokenBalance: 0n,
    usageAsCollateralEnabledOnUser: false,
    stableBorrowRate: 0n,
    scaledVariableDebt: 0n,
    principalStableDebt: 0n,
    stableBorrowLastUpdateTimestamp: 0n,
  },
  {
    underlyingAsset: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
    scaledATokenBalance: 0n,
    usageAsCollateralEnabledOnUser: false,
    stableBorrowRate: 0n,
    scaledVariableDebt: 0n,
    principalStableDebt: 0n,
    stableBorrowLastUpdateTimestamp: 0n,
  },
  {
    underlyingAsset: '0xCd5fE23C85820F7B72D0926FC9b05b43E359b7ee',
    scaledATokenBalance: 0n,
    usageAsCollateralEnabledOnUser: false,
    stableBorrowRate: 0n,
    scaledVariableDebt: 0n,
    principalStableDebt: 0n,
    stableBorrowLastUpdateTimestamp: 0n,
  },
  {
    underlyingAsset: '0xcbB7C0000aB88B473b1f5aFd9ef808440eed33Bf',
    scaledATokenBalance: 0n,
    usageAsCollateralEnabledOnUser: false,
    stableBorrowRate: 0n,
    scaledVariableDebt: 0n,
    principalStableDebt: 0n,
    stableBorrowLastUpdateTimestamp: 0n,
  },
  {
    underlyingAsset: '0xa3931d71877C0E7a3148CB7Eb4463524FEc27fbD',
    scaledATokenBalance: 0n,
    usageAsCollateralEnabledOnUser: false,
    stableBorrowRate: 0n,
    scaledVariableDebt: 0n,
    principalStableDebt: 0n,
    stableBorrowLastUpdateTimestamp: 0n,
  },
]

const uiPoolDataProviderAbi = [
  {
    type: 'function',
    inputs: [
      {
        name: 'provider',
        internalType: 'contract IPoolAddressesProvider',
        type: 'address',
      },
      { name: 'user', internalType: 'address', type: 'address' },
    ],
    name: 'getUserReservesData',
    outputs: [
      {
        name: '',
        internalType: 'struct IUiPoolDataProviderV3.UserReserveData[]',
        type: 'tuple[]',
        components: [
          { name: 'underlyingAsset', internalType: 'address', type: 'address' },
          {
            name: 'scaledATokenBalance',
            internalType: 'uint256',
            type: 'uint256',
          },
          {
            name: 'usageAsCollateralEnabledOnUser',
            internalType: 'bool',
            type: 'bool',
          },
          {
            name: 'stableBorrowRate',
            internalType: 'uint256',
            type: 'uint256',
          },
          {
            name: 'scaledVariableDebt',
            internalType: 'uint256',
            type: 'uint256',
          },
          {
            name: 'principalStableDebt',
            internalType: 'uint256',
            type: 'uint256',
          },
          {
            name: 'stableBorrowLastUpdateTimestamp',
            internalType: 'uint256',
            type: 'uint256',
          },
        ],
      },
      { name: '', internalType: 'uint8', type: 'uint8' },
    ],
    stateMutability: 'view',
  },
] as const

const uiPoolDataProviderAddress = CheckedAddress('0xF028c2F4b19898718fD0F77b9b881CbfdAa5e8Bb')
const lendingPoolAddressProviderAddress = CheckedAddress('0x02C3eA4e34C0cBd694D2adFa2c690EECbC1793eE')
const lendingPoolAddress = CheckedAddress('0xC13e21B648A5Ee794902342038FF3aDAB66BE987')
