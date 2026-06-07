'use client';

import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { baseSepolia, hardhat } from 'wagmi/chains';

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? 'jayde-dev';

export const wagmiConfig = getDefaultConfig({
  appName: 'JayDe Marketplace',
  projectId,
  chains: [baseSepolia, hardhat],
  ssr: true,
});

export { baseSepolia, hardhat };
