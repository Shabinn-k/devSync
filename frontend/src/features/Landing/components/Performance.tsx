export const Performance = () => {
  const stats = [
    { value: '<50ms', label: 'api latency', sub: 'p50 response time' },
    { value: 'ws', label: 'real-time', sub: 'WebSocket transport' },
    { value: '100%', label: 'in-house', sub: 'no third-party bloat' },
    { value: '∞', label: 'scale', sub: 'Postgres + Redis' },
  ];

  return (
    <section className="border-t border-white/5 px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-12 lg:grid-cols-5 lg:items-start">
          <div className="lg:col-span-3">
             
            <h2 className="mt-4 text-3xl font-semibold leading-tight tracking-tight text-white sm:text-4xl">
              Built for speed.{' '}
              <span className="text-white/30">Measured, not marketed.</span>
            </h2>

            <div className="mt-6 space-y-4 text-sm leading-relaxed text-white/50">
              <p>
                DevSync runs on a compiled Go backend with PostgreSQL for
                persistence and Redis for caching and sessions. The frontend is
                React with Zustand — every state change is surgical, every render
                is intentional.
              </p>
              <p>
                Real-time features — notifications, chat, presence — flow over
                WebSockets. Dragging a task, sending a message, or reading a
                notification is instant because there's nothing between you and
                the data.
              </p>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-white/10 bg-white/[0.03]">
              {stats.map((s) => (
                <div key={s.label} className="bg-black p-5">
                  <p className="text-2xl font-semibold text-white">{s.value}</p>
                  <p className="mt-2 font-mono text-[10px] uppercase tracking-widest text-white/40">
                    {s.label}
                  </p>
                  <p className="mt-1 text-[10px] text-white/25">{s.sub}</p>
                </div>
              ))}
            </div>

            <div className="mt-4 rounded-xl border border-white/10 bg-black p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="font-mono text-[10px] text-white/40">stack.json</span>
                <span className="font-mono text-[9px] text-white/20">6 deps</span>
              </div>
              <pre className="font-mono text-[11px] leading-relaxed text-white/50">
{`{
  `}<span className="text-green-400">"backend"</span>{`: `}<span className="text-white/80">"go + gin + gorm"</span>{`,
  `}<span className="text-green-400">"database"</span>{`: `}<span className="text-white/80">"postgresql"</span>{`,
  `}<span className="text-green-400">"cache"</span>{`: `}<span className="text-white/80">"redis"</span>{`,
  `}<span className="text-green-400">"realtime"</span>{`: `}<span className="text-white/80">"websocket"</span>{`,
  `}<span className="text-green-400">"frontend"</span>{`: `}<span className="text-white/80">"react + typescript"</span>{`,
  `}<span className="text-green-400">"state"</span>{`: `}<span className="text-white/80">"zustand"</span>{`
}`}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};