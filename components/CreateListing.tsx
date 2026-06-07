'use client';

import { useState } from 'react';
import { useWriteContract, useWaitForTransactionReceipt, useChainId, useAccount } from 'wagmi';
import { parseUnits } from 'viem';
import { CONTRACT_ADDRESSES, JAYDE_MARKETPLACE_ABI } from '@/lib/contracts';

interface Props {
  onSuccess?: () => void;
}

export default function CreateListing({ onSuccess }: Props) {
  const chainId   = useChainId();
  const { isConnected } = useAccount();
  const addresses = CONTRACT_ADDRESSES[chainId as keyof typeof CONTRACT_ADDRESSES];

  const [title,    setTitle]    = useState('');
  const [price,    setPrice]    = useState('');
  const [ipfsHash, setIpfsHash] = useState('');
  const [error,    setError]    = useState('');

  const { writeContract, data: txHash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash: txHash });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!addresses?.jaydeMarketplace) {
      setError('Marketplace not deployed on this network.');
      return;
    }
    if (!title.trim() || !price || !ipfsHash.trim()) {
      setError('All fields are required.');
      return;
    }

    let priceParsed: bigint;
    try {
      priceParsed = parseUnits(price, 18);
    } catch {
      setError('Invalid price.');
      return;
    }

    writeContract(
      {
        address: addresses.jaydeMarketplace,
        abi: JAYDE_MARKETPLACE_ABI,
        functionName: 'createListing',
        args: [title.trim(), priceParsed, ipfsHash.trim()],
      },
      {
        onSuccess: () => {
          setTitle(''); setPrice(''); setIpfsHash('');
          onSuccess?.();
        },
        onError: (err) => setError(err.message.slice(0, 120)),
      },
    );
  }

  if (!isConnected) {
    return (
      <div className="rounded-xl border border-slate-700 bg-[#1e293b] p-6 text-center text-slate-400">
        Connect your wallet to create a listing.
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-slate-700/60 bg-[#1e293b] p-6 space-y-4"
    >
      <h2 className="text-lg font-bold text-white">Create a Listing</h2>

      <Field label="Title">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={256}
          placeholder="e.g. Vintage leather jacket"
          className={inputCls}
        />
      </Field>

      <Field label="Price (JAYDE)">
        <input
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          type="number"
          min="0"
          step="any"
          placeholder="100"
          className={inputCls}
        />
      </Field>

      <Field label="IPFS Hash (image / description)">
        <input
          value={ipfsHash}
          onChange={(e) => setIpfsHash(e.target.value)}
          maxLength={128}
          placeholder="QmXyZ..."
          className={inputCls}
        />
      </Field>

      {error && <p className="text-sm text-red-400">{error}</p>}

      {isSuccess && (
        <p className="text-sm text-[#0d9488] font-medium">Listing created successfully!</p>
      )}

      <button
        type="submit"
        disabled={isPending || isConfirming}
        className="w-full rounded-xl bg-[#0d9488] py-3 text-sm font-semibold text-white transition hover:bg-[#0f766e] disabled:opacity-50"
      >
        {isPending ? 'Confirm in wallet…' : isConfirming ? 'Confirming…' : 'Create Listing'}
      </button>
    </form>
  );
}

const inputCls =
  'w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-sm text-white placeholder-slate-500 outline-none focus:border-[#0d9488] focus:ring-1 focus:ring-[#0d9488] transition';

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-slate-400">{label}</label>
      {children}
    </div>
  );
}
