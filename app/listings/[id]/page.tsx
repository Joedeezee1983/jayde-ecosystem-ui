'use client';

import { use } from 'react';
import { useReadContract, useWriteContract, useWaitForTransactionReceipt, useChainId, useAccount } from 'wagmi';
import { formatUnits } from 'viem';
import { CONTRACT_ADDRESSES, JAYDE_MARKETPLACE_ABI, JAYDE_TOKEN_ABI } from '@/lib/contracts';

export default function ListingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const listingId = BigInt(id);

  const chainId   = useChainId();
  const { address, isConnected } = useAccount();
  const addresses = CONTRACT_ADDRESSES[chainId as keyof typeof CONTRACT_ADDRESSES];

  const { data, isLoading } = useReadContract({
    address: addresses?.jaydeMarketplace,
    abi: JAYDE_MARKETPLACE_ABI,
    functionName: 'listings',
    args: [listingId],
    query: { enabled: !!addresses?.jaydeMarketplace },
  });

  const { data: allowance } = useReadContract({
    address: addresses?.jaydeToken,
    abi: JAYDE_TOKEN_ABI,
    functionName: 'allowance',
    args: address && addresses?.jaydeMarketplace ? [address, addresses.jaydeMarketplace] : undefined,
    query: { enabled: isConnected && !!address && !!addresses },
  });

  const { writeContract: approve, isPending: isApproving, data: approveTx } = useWriteContract();
  const { isLoading: isApproveConfirming } = useWaitForTransactionReceipt({ hash: approveTx });

  const { writeContract: purchase, isPending: isPurchasing, data: purchaseTx } = useWriteContract();
  const { isLoading: isPurchaseConfirming, isSuccess: purchased } = useWaitForTransactionReceipt({ hash: purchaseTx });

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <div className="animate-pulse space-y-4 rounded-2xl bg-[#1e293b] p-8">
          <div className="h-8 w-2/3 rounded bg-slate-700" />
          <div className="h-4 w-1/2 rounded bg-slate-700" />
          <div className="h-64 rounded-xl bg-slate-700" />
        </div>
      </div>
    );
  }

  if (!data) return <NotFound />;

  const [, seller, title, price, ipfsHash, isActive] = data;
  const priceFormatted = Number(formatUnits(price, 18)).toLocaleString(undefined, { maximumFractionDigits: 4 });
  const isSeller = address?.toLowerCase() === seller.toLowerCase();
  const needsApproval = allowance == null || allowance < price;

  function handleApprove() {
    if (!addresses?.jaydeToken || !addresses?.jaydeMarketplace) return;
    approve({
      address: addresses.jaydeToken,
      abi: JAYDE_TOKEN_ABI,
      functionName: 'approve',
      args: [addresses.jaydeMarketplace, price],
    });
  }

  function handlePurchase() {
    if (!addresses?.jaydeMarketplace) return;
    purchase({
      address: addresses.jaydeMarketplace,
      abi: JAYDE_MARKETPLACE_ABI,
      functionName: 'purchaseListing',
      args: [listingId],
    });
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <div className="rounded-2xl border border-slate-700/60 bg-[#1e293b] overflow-hidden">
        {/* Image placeholder */}
        <div className="flex h-64 items-center justify-center bg-slate-800/60">
          <span className="text-7xl opacity-20">🖼️</span>
        </div>

        <div className="p-6 space-y-4">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <h1 className="text-2xl font-extrabold text-white">{title}</h1>
            {!isActive && (
              <span className="rounded-full bg-slate-700 px-3 py-1 text-xs font-medium text-slate-400">
                Sold / Inactive
              </span>
            )}
          </div>

          <p className="text-sm text-slate-400">
            Sold by <span className="font-mono text-slate-300">{seller}</span>
          </p>

          {ipfsHash && (
            <p className="text-sm text-slate-500 font-mono">IPFS: {ipfsHash}</p>
          )}

          <div className="flex items-baseline gap-2 pt-2">
            <span className="text-3xl font-extrabold text-[#0d9488]">{priceFormatted}</span>
            <span className="text-base font-semibold text-slate-400">JAYDE</span>
          </div>

          {/* Action buttons */}
          {isConnected && isActive && !isSeller && (
            <div className="flex flex-col gap-3 pt-2">
              {needsApproval ? (
                <button
                  onClick={handleApprove}
                  disabled={isApproving || isApproveConfirming}
                  className="rounded-xl bg-slate-700 py-3 text-sm font-semibold text-white transition hover:bg-slate-600 disabled:opacity-50"
                >
                  {isApproving ? 'Confirm in wallet…' : isApproveConfirming ? 'Approving…' : `Approve ${priceFormatted} JAYDE`}
                </button>
              ) : (
                <button
                  onClick={handlePurchase}
                  disabled={isPurchasing || isPurchaseConfirming || purchased}
                  className="rounded-xl bg-[#0d9488] py-3 text-sm font-semibold text-white shadow-md shadow-[#0d9488]/20 transition hover:bg-[#0f766e] disabled:opacity-50"
                >
                  {isPurchasing ? 'Confirm in wallet…' : isPurchaseConfirming ? 'Confirming…' : purchased ? 'Purchased!' : 'Buy Now'}
                </button>
              )}
              {purchased && (
                <p className="text-sm font-medium text-[#0d9488]">
                  Purchase confirmed! Check My Profile for status.
                </p>
              )}
            </div>
          )}

          {!isConnected && (
            <p className="pt-2 text-sm text-slate-400">Connect your wallet to purchase.</p>
          )}

          {isSeller && (
            <p className="pt-2 text-sm text-slate-500">This is your listing.</p>
          )}
        </div>
      </div>
    </div>
  );
}

function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-32 text-center">
      <div className="text-6xl opacity-20 mb-4">🔍</div>
      <p className="text-lg font-semibold text-slate-400">Listing not found</p>
    </div>
  );
}
