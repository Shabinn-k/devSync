import { useState } from 'react';

export const FAQ = () => {
  const faqs = [
    {
      q: 'how long does setup take?',
      a: 'Under two minutes. Create an account, verify your email, spin up an organization, and start inviting. No credit card, no sales call.',
    },
    {
      q: 'can I belong to multiple orgs?',
      a: 'Yes. You can belong to multiple organizations with different roles in each — admin in one, member in another. Switch between them from the sidebar.',
    },
    {
      q: 'is chat really real-time?',
      a: 'Yes. Messages are broadcast over WebSockets to every connected channel member. No polling, no refresh, sub-100ms delivery when your connection allows.',
    },
    {
      q: 'what happens when a member leaves?',
      a: 'Admins can remove them from the org. Their tasks stay assigned, their messages remain in history, and their access is revoked instantly across all endpoints.',
    },
    {
      q: 'can I self-host?',
      a: 'On the enterprise plan, yes. We ship a Docker Compose bundle with the Go backend, Postgres, and Redis. SSO/SAML and audit logging come standard.',
    },
    {
      q: 'how is my data protected?',
      a: 'JWT with refresh tokens, bcrypt password hashing, email verification, OTP flows, and rate-limited APIs on every endpoint. All traffic over HTTPS in production.',
    },
  ];

  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" className="border-t border-white/5 px-6 py-24">
      <div className="mx-auto max-w-3xl">
         
        <h2 className="mt-4 text-3xl font-semibold leading-tight tracking-tight text-white sm:text-4xl">
          Questions.{' '}
          <span className="text-white/30">Answered.</span>
        </h2>

        <div className="mt-12 divide-y divide-white/5 border-y border-white/5">
          {faqs.map((f, i) => {
            const isOpen = open === i;
            return (
              <div key={f.q}>
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="flex w-full items-center justify-between gap-4 py-5 text-left transition-colors hover:text-white"
                >
                  <span className="font-mono text-sm text-white/80">
                    <span className="mr-3 text-white/30">{String(i + 1).padStart(2, '0')}</span>
                    {f.q}
                  </span>
                  <span className={`font-mono text-lg text-white/40 transition-transform duration-200 ${isOpen ? 'rotate-45' : ''}`}>
                    +
                  </span>
                </button>
                {isOpen && (
                  <div className="pb-5 pl-9 pr-8 text-[13px] leading-relaxed text-white/50">
                    {f.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};