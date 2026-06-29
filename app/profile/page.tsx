'use client';

import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt, useChainId } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { formatUnits } from 'viem';
import { CONTRACT_ADDRESSES, JAYDE_TOKEN_ABI, JAYDE_MARKETPLACE_ABI, type ContractAddresses } from '@/lib/contracts';
import WrongNetworkBanner from '@/components/WrongNetworkBanner';

export default function ProfilePage() {
  const { address, isConnected } = useAccount();
  const chainId   = useChainId();
  const addresses = CONTRACT_ADDRESSES[chainId as keyof typeof CONTRACT_ADDRESSES];

  const { data: balance } = useReadContract({
    address: addresses?.jaydeToken,
    abi: JAYDE_TOKEN_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: { enabled: isConnected && !!address && !!addresses?.jaydeToken },
  });

  const { data: purchaseCount } = useReadContract({
    address: addresses?.jaydeMarketplace,
    abi: JAYDE_MARKETPLACE_ABI,
    functionName: 'purchaseCount',
    query: { enabled: !!addresses?.jaydeMarketplace },
  });

  if (!addresses) return <WrongNetworkBanner />;

  if (!isConnected) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 px-4 text-center">
        <p className="text-lg font-semibold text-slate-300">Connect your wallet to view your profile.</p>
        <ConnectButton />
      </div>
    );
  }

  const balanceFormatted = balance != null
    ? Number(formatUnits(balance, 18)).toLocaleString(undefined, { maximumFractionDigits: 4 })
    : '—';

  const shortAddress = address
    ? `${address.slice(0, 6)}…${address.slice(-4)}`
    : '';

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 space-y-8">
      {/* Profile header */}
      <div className="flex items-center gap-4 rounded-2xl border border-slate-700/60 bg-[#1e293b] p-6">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#0d9488]/20 text-2xl font-bold text-[#0d9488]">
          {address ? address[2].toUpperCase() : '?'}
        </div>
        <div>
          <p className="font-mono text-sm text-slate-400">{address}</p>
          <p className="mt-0.5 text-xs text-slate-500">({shortAddress})</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <StatCard label="JAYDE Balance" value={balanceFormatted} unit="JAYDE" />
        <StatCard label="Total Purchases" value={purchaseCount != null ? purchaseCount.toString() : '—'} />
      </div>

      {/* Purchases */}
      {purchaseCount != null && purchaseCount > 0n && (
        <div>
          <h2 className="mb-4 text-lg font-bold text-white">Your Purchases</h2>
          <div className="space-y-3">
            {Array.from({ length: Number(purchaseCount) }, (_, i) => i + 1).map((id) => (
              <PurchaseRow key={id} purchaseId={BigInt(id)} addresses={addresses} address={address!} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, unit }: { label: string; value: string; unit?: string }) {
  return (
    <div className="rounded-2xl border border-slate-700/60 bg-[#1e293b] p-5">
      <p className="text-xs font-medium text-slate-500">{label}</p>
      <div className="mt-1 flex items-baseline gap-1.5">
        <span className="text-2xl font-extrabold text-white">{value}</span>
        {unit && <span className="text-xs text-slate-400">{unit}</span>}
      </div>
    </div>
  );
}

function PurchaseRow({
  purchaseId,
  addresses,
  address,
}: {
  purchaseId: bigint;
  addresses: ContractAddresses;
  address: `0x${string}`;
}) {
  const { data } = useReadContract({
    address: addresses?.jaydeMarketplace,
    abi: JAYDE_MARKETPLACE_ABI,
    functionName: 'purchases',
    args: [purchaseId],
    query: { enabled: !!addresses?.jaydeMarketplace },
  });

  const { writeContract, data: txHash, isPending } = useWriteContract();
  const { isLoading: isConfirming } = useWaitForTransactionReceipt({ hash: txHash });

  if (!data) return null;
  const [listingId, buyer, , released] = data;

  if (buyer.toLowerCase() !== address.toLowerCase()) return null;

  function handleConfirm() {
    if (!addresses?.jaydeMarketplace) return;
    writeContract({
      address: addresses.jaydeMarketplace,
      abi: JAYDE_MARKETPLACE_ABI,
      functionName: 'confirmDelivery',
      args: [purchaseId],
    });
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-700/60 bg-slate-800/50 px-4 py-3">
      <div>
        <p className="text-sm font-semibold text-white">Purchase #{purchaseId.toString()}</p>
        <p className="text-xs text-slate-500">Listing #{listingId.toString()}</p>
      </div>
      <div className="flex items-center gap-2">
        {released ? (
          <span className="rounded-full bg-slate-700 px-3 py-1 text-xs text-slate-400">Completed</span>
        ) : (
          <button
            onClick={handleConfirm}
            disabled={isPending || isConfirming}
            className="rounded-lg bg-[#0d9488] px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-[#0f766e] disabled:opacity-50"
          >
            {isPending || isConfirming ? 'Confirming…' : 'Confirm Delivery'}
          </button>
        )}
      </div>
    </div>
  );
}
