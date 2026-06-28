'use client';

import { useEffect, useRef } from 'react';
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { JAYDE_MARKETPLACE_ABI } from '@/lib/contracts';
import { captureError } from '@/lib/monitoring';

interface Props {
  listingId: bigint;
  marketplaceAddress: `0x${string}`;
  /** Called exactly once after the cancellation transaction confirms on-chain. */
  onCancelled: () => void;
  /** 'card' renders a compact button; 'detail' renders full-width. */
  variant?: 'card' | 'detail';
}

export default function CancelListingButton({
  listingId,
  marketplaceAddress,
  onCancelled,
  variant = 'detail',
}: Props) {
  const { writeContract, data: txHash, isPending, error: writeError, reset } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash: txHash });

  // Guard so onCancelled fires exactly once even if the parent re-renders with
  // a new function reference while isSuccess is still true.
  const calledRef = useRef(false);
  useEffect(() => {
    if (isSuccess && !calledRef.current) {
      calledRef.current = true;
      onCancelled();
    }
  }, [isSuccess, onCancelled]);

  const isBusy = isPending || isConfirming;

  function handleCancel() {
    reset();
    writeContract(
      {
        address: marketplaceAddress,
        abi: JAYDE_MARKETPLACE_ABI,
        functionName: 'deactivateListing',
        args: [listingId],
      },
      {
        onError: (err) => {
          captureError(err, { tags: { kind: 'contract_write', fn: 'deactivateListing' } });
        },
      },
    );
  }

  const errorMessage = writeError
    ? isRejection(writeError.message)
      ? 'Transaction rejected.'
      : 'Failed to cancel. Please try again.'
    : null;

  const isCompact = variant === 'card';

  return (
    <div className="space-y-1.5">
      <button
        onClick={handleCancel}
        disabled={isBusy}
        className={[
          'flex items-center justify-center gap-2 rounded-xl border border-red-500/40',
          'bg-red-500/10 font-semibold text-red-400 transition',
          'hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-50',
          isCompact ? 'w-full py-2 text-xs' : 'w-full py-2.5 text-sm',
        ].join(' ')}
      >
        {isBusy && <Spinner />}
        {isPending ? 'Confirm in wallet…' : isConfirming ? 'Cancelling…' : 'Cancel Listing'}
      </button>
      {errorMessage && <p className="text-xs text-red-400">{errorMessage}</p>}
    </div>
  );
}

function isRejection(msg: string): boolean {
  const lower = msg.toLowerCase();
  return lower.includes('rejected') || lower.includes('denied') || lower.includes('user refused');
}

function Spinner() {
  return (
    <svg
      className="h-4 w-4 animate-spin"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}
