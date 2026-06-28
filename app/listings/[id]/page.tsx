'use client';

import { use, useState } from 'react';
import { useReadContract, useWriteContract, useWaitForTransactionReceipt, useChainId, useAccount } from 'wagmi';
import { formatUnits } from 'viem';
import { CONTRACT_ADDRESSES, JAYDE_MARKETPLACE_ABI, JAYDE_TOKEN_ABI } from '@/lib/contracts';
import WrongNetworkBanner from '@/components/WrongNetworkBanner';
import TxConfirmModal, { type TxPreview } from '@/components/TxConfirmModal';
import CancelListingButton from '@/components/CancelListingButton';
import { captureError } from '@/lib/monitoring';

interface TxPending {
  preview: TxPreview;
  execute: () => void;
}

export default function ListingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  // Parse before hooks but store null on failure; guards fire after all hooks.
  let listingId: bigint | null = null;
  try { listingId = BigInt(id); } catch { /* non-numeric id */ }

  const chainId   = useChainId();
  const { address, isConnected } = useAccount();
  const addresses = CONTRACT_ADDRESSES[chainId as keyof typeof CONTRACT_ADDRESSES];

  const { data, isLoading } = useReadContract({
    address: addresses?.jaydeMarketplace,
    abi: JAYDE_MARKETPLACE_ABI,
    functionName: 'listings',
    args: [listingId ?? 0n],
    query: { enabled: !!addresses?.jaydeMarketplace && listingId !== null },
  });

  const { data: allowance, isLoading: isAllowanceLoading } = useReadContract({
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

  const [txPending, setTxPending] = useState<TxPending | null>(null);
  const [cancelled, setCancelled] = useState(false);

  if (listingId === null) return <InvalidId />;
  if (!addresses) return <WrongNetworkBanner />;

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

  function requestApprove() {
    if (!addresses?.jaydeToken || !addresses?.jaydeMarketplace) return;
    setTxPending({
      preview: {
        contractAddress: addresses.jaydeToken,
        functionName: 'approve',
        amountJayde: priceFormatted,
        description: 'Authorise the marketplace to spend JAYDE tokens on your behalf.',
      },
      execute: () =>
        approve(
          { address: addresses.jaydeToken!, abi: JAYDE_TOKEN_ABI, functionName: 'approve', args: [addresses.jaydeMarketplace!, price] },
          { onError: (err) => captureError(err, { tags: { kind: 'wallet_error', fn: 'approve' } }) },
        ),
    });
  }

  function requestPurchase() {
    if (!addresses?.jaydeMarketplace || listingId === null) return;
    setTxPending({
      preview: {
        contractAddress: addresses.jaydeMarketplace,
        functionName: 'purchaseListing',
        amountJayde: priceFormatted,
        description: `Purchase listing #${listingId.toString()} from ${seller.slice(0, 8)}…`,
      },
      execute: () =>
        purchase(
          { address: addresses.jaydeMarketplace!, abi: JAYDE_MARKETPLACE_ABI, functionName: 'purchaseListing', args: [listingId!] },
          { onError: (err) => captureError(err, { tags: { kind: 'contract_write', fn: 'purchaseListing' } }) },
        ),
    });
  }

  return (
    <>
      {txPending && (
        <TxConfirmModal
          preview={txPending.preview}
          onConfirm={() => { txPending.execute(); setTxPending(null); }}
          onCancel={() => setTxPending(null)}
        />
      )}

      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <div className="rounded-2xl border border-slate-700/60 bg-[#1e293b] overflow-hidden">
          {/* Image placeholder */}
          <div className="flex h-64 items-center justify-center bg-slate-800/60">
            <span className="text-7xl opacity-20">🖼️</span>
          </div>

          <div className="p-6 space-y-4">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <h1 className="text-2xl font-extrabold text-white">{title}</h1>
              {(!isActive || cancelled) && (
                <span className="rounded-full bg-slate-700 px-3 py-1 text-xs font-medium text-slate-400">
                  {cancelled ? 'Cancelled' : 'Sold / Inactive'}
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
                {isAllowanceLoading ? (
                  <div className="h-11 animate-pulse rounded-xl bg-slate-700" />
                ) : needsApproval ? (
                  <button
                    onClick={requestApprove}
                    disabled={isApproving || isApproveConfirming}
                    className="rounded-xl bg-slate-700 py-3 text-sm font-semibold text-white transition hover:bg-slate-600 disabled:opacity-50"
                  >
                    {isApproving ? 'Confirm in wallet…' : isApproveConfirming ? 'Approving…' : `Approve ${priceFormatted} JAYDE`}
                  </button>
                ) : (
                  <button
                    onClick={requestPurchase}
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

            {isSeller && isActive && !cancelled && (
              <div className="pt-2">
                <CancelListingButton
                  listingId={listingId!}
                  marketplaceAddress={addresses.jaydeMarketplace}
                  onCancelled={() => setCancelled(true)}
                />
              </div>
            )}
            {isSeller && cancelled && (
              <p className="pt-2 text-sm font-medium text-[#0d9488]">
                Listing cancelled successfully.
              </p>
            )}
            {isSeller && !isActive && !cancelled && (
              <p className="pt-2 text-sm text-slate-500">This listing is no longer active.</p>
            )}
          </div>
        </div>
      </div>
    </>
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

function InvalidId() {
  return (
    <div className="flex flex-col items-center justify-center py-32 text-center">
      <p className="text-lg font-semibold text-slate-400">Invalid listing ID</p>
    </div>
  );
}
