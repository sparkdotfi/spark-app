import { assert, CheckedAddress, Hash } from '@sparkdotfi/common-universal'
import { encodeAbiParameters, keccak256, toHex } from 'viem'
import { TestnetClient } from '../TestnetClient.js'

interface ReplaceSafeOwnerArgs {
  client: TestnetClient
  safeAddress: CheckedAddress
  newOwner: CheckedAddress
  indexToReplace?: number
}

export async function replaceSafeOwner(args: ReplaceSafeOwnerArgs): Promise<void> {
  const { client, safeAddress, newOwner, indexToReplace = 0 } = args

  const owners = await getSafeOwners({ client, safeAddress })
  assert(owners.length > indexToReplace, `Index to replace is out of bounds. Safe has only ${owners.length} owners.`)

  await client.setStorageAt(
    safeAddress,
    getOwnerSlot(owners[indexToReplace - 1] ?? sentinel),
    toHex(BigInt(newOwner), { size: 32 }),
  )
  await client.setStorageAt(
    safeAddress,
    getOwnerSlot(newOwner),
    toHex(BigInt(CheckedAddress(owners[indexToReplace + 1] ?? sentinel)), { size: 32 }),
  )
}

interface GetSafeOwnersArgs {
  client: TestnetClient
  safeAddress: CheckedAddress
}

export async function getSafeOwners({ client, safeAddress }: GetSafeOwnersArgs): Promise<CheckedAddress[]> {
  const owners = await client.readContract({
    address: safeAddress,
    abi: safeAbi,
    functionName: 'getOwners',
  })

  return owners.map(CheckedAddress)
}

const sentinel = CheckedAddress('0x0000000000000000000000000000000000000001')

function getOwnerSlot(prevOwner: CheckedAddress): Hash {
  const encodedKeySlot = encodeAbiParameters([{ type: 'address' }, { type: 'uint256' }], [prevOwner, 2n])
  return Hash(keccak256(encodedKeySlot))
}

const safeAbi = [
  {
    constant: true,
    inputs: [],
    name: 'getOwners',
    outputs: [
      {
        internalType: 'address[]',
        name: '',
        type: 'address[]',
      },
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
] as const
