'use client';

import Link from 'next/link';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useReadContract } from 'wagmi';
import { useChainId } from 'wagmi';
import { formatUnits } from 'viem';
import { CONTRACT_ADDRESSES, JAYDE_TOKEN_ABI } from '@/lib/contracts';

export default function Navbar() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();

  const addresses = CONTRACT_ADDRESSES[chainId as keyof typeof CONTRACT_ADDRESSES];

  const { data: balance } = useReadContract({
    address: addresses?.jaydeToken,
    abi: JAYDE_TOKEN_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: { enabled: isConnected && !!address && !!addresses?.jaydeToken },
  });

  const formattedBalance = balance != null
    ? Number(formatUnits(balance, 18)).toLocaleString(undefined, { maximumFractionDigits: 2 })
    : null;

  return (
    <nav className="sticky top-0 z-50 border-b border-slate-700/50 bg-[#0f172a]/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 text-xl font-bold text-white hover:opacity-90">
          <span className="text-[#0d9488]">JayDe</span>
          <span className="text-slate-300">Ecosystem</span>
        </Link>

        {/* Nav links */}
        <div className="hidden items-center gap-6 md:flex">
          <NavLink href="/marketplace">Marketplace</NavLink>
          <NavLink href="/profile">My Profile</NavLink>
        </div>

        {/* Right side: JAYDE balance + wallet connect */}
        <div className="flex items-center gap-3">
          {isConnected && formattedBalance != null && (
            <div className="hidden items-center gap-1.5 rounded-lg border border-slate-600 bg-slate-800 px-3 py-1.5 sm:flex">
              <span className="text-xs font-medium text-[#0d9488]">JAYDE</span>
              <span className="text-sm font-semibold text-white">{formattedBalance}</span>
            </div>
          )}
          <ConnectButton
            showBalance={false}
            chainStatus="icon"
            accountStatus="avatar"
          />
        </div>
      </div>
    </nav>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="text-sm font-medium text-slate-400 transition-colors hover:text-[#0d9488]"
    >
      {children}
    </Link>
  );
}
