import { baseSepolia, hardhat } from './wagmi';

// ─── Validation ──────────────────────────────────────────────────────────────

const ADDRESS_RE = /^0x[0-9a-fA-F]{40}$/;

// Accepts the env var name and its pre-read value (caller must use dot-notation
// to read process.env so Next.js webpack can inline NEXT_PUBLIC_* at build time).
export function requireAddress(name: string, val: string | undefined): `0x${string}` {
  if (!val || !ADDRESS_RE.test(val)) {
    throw new Error(
      `Env var ${name} must be a valid Ethereum address (^0x[0-9a-fA-F]{40}$), got: ${val ?? 'undefined'}`,
    );
  }
  return val as `0x${string}`;
}

// ─── Addresses ──────────────────────────────────────────────────────────────

type AddressSet = {
  jaydeToken:       `0x${string}`;
  jaydeEscrow:      `0x${string}`;
  jaydeMarketplace: `0x${string}`;
};

const _addrs: Record<number, AddressSet> = {
  [baseSepolia.id]: {
    jaydeToken:       requireAddress('NEXT_PUBLIC_TOKEN_ADDRESS',       process.env.NEXT_PUBLIC_TOKEN_ADDRESS),
    jaydeEscrow:      requireAddress('NEXT_PUBLIC_ESCROW_ADDRESS',      process.env.NEXT_PUBLIC_ESCROW_ADDRESS),
    jaydeMarketplace: requireAddress('NEXT_PUBLIC_MARKETPLACE_ADDRESS', process.env.NEXT_PUBLIC_MARKETPLACE_ADDRESS),
  },
};

if (process.env.NODE_ENV === 'development') {
  _addrs[hardhat.id] = {
    jaydeToken:       '0x5FbDB2315678afecb367f032d93F642f64180aa3',
    jaydeEscrow:      '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512',
    jaydeMarketplace: '0x',
  };
}

export const CONTRACT_ADDRESSES = _addrs;

export type ContractAddresses = AddressSet | undefined;

// ─── ABIs ────────────────────────────────────────────────────────────────────

export const JAYDE_TOKEN_ABI = [
  { inputs: [{ name: 'owner', type: 'address' }], name: 'balanceOf', outputs: [{ name: '', type: 'uint256' }], stateMutability: 'view', type: 'function' },
  { inputs: [{ name: 'spender', type: 'address' }, { name: 'value', type: 'uint256' }], name: 'approve', outputs: [{ name: '', type: 'bool' }], stateMutability: 'nonpayable', type: 'function' },
  { inputs: [{ name: 'owner', type: 'address' }, { name: 'spender', type: 'address' }], name: 'allowance', outputs: [{ name: '', type: 'uint256' }], stateMutability: 'view', type: 'function' },
  { inputs: [], name: 'totalSupply', outputs: [{ name: '', type: 'uint256' }], stateMutability: 'view', type: 'function' },
  { inputs: [], name: 'decimals', outputs: [{ name: '', type: 'uint8' }], stateMutability: 'view', type: 'function' },
  { inputs: [], name: 'symbol', outputs: [{ name: '', type: 'string' }], stateMutability: 'view', type: 'function' },
  { inputs: [{ name: 'to', type: 'address' }, { name: 'value', type: 'uint256' }], name: 'transfer', outputs: [{ name: '', type: 'bool' }], stateMutability: 'nonpayable', type: 'function' },
  { inputs: [{ name: 'from', type: 'address' }, { name: 'to', type: 'address' }, { name: 'value', type: 'uint256' }], name: 'transferFrom', outputs: [{ name: '', type: 'bool' }], stateMutability: 'nonpayable', type: 'function' },
] as const;

export const JAYDE_MARKETPLACE_ABI = [
  // ── read ────────────────────────────────────────────────────────────────
  { inputs: [], name: 'listingCount', outputs: [{ name: '', type: 'uint256' }], stateMutability: 'view', type: 'function' },
  { inputs: [], name: 'purchaseCount', outputs: [{ name: '', type: 'uint256' }], stateMutability: 'view', type: 'function' },
  {
    inputs: [{ name: '', type: 'uint256' }],
    name: 'listings',
    outputs: [
      { name: 'id',       type: 'uint256' },
      { name: 'seller',   type: 'address' },
      { name: 'title',    type: 'string'  },
      { name: 'price',    type: 'uint256' },
      { name: 'ipfsHash', type: 'string'  },
      { name: 'isActive', type: 'bool'    },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: '', type: 'uint256' }],
    name: 'purchases',
    outputs: [
      { name: 'listingId',     type: 'uint256' },
      { name: 'buyer',         type: 'address' },
      { name: 'escrowTradeId', type: 'uint256' },
      { name: 'released',      type: 'bool'    },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  // ── write ───────────────────────────────────────────────────────────────
  {
    inputs: [{ name: 'title', type: 'string' }, { name: 'price', type: 'uint256' }, { name: 'ipfsHash', type: 'string' }],
    name: 'createListing',
    outputs: [{ name: 'listingId', type: 'uint256' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  { inputs: [{ name: 'listingId', type: 'uint256' }], name: 'deactivateListing', outputs: [], stateMutability: 'nonpayable', type: 'function' },
  { inputs: [{ name: 'listingId', type: 'uint256' }], name: 'purchaseListing',   outputs: [{ name: 'purchaseId', type: 'uint256' }], stateMutability: 'nonpayable', type: 'function' },
  { inputs: [{ name: 'purchaseId', type: 'uint256' }], name: 'confirmDelivery',  outputs: [], stateMutability: 'nonpayable', type: 'function' },
  { inputs: [{ name: 'purchaseId', type: 'uint256' }], name: 'requestRefund',    outputs: [], stateMutability: 'nonpayable', type: 'function' },
  { inputs: [{ name: 'purchaseId', type: 'uint256' }], name: 'disputePurchase',  outputs: [], stateMutability: 'nonpayable', type: 'function' },
  // ── events ──────────────────────────────────────────────────────────────
  {
    anonymous: false,
    inputs: [
      { indexed: true,  name: 'listingId', type: 'uint256' },
      { indexed: true,  name: 'seller',    type: 'address' },
      { indexed: false, name: 'title',     type: 'string'  },
      { indexed: false, name: 'price',     type: 'uint256' },
      { indexed: false, name: 'ipfsHash',  type: 'string'  },
    ],
    name: 'ListingCreated',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true,  name: 'listingId',     type: 'uint256' },
      { indexed: true,  name: 'purchaseId',    type: 'uint256' },
      { indexed: true,  name: 'buyer',         type: 'address' },
      { indexed: false, name: 'escrowTradeId', type: 'uint256' },
    ],
    name: 'ListingPurchased',
    type: 'event',
  },
] as const;

export const JAYDE_ESCROW_ABI = [
  { inputs: [], name: 'feeBps',    outputs: [{ name: '', type: 'uint256' }], stateMutability: 'view', type: 'function' },
  { inputs: [], name: 'tradeCount', outputs: [{ name: '', type: 'uint256' }], stateMutability: 'view', type: 'function' },
  {
    inputs: [{ name: '', type: 'uint256' }],
    name: 'trades',
    outputs: [
      { name: 'buyer',  type: 'address' },
      { name: 'seller', type: 'address' },
      { name: 'amount', type: 'uint256' },
      { name: 'feeBps', type: 'uint256' },
      { name: 'status', type: 'uint8'   },
    ],
    stateMutability: 'view',
    type: 'function',
  },
] as const;
