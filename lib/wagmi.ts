'use client';

import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { baseSepolia, hardhat } from 'wagmi/chains';

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID;
if (!projectId) {
  throw new Error('NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID is required');
}

export const wagmiConfig = getDefaultConfig({
  appName: 'JayDe Marketplace',
  projectId,
  chains: process.env.NODE_ENV === 'development' ? [baseSepolia, hardhat] : [baseSepolia],
  ssr: true,
});

export { baseSepolia, hardhat };
