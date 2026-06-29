/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === 'production';

const nextConfig = {
  async headers() {
    const scriptSrc = isProd
      ? "script-src 'self' 'unsafe-inline' 'wasm-unsafe-eval'"
      : "script-src 'self' 'unsafe-inline' 'unsafe-eval' 'wasm-unsafe-eval'";

    const csp = [
      "default-src 'self'",
      scriptSrc,
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      "font-src 'self'",
      [
        "connect-src 'self'",
        // WalletConnect relay + RPC
        'wss://relay.walletconnect.com',
        'wss://relay.walletconnect.org',
        'https://rpc.walletconnect.com',
        'https://rpc.walletconnect.org',
        'https://api.web3modal.org',
        'https://explorer-api.walletconnect.com',
        'https://verify.walletconnect.com',
        // Base Sepolia RPC endpoints
        'https://sepolia.base.org',
        'https://*.base.org',
        'https://*.alchemy.com',
        'wss://*.alchemy.com',
        'https://*.infura.io',
        'wss://*.infura.io',
        // Sentry error reporting (no-op when DSN not configured)
        'https://*.sentry.io',
        'https://*.ingest.sentry.io',
      ].join(' '),
      "frame-ancestors 'none'",
    ].join('; ');

    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options',           value: 'DENY' },
          { key: 'X-Content-Type-Options',    value: 'nosniff' },
          { key: 'Referrer-Policy',            value: 'strict-origin-when-cross-origin' },
          { key: 'Content-Security-Policy',   value: csp },
        ],
      },
    ];
  },
};

export default nextConfig;
