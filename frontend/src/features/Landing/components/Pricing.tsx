import { Link } from 'react-router-dom';

export const Pricing = () => {
  const tiers = [
    {
      name: 'free',
      price: '$0',
      period: 'forever',
      desc: 'For small teams getting started.',
      features: ['up to 5 members', '3 projects', 'real-time chat', 'basic notifications', 'community support'],
      cta: 'start free',
      highlight: false,
    },
    {
      name: 'team',
      price: '$12',
      period: 'per user / month',
      desc: 'For growing teams that ship weekly.',
      features: ['unlimited members', 'unlimited projects', 'sub-teams + advanced roles', 'priority support', 'custom domains'],
      cta: 'get started',
      highlight: true,
    },
    {
      name: 'enterprise',
      price: 'custom',
      period: 'contact us',
      desc: 'For orgs with strict requirements.',
      features: ['SSO / SAML', 'audit logs', 'dedicated support', 'SLA', 'on-prem deployment'],
      cta: 'contact sales',
      highlight: false,
    },
  ];

  return (
    <section id="pricing" className="border-t border-white/5 px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-2xl">
        
          <h2 className="mt-4 text-3xl font-semibold leading-tight tracking-tight text-white sm:text-4xl">
            Simple, honest pricing.{' '}
            <span className="text-white/30">No surprises.</span>
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-white/50">
            Start free. Upgrade when your team grows. Cancel anytime.
          </p>
        </div>

        <div className="mt-14 grid gap-3 md:grid-cols-3">
          {tiers.map((tier) => (
            <div
              key={tier.name}
              className={`relative rounded-xl border bg-black p-6 transition-colors ${
                tier.highlight ? 'border-white/30' : 'border-white/10 hover:border-white/20'
              }`}
            >
              {tier.highlight && (
                <div className="absolute -top-2.5 left-6 rounded border border-green-500/30 bg-black px-2 py-0.5 font-mono text-[9px] uppercase tracking-widest text-green-400">
                  most popular
                </div>
              )}

              <div className="flex items-center justify-between">
                <h3 className="font-mono text-xs uppercase tracking-widest text-white/60">
                  {tier.name}
                </h3>
                <span className="font-mono text-[10px] text-white/20">
                  tier_{tiers.indexOf(tier) + 1}
                </span>
              </div>

              <div className="mt-6 flex items-baseline gap-2">
                <span className="text-3xl font-semibold text-white">{tier.price}</span>
                <span className="font-mono text-[11px] text-white/40">/ {tier.period}</span>
              </div>

              <p className="mt-3 text-[13px] text-white/45">{tier.desc}</p>

              <ul className="mt-6 space-y-2.5">
                {tier.features.map((f) => (
                  <li key={f} className="flex items-center gap-2.5 font-mono text-[12px] text-white/60">
                    <span className="text-green-400">›</span>
                    {f}
                  </li>
                ))}
              </ul>

              <Link
                to={tier.name === 'enterprise' ? '/contact' : '/register'}
                className={`mt-8 flex w-full items-center justify-center rounded-md border px-4 py-2.5 font-mono text-xs font-medium transition-all duration-200 ${
                  tier.highlight
                    ? 'border-white bg-white text-black hover:bg-green-500'
                    : 'border-white/10 bg-black text-white/70 hover:bg-white/5 hover:text-white'
                }`}
              >
                {tier.cta} →
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};