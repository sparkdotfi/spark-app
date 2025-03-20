import { defineConfig } from '@wagmi/cli'
import { etherscan } from '@wagmi/cli/plugins'
import { arbitrum, base, gnosis, mainnet } from 'wagmi/chains'
import { z } from 'zod'
import 'dotenv/config'

export default defineConfig({
  out: 'src/config/contracts-generated.ts',
  contracts: [],
  plugins: [
    etherscan({
      apiKey: z.string().parse(process.env.ETHERSCAN_API_KEY, {
        errorMap: () => ({
          message: "Couldn't process ETHERSCAN_API_KEY env variable",
        }),
      }),
      chainId: mainnet.id,
      contracts: [
        {
          name: 'LendingPoolAddressProvider',
          address: {
            [mainnet.id]: '0x02C3eA4e34C0cBd694D2adFa2c690EECbC1793eE',
            [gnosis.id]: '0xA98DaCB3fC964A6A0d2ce3B77294241585EAbA6d',
          },
        },
        {
          name: 'LendingPool',
          address: {
            [mainnet.id]: '0xC13e21B648A5Ee794902342038FF3aDAB66BE987',
            [gnosis.id]: '0x2Dae5307c5E3FD1CF5A72Cb6F698f915860607e0',
          },
        },
        {
          name: 'WETHGateway',
          address: {
            [mainnet.id]: '0xBD7D6a9ad7865463DE44B05F04559f65e3B11704',
            [gnosis.id]: '0xBD7D6a9ad7865463DE44B05F04559f65e3B11704',
          },
        },
        {
          name: 'WalletBalanceProvider',
          address: {
            [mainnet.id]: '0xd2AeF86F51F92E8e49F42454c287AE4879D1BeDc',
            [gnosis.id]: '0xd2AeF86F51F92E8e49F42454c287AE4879D1BeDc',
          },
        },
        {
          name: 'UiPoolDataProvider',
          address: {
            [mainnet.id]: '0xF028c2F4b19898718fD0F77b9b881CbfdAa5e8Bb',
            [gnosis.id]: '0xF028c2F4b19898718fD0F77b9b881CbfdAa5e8Bb',
          },
        },
        {
          name: 'UiIncentiveDataProvider',
          address: {
            [mainnet.id]: '0xA7F8A757C4f7696c015B595F51B2901AC0121B18',
            [gnosis.id]: '0xA7F8A757C4f7696c015B595F51B2901AC0121B18',
          },
        },
        {
          name: 'Collector',
          address: {
            [mainnet.id]: '0xb137E7d16564c81ae2b0C8ee6B55De81dd46ECe5',
            [gnosis.id]: '0xb9E6DBFa4De19CCed908BcbFe1d015190678AB5f',
          },
        },
        {
          name: 'Chainlog',
          address: {
            [mainnet.id]: '0xdA0Ab1e0017DEbCd72Be8599041a2aa3bA7e740F',
          },
        },
        {
          name: 'SavingsDai',
          address: {
            [mainnet.id]: '0x83f20f44975d03b1b09e64809b757c47f942beea',
          },
        },
        {
          name: 'V3Migrator',
          address: {
            [mainnet.id]: '0xe2a3C1ff038E14d401cA6dE0673a598C33168460',
          },
        },
        {
          name: 'Vat',
          address: {
            [mainnet.id]: '0x35D1b3F3D7966A1DFe207aa4514C12a259A0492B',
          },
        },
        {
          name: 'IAMAutoLine',
          address: {
            [mainnet.id]: '0xC7Bdd1F2B16447dcf3dE045C4a039A60EC2f0ba3',
          },
        },
        {
          name: 'Pot',
          address: {
            [mainnet.id]: '0x197E90f9FAD81970bA7976f33CbD77088E5D7cf7',
          },
        },
        {
          name: 'PSMActions',
          address: {
            [mainnet.id]: '0x5803199F1085d52D1Bb527f24Dc1A2744e80A979',
          },
        },
        {
          name: 'CapAutomator',
          address: {
            [mainnet.id]: '0x2276f52afba7Cf2525fd0a050DF464AC8532d0ef',
          },
        },
        {
          name: 'UsdsPsmWrapper',
          address: {
            [mainnet.id]: '0xA188EEC8F81263234dA3622A406892F3D630f98c',
          },
        },
        {
          name: 'DssLitePsm',
          address: {
            [mainnet.id]: '0xf6e72Db5454dd049d0788e411b06CfAF16853042',
          },
        },
        {
          name: 'MigrationActions',
          address: {
            [mainnet.id]: '0xf86141a5657Cf52AEB3E30eBccA5Ad3a8f714B89',
          },
        },
        {
          name: 'UsdsPsmActions',
          address: {
            [mainnet.id]: '0xd0A61F2963622e992e6534bde4D52fd0a89F39E0',
          },
        },
        {
          name: 'UsdcVault',
          address: {
            [mainnet.id]: '0xBc65ad17c5C0a2A4D159fa5a503f4992c7B545FE',
            [base.id]: '0x3128a0F7f0ea68E7B7c9B00AFa7E41045828e858',
            [arbitrum.id]: '0x940098b108fB7D0a7E374f6eDED7760787464609',
          },
        },
        {
          name: 'SparkRewards',
          address: {
            [mainnet.id]: '0xaf76856f788519704a9411839614e144fed52d8a',
          },
        },
        {
          name: 'TestSparkStaking',
          address: {
            [mainnet.id]: '0xA9147782Eb5732039b0Cf270e7B98f27b6ecd876',
          },
        },
      ],
    }),
    etherscan({
      apiKey: z.string().parse(process.env.GNOSISCAN_API_KEY, {
        errorMap: () => ({
          message: "Couldn't process GNOSISCAN_API_KEY env variable",
        }),
      }),
      chainId: gnosis.id,
      contracts: [
        {
          name: 'SavingsXDaiAdapter',
          address: {
            [gnosis.id]: '0xD499b51fcFc66bd31248ef4b28d656d67E591A94',
          },
        },
        {
          name: 'SavingsXDai',
          address: {
            [gnosis.id]: '0xaf204776c7245bF4147c2612BF6e5972Ee483701',
          },
        },
      ],
    }),
    etherscan({
      apiKey: z.string().parse(process.env.BASESCAN_API_KEY, {
        errorMap: () => ({
          message: "Couldn't process BASESCAN_API_KEY env variable",
        }),
      }),
      chainId: base.id,
      contracts: [
        {
          name: 'SSRAuthOracle',
          address: {
            [base.id]: '0x65d946e533748A998B1f0E430803e39A6388f7a1',
            [arbitrum.id]: '0xEE2816c1E1eed14d444552654Ed3027abC033A36',
          },
        },
        {
          name: 'Psm3',
          address: {
            [base.id]: '0x1601843c5E9bC251A3272907010AFa41Fa18347E',
            [arbitrum.id]: '0x2B05F8e1cACC6974fD79A673a341Fe1f58d27266',
          },
        },
      ],
    }),
  ],
})
