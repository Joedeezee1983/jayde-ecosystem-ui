import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="flex min-h-[calc(100vh-64px)] flex-col">
      {/* Hero */}
      <section className="flex flex-1 flex-col items-center justify-center px-4 py-24 text-center">
        {/* Glow backdrop */}
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-1/3 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#0d9488]/20 blur-3xl"
        />

        <div className="relative">
          <span className="mb-4 inline-block rounded-full border border-[#0d9488]/40 bg-[#0d9488]/10 px-4 py-1 text-xs font-semibold tracking-widest text-[#0d9488] uppercase">
            Built on Base Sepolia
          </span>

          <h1 className="mt-4 text-5xl font-extrabold leading-tight tracking-tight text-white sm:text-6xl lg:text-7xl">
            The{' '}
            <span className="text-[#0d9488]">JayDe</span>
            <br />
            Marketplace
          </h1>

          <p className="mx-auto mt-6 max-w-xl text-lg text-slate-400">
            Buy and sell anything peer-to-peer using{' '}
            <span className="font-semibold text-white">JAYDE tokens</span>.
            Every trade is protected by on-chain escrow — no middlemen, no trust required.
          </p>

          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link
              href="/marketplace"
              className="rounded-xl bg-[#0d9488] px-8 py-3 text-base font-semibold text-white shadow-lg shadow-[#0d9488]/30 transition hover:bg-[#0f766e] active:scale-95"
            >
              Browse Listings
            </Link>
            <Link
              href="/marketplace#create"
              className="rounded-xl border border-slate-600 bg-slate-800 px-8 py-3 text-base font-semibold text-slate-200 transition hover:bg-slate-700 active:scale-95"
            >
              Sell Something
            </Link>
          </div>
        </div>
      </section>

      {/* Feature cards */}
      <section className="mx-auto w-full max-w-5xl px-4 pb-24 sm:px-6">
        <div className="grid gap-4 sm:grid-cols-3">
          <FeatureCard
            icon="🔐"
            title="Escrow-Protected"
            body="Funds are locked in a smart-contract escrow until the buyer confirms delivery. No one can run with the money."
          />
          <FeatureCard
            icon="⚡"
            title="JAYDE Token"
            body="All trades settle in JAYDE — a fixed-supply ERC-20 on Base. Fast, cheap, and fully on-chain."
          />
          <FeatureCard
            icon="🛡️"
            title="Dispute Resolution"
            body="Either party can open a dispute. An on-chain arbitration flow ensures a fair outcome every time."
          />
        </div>
      </section>
    </div>
  );
}

function FeatureCard({ icon, title, body }: { icon: string; title: string; body: string }) {
  return (
    <div className="rounded-2xl border border-slate-700/60 bg-[#1e293b] p-6 transition hover:border-[#0d9488]/50">
      <div className="mb-3 text-3xl">{icon}</div>
      <h3 className="mb-2 text-base font-semibold text-white">{title}</h3>
      <p className="text-sm leading-relaxed text-slate-400">{body}</p>
    </div>
  );
}
