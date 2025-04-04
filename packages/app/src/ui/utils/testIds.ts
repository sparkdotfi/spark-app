import { assert } from '@sparkdotfi/common-universal'

// @note: only allowed value here is 'true' a function or nested object
// actual value of data test id (string) is generated based on a path in the object tree
// functions are automatically prefixed with a path in the object tree
export const testIds = makeTestIds({
  component: {
    MultiAssetSelector: {
      group: true,
    },
    AssetSelector: {
      trigger: true,
      option: true,
    },
    HealthFactorBadge: {
      value: true,
    },
    HealthFactorGauge: {
      value: true,
    },
    AssetInput: {
      input: true,
      error: true,
      maxButton: true,
    },
    Alert: {
      message: true,
    },
    DataTable: {
      row: (index: number) => index,
    },
    RiskAcknowledgement: {
      switch: true,
      explanation: true,
    },
    EModeButton: true,
    EModeBadge: true,
    SuccessView: {
      content: true,
      row: (index: number) => index,
      tokenRow: {
        token: true,
        amount: true,
        amountUSD: true,
      },
    },
    AddressInput: {
      input: true,
      error: true,
    },
    ConvertStablesPanel: true,
    ConvertStablesButton: true,
    SwitchNotSupportedNetworkButton: true,
    ConnectOrSandboxCTAPanel: true,
  },
  easyBorrow: {
    form: {
      deposits: true,
      borrow: true,
      borrowRate: true,
      ltv: true,
      usdsBorrowAlert: true,
    },
    success: {
      deposited: true,
      borrowed: true,
    },
  },
  myPortfolio: {
    deposited: true,
    borrowed: true,
    depositDialog: {
      newTokenBalance: true,
      newUSDBalance: true,
    },
  },
  savings: {
    navigation: {
      container: true,
      item: true,
      itemLabel: true,
      itemBalance: true,
    },
    upgradeSDaiBanner: true,
    supportedStablecoins: {
      moreDropdown: true,
    },
    account: {
      depositCTA: {
        panel: true,
        apy: true,
      },
      mainPanel: {
        container: true,
        apy: true,
        oneYearProjection: true,
      },
      savingsToken: {
        balance: true,
        balanceInUnderlyingToken: true,
      },
    },
  },
  dialog: {
    transactionOverview: {
      routeItem: {
        tokenWithAmount: (index: number) => index,
        tokenUsdValue: (index: number) => index,
      },
      skyBadge: true,
      outcome: true,
      outcomeUsd: true,
    },
    healthFactor: {
      before: true,
      after: true,
    },
    closeButton: true,
    success: true,
    savings: {
      transactionOverview: {
        apy: {
          value: true,
          description: true,
        },
        apyChange: {
          before: true,
          after: true,
        },
      },
      send: {
        addressIsSmartContractWarning: true,
      },
      upgradeSwitch: true,
      upgradeDetailsTrigger: true,
    },
    depositSavings: {
      transactionDetailsRow: (index: number) => index,
    },
    claimRewards: {
      transactionOverview: {
        row: (index: number) => index,
        token: true,
        amount: true,
        amountUSD: true,
      },
    },
    eMode: {
      transactionOverview: {
        availableAssets: {
          category: true,
          assets: true,
        },
        maxLtv: {
          before: true,
          after: true,
        },
      },
    },
  },
  actions: {
    settings: {
      dialog: true,
    },
    row: (index: number) => index,
  },
  topbar: {
    airdrop: {
      badge: true,
      dropdown: true,
    },
    rewards: {
      badge: true,
      claimableRewards: true,
      details: {
        row: (index: number) => index,
        token: true,
        amount: true,
        amountUSD: true,
        dropdown: true,
      },
    },
  },
  markets: {
    summary: {
      tile: (index: number) => index,
    },
    table: {
      active: true,
      frozen: true,
      cell: {
        asset: true,
        totalSupplied: true,
        depositAPY: true,
        totalBorrowed: true,
        borrowAPY: true,
        status: true,
      },
    },
    frozenPill: true,
    pausedPill: true,
    rewardBadge: true,
    airdropBadge: true,
    frozenAssetsSwitch: true,
  },
  marketDetails: {
    collateralStatusPanel: {
      debt: true,
      debtCeiling: true,
    },
    walletPanel: {
      balance: true,
    },
    supplyStatusPanel: {
      cap: true,
      instantlyAvailableToSupply: true,
    },
    borrowStatusPanel: {
      cap: true,
      liquidity: true,
    },
    capAutomator: {
      cooldownTimer: true,
    },
    oraclePanel: {
      asset: true,
      price: true,
      oracleContract: true,
      providersList: true,
      yieldingFixed: {
        ratio: true,
        ratioContract: true,
        baseAssetSymbol: true,
        baseAssetPrice: true,
        baseAssetOracleContract: true,
      },
    },
  },
  farms: {
    active: {
      tile: (index: number) => index,
    },
    inactive: {
      tile: (index: number) => index,
    },
    tile: {
      apy: true,
      stakeText: true,
      rewardText: true,
      staked: true,
    },
  },
  farmDetails: {
    stakeDialog: {
      transactionOverview: {
        estimatedRewards: {
          apy: true,
          description: true,
        },
        route: {
          destination: {
            farmName: true,
            stakingToken: true,
          },
        },
        outcome: true,
        outcomeUsd: true,
      },
    },
    unstakeDialog: {
      transactionOverview: {
        route: {
          farm: {
            farmName: true,
            stakingToken: true,
          },
        },
        outcome: true,
        outcomeUsd: true,
        rewardOutcome: true,
        rewardOutcomeUsd: true,
      },
      exitFarmSwitchPanel: {
        switch: true,
        reward: true,
      },
    },
    claimDialog: {
      transactionOverview: {
        rewardTokenSymbol: true,
        rewardTokenDescription: true,
        rewardAmount: true,
        rewardAmountUSD: true,
      },
    },
    infoPanel: {
      panel: true,
      stakeButton: true,
    },
    activeFarmInfoPanel: {
      rewards: true,
      rewardsUsd: true,
      unstakeButton: true,
      claimButton: true,
      staked: true,
      pointsSyncWarning: true,
    },
  },
  sparkRewards: {
    claimableRewardsPanel: {
      amountToClaim: true,
    },
    ongoingCampaignsPanel: {
      row: (index: number) => index,
      startButton: true,
    },
  },
  spkStaking: {
    ctaPanel: {
      stakeButton: true,
    },
    rewardsPanel: {
      staked: true,
    },
    stakeDialog: {
      transactionOverview: {
        estimatedRewards: {
          apy: true,
          description: true,
        },
        unstakingDelay: true,
      },
    },
  },
})

function makeTestIds<T extends Object>(obj: T, prefix?: string): MapValuesToString<T> {
  return Object.fromEntries(
    Object.entries(obj).map(([key, value]) => {
      const newPrefix = prefix ? `${prefix}-${key}` : key
      if (typeof value === 'object') {
        return [key, makeTestIds(value, newPrefix)]
      }
      if (typeof value === 'function') {
        return [key, (...args: any) => `${newPrefix}-${value(...args)}`]
      }
      assert(value === true, "testIds value map has to be 'true', a function or another nested object")
      return [key, newPrefix]
    }),
  ) as any
}

type MapValuesToString<T> = {
  [K in keyof T]: T[K] extends boolean
    ? string
    : T[K] extends (...args: any[]) => any
      ? (...args: Parameters<T[K]>) => string
      : MapValuesToString<T[K]>
}
