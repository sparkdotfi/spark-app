import { USD_MOCK_TOKEN } from '@/domain/types/Token'
import { Locator } from '@playwright/test'
import { TestnetClient } from '@sparkdotfi/common-testnets'
import { BaseUnitNumber, NormalizedNumber } from '@sparkdotfi/common-universal'
import { Address, erc20Abi, weiUnits } from 'viem'
import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts'

export interface GenerateAccountOptions {
  privateKey?: `0x${string}`
}
export function generateAccount(opts: GenerateAccountOptions): { address: `0x${string}`; privateKey: `0x${string}` } {
  const privateKey = opts.privateKey ?? generatePrivateKey()
  return {
    address: privateKeyToAccount(privateKey).address,
    privateKey,
  }
}

export async function parseTable<T>(tableLocator: Locator, parseRow: (row: string[]) => T): Promise<T[]> {
  const table: T[] = []
  const rows = await tableLocator.getByRole('row').all()
  let header = true
  for (const row of rows) {
    const cells = await row.getByRole('cell').all()
    const parsedRow = []
    for (const cell of cells) {
      parsedRow.push((await cell.textContent()) ?? '')
    }
    if (header) {
      // skip header
      header = false
      continue
    }

    table.push(parseRow(parsedRow))
  }
  return table
}

export interface GetBalanceArgs {
  client: TestnetClient
  address: Address
}

export interface GetTokenBalanceArgs extends GetBalanceArgs {
  token: {
    address: Address
    decimals: number
  }
}

export async function getBalance({ client, address }: GetBalanceArgs): Promise<NormalizedNumber> {
  const balance = await client.getBalance({ address })
  return NormalizedNumber(balance).shiftedBy(weiUnits.ether)
}

export async function getTokenBalance({ client, address, token }: GetTokenBalanceArgs): Promise<NormalizedNumber> {
  const tokenBalance = await client.readContract({
    address: token.address,
    abi: erc20Abi,
    functionName: 'balanceOf',
    args: [address],
  })

  const mockToken = USD_MOCK_TOKEN.clone({ decimals: token.decimals })
  return mockToken.fromBaseUnit(BaseUnitNumber(tokenBalance))
}
