import { Link } from 'react-router-dom';

export const CTA = () => {
  return (
    <section className="border-t border-white/5 px-6 py-24">
      <div className="mx-auto max-w-3xl">
        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-black p-12 text-center">
          {/* subtle grid backdrop */}
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `
                linear-gradient(to right, white 1px, transparent 1px),
                linear-gradient(to bottom, white 1px, transparent 1px)
              `,
              backgroundSize: '32px 32px',
            }}
          />

          <div className="relative">
           
            <h2 className="mt-4 text-3xl font-semibold leading-tight tracking-tight text-white sm:text-4xl">
              Ready to sync your team?
            </h2>
            <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-white/50">
              Join the teams already shipping faster with DevSync. Free to start,
              no credit card required.
            </p>

            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                to="/register"
                className="group inline-flex items-center gap-2 rounded-md border border-white/10 bg-white px-5 py-2.5 font-mono text-xs font-medium text-black transition-all duration-200 hover:bg-green-500"
              >
                start building free
                <span className="transition-transform group-hover:translate-x-0.5">→</span>
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 rounded-md border border-white/10 bg-black px-5 py-2.5 font-mono text-xs text-white/70 transition-all duration-200 hover:border-white/20 hover:text-white"
              >
                sign in
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};