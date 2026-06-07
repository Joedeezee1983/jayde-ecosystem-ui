'use client';

import Link from 'next/link';
import { formatUnits } from 'viem';

export interface Listing {
  id: bigint;
  seller: `0x${string}`;
  title: string;
  price: bigint;
  ipfsHash: string;
  isActive: boolean;
}

interface Props {
  listing: Listing;
}

export default function ListingCard({ listing }: Props) {
  const priceFormatted = Number(formatUnits(listing.price, 18)).toLocaleString(undefined, {
    maximumFractionDigits: 4,
  });

  const shortSeller = `${listing.seller.slice(0, 6)}…${listing.seller.slice(-4)}`;

  return (
    <Link
      href={`/listings/${listing.id.toString()}`}
      className="group flex flex-col rounded-2xl border border-slate-700/60 bg-[#1e293b] transition hover:border-[#0d9488]/50 hover:shadow-lg hover:shadow-[#0d9488]/10"
    >
      {/* Placeholder image area */}
      <div className="flex h-44 items-center justify-center rounded-t-2xl bg-slate-800/60">
        <span className="text-5xl opacity-30">🖼️</span>
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="line-clamp-2 font-semibold text-white group-hover:text-[#0d9488] transition-colors">
          {listing.title}
        </h3>

        <p className="text-xs text-slate-500">Seller: {shortSeller}</p>

        <div className="mt-auto flex items-center justify-between pt-3">
          <div className="flex items-baseline gap-1">
            <span className="text-lg font-bold text-[#0d9488]">{priceFormatted}</span>
            <span className="text-xs font-medium text-slate-400">JAYDE</span>
          </div>
          <span className="rounded-full bg-[#0d9488]/10 px-2.5 py-1 text-xs font-medium text-[#0d9488]">
            Active
          </span>
        </div>
      </div>
    </Link>
  );
}
