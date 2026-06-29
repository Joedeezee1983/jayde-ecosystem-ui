'use client';

export default function WrongNetworkBanner() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <div className="flex items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 px-5 py-4">
        <span className="mt-0.5 shrink-0 text-amber-400">⚠</span>
        <div>
          <p className="font-semibold text-amber-300">Wrong network</p>
          <p className="mt-1 text-sm text-amber-400/80">
            Please switch your wallet to{' '}
            <strong className="text-amber-300">Base Sepolia</strong> to use the
            marketplace.
          </p>
        </div>
      </div>
    </div>
  );
}
