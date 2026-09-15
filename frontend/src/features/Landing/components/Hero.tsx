import { Link } from 'react-router-dom';

export const Hero = () => {
  return (
    <section className="relative overflow-hidden pt-32 pb-20 px-6">
      {/* subtle grid backdrop */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(to right, white 1px, transparent 1px),
            linear-gradient(to bottom, white 1px, transparent 1px)
          `,
          backgroundSize: '48px 48px',
          maskImage: 'radial-gradient(ellipse 80% 60% at 50% 0%, black, transparent)',
        }}
      />

      <div className="relative mx-auto max-w-5xl">
       

        {/* headline */}
        <h1 className="text-center text-4xl font-semibold leading-[1.1] tracking-tight text-white sm:text-6xl lg:text-7xl">
          <span className="block">The workspace</span>
          <span className="block text-white/30">your team deserves.</span>
        </h1>

        <p className="mx-auto mt-8 max-w-xl text-center text-[15px] leading-relaxed text-white/50">
          Projects, tasks, real-time chat, and teams — unified in one fast, focused
          platform. Built with a Go backend and a React frontend, so everything
          responds in milliseconds.
        </p>

        {/* CTA */}
        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            to="/register"
            className="group inline-flex items-center gap-2 rounded-md border border-white/10 bg-white px-5 py-2.5 font-mono text-xs font-medium text-black transition-all duration-200 hover:bg-green-500"
          >
            start building free
            <span className="transition-transform group-hover:translate-x-0.5">→</span>
          </Link>
          <a
            href="#features"
            className="inline-flex items-center gap-2 rounded-md border border-white/10 bg-black px-5 py-2.5 font-mono text-xs text-white/70 transition-all duration-200 hover:border-white/20 hover:text-white"
          >
            explore features
          </a>
        </div>

        <p className="mt-6 text-center font-mono text-[10px] tracking-widest text-white/25">
          NO CREDIT CARD · FREE FOREVER FOR SMALL TEAMS
        </p>

        {/* Terminal-style product preview */}
        <div className="mx-auto mt-16 max-w-4xl">
          <div className="relative rounded-xl border border-white/10 bg-black shadow-2xl">
            {/* window chrome */}
            <div className="flex items-center gap-2 border-b border-white/5 px-4 py-3">
              <div className="flex gap-1.5">
                <div className="h-2.5 w-2.5 rounded-full bg-white/10" />
                <div className="h-2.5 w-2.5 rounded-full bg-white/10" />
                <div className="h-2.5 w-2.5 rounded-full bg-white/10" />
              </div>
              <div className="ml-4 flex items-center gap-2 font-mono text-[11px] text-white/30">
                <span className="text-white/20">~/devsync</span>
                <span className="text-white/10">/</span>
                <span>dashboard</span>
              </div>
              <div className="ml-auto flex items-center gap-2">
                <span className="font-mono text-[10px] text-green-400">● live</span>
              </div>
            </div>

            {/* dashboard preview */}
            <div className="grid grid-cols-12 gap-3 p-5">
              {/* sidebar */}
              <div className="col-span-3 space-y-1.5">
                {['dashboard', 'projects', 'tasks', 'chat', 'teams'].map((item, i) => (
                  <div
                    key={item}
                    className={`flex items-center gap-2 rounded-md px-2.5 py-1.5 font-mono text-[11px] ${
                      i === 1 ? 'bg-white/5 text-white' : 'text-white/40'
                    }`}
                  >
                    <div className={`h-1.5 w-1.5 rounded-sm ${i === 1 ? 'bg-green-400' : 'bg-white/20'}`} />
                    {item}
                  </div>
                ))}
              </div>

              {/* main */}
              <div className="col-span-9 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs text-white/60">projects</span>
                  <span className="rounded border border-white/10 px-2 py-0.5 font-mono text-[10px] text-white/40">
                    + new
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {[
                    { name: 'API v2', key: 'API', done: 15, total: 24, color: 'green' },
                    { name: 'Design System', key: 'DS', done: 8, total: 12, color: 'yellow' },
                    { name: 'Mobile App', key: 'MOB', done: 18, total: 18, color: 'green' },
                  ].map((p) => (
                    <div key={p.name} className="rounded-lg border border-white/5 bg-white/[0.02] p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-mono text-[10px] text-white/30">{p.key}</span>
                        <span className={`h-1 w-1 rounded-full bg-${p.color}-400`} />
                      </div>
                      <p className="text-[11px] font-medium text-white mb-2">{p.name}</p>
                      <div className="h-0.5 w-full overflow-hidden rounded-full bg-white/5">
                        <div
                          className={`h-full ${p.color === 'green' ? 'bg-green-500' : 'bg-yellow-500'}`}
                          style={{ width: `${(p.done / p.total) * 100}%` }}
                        />
                      </div>
                      <p className="mt-2 font-mono text-[9px] text-white/30">
                        {p.done}/{p.total} tasks
                      </p>
                    </div>
                  ))}
                </div>

                {/* chat preview */}
                <div className="rounded-lg border border-white/5 bg-white/[0.02] p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="h-1 w-1 rounded-full bg-green-400" />
                    <span className="font-mono text-[10px] text-white/40">#general</span>
                    <span className="ml-auto font-mono text-[9px] text-white/20">3 online</span>
                  </div>
                  <div className="space-y-1.5 font-mono text-[10px]">
                    <p className="text-white/50">
                      <span className="text-white/80">shabin</span> → API v2 is ready for review
                    </p>
                    <p className="text-white/50">
                      <span className="text-white/80">manhar</span> → pushing to staging now
                    </p>
                    <p className="text-white/30 italic">typing...</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* reflection glow */}
          <div className="pointer-events-none mx-auto h-24 max-w-3xl bg-gradient-to-b from-white/[0.03] to-transparent blur-2xl" />
        </div>
      </div>
    </section>
  );
};