'use client';

import { useState } from 'react';
import { useReadContract, useChainId, useAccount } from 'wagmi';
import { CONTRACT_ADDRESSES, JAYDE_MARKETPLACE_ABI, type ContractAddresses } from '@/lib/contracts';
import ListingCard, { type Listing } from '@/components/ListingCard';
import CreateListing from '@/components/CreateListing';
import WrongNetworkBanner from '@/components/WrongNetworkBanner';

export default function MarketplacePage() {
  const chainId   = useChainId();
  const addresses = CONTRACT_ADDRESSES[chainId as keyof typeof CONTRACT_ADDRESSES];
  const [showCreate, setShowCreate] = useState(false);

  const { data: listingCount } = useReadContract({
    address: addresses?.jaydeMarketplace,
    abi: JAYDE_MARKETPLACE_ABI,
    functionName: 'listingCount',
    query: { enabled: !!addresses?.jaydeMarketplace },
  });

  const count = Number(listingCount ?? 0n);

  if (!addresses) return <WrongNetworkBanner />;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      {/* Header */}
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Marketplace</h1>
          <p className="mt-1 text-sm text-slate-400">
            {count > 0 ? `${count} listing${count !== 1 ? 's' : ''}` : 'No listings yet — be the first!'}
          </p>
        </div>
        <button
          onClick={() => setShowCreate((v) => !v)}
          className="rounded-xl bg-[#0d9488] px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-[#0d9488]/20 transition hover:bg-[#0f766e] active:scale-95"
        >
          {showCreate ? 'Cancel' : '+ New Listing'}
        </button>
      </div>

      {/* Create listing form */}
      {showCreate && (
        <div className="mb-10 max-w-lg" id="create">
          <CreateListing onSuccess={() => setShowCreate(false)} />
        </div>
      )}

      {/* Listings grid */}
      {count === 0 ? (
        <EmptyState />
      ) : (
        <ListingsGrid count={count} addresses={addresses} />
      )}
    </div>
  );
}

function ListingsGrid({
  count,
  addresses,
}: {
  count: number;
  addresses: ContractAddresses;
}) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: count }, (_, i) => i + 1).map((id) => (
        <ListingItem key={id} listingId={BigInt(id)} addresses={addresses} />
      ))}
    </div>
  );
}

function ListingItem({
  listingId,
  addresses,
}: {
  listingId: bigint;
  addresses: ContractAddresses;
}) {
  const { address } = useAccount();
  const [cancelled, setCancelled] = useState(false);

  const { data } = useReadContract({
    address: addresses?.jaydeMarketplace,
    abi: JAYDE_MARKETPLACE_ABI,
    functionName: 'listings',
    args: [listingId],
    query: { enabled: !!addresses?.jaydeMarketplace },
  });

  if (!data) return <ListingCardSkeleton />;

  const [id, seller, title, price, ipfsHash, isActive] = data;
  if (!isActive || cancelled) return null;

  const listing: Listing = { id, seller, title, price, ipfsHash, isActive };
  return (
    <ListingCard
      listing={listing}
      connectedAddress={address}
      marketplaceAddress={addresses?.jaydeMarketplace}
      onCancelled={() => setCancelled(true)}
    />
  );
}

function ListingCardSkeleton() {
  return (
    <div className="animate-pulse rounded-2xl border border-slate-700/60 bg-[#1e293b]">
      <div className="h-44 rounded-t-2xl bg-slate-700/50" />
      <div className="p-4 space-y-3">
        <div className="h-4 w-3/4 rounded bg-slate-700" />
        <div className="h-3 w-1/2 rounded bg-slate-700" />
        <div className="h-5 w-1/3 rounded bg-slate-700 mt-4" />
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="mb-4 text-6xl opacity-20">🏪</div>
      <p className="text-lg font-semibold text-slate-400">No active listings</p>
      <p className="mt-1 text-sm text-slate-500">Connect your wallet and create the first one!</p>
    </div>
  );
}
