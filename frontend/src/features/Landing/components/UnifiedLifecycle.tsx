export const UnifiedLifecycle = () => {
  const stages = [
    {
      step: '01',
      name: 'plan',
      title: 'Set up your org',
      cmd: '$ devsync init --org bridgeon',
      points: [
        'Create organizations',
        'Invite teammates by email',
        'Set roles: admin, lead, member',
        'Spin up projects in seconds',
      ],
    },
    {
      step: '02',
      name: 'build',
      title: 'Move the work',
      cmd: '$ devsync task move --to in-progress',
      points: [
        'Kanban with drag-and-drop',
        'Real-time status sync across team',
        'Threaded comments on tasks',
        'Live chat in project channels',
      ],
    },
    {
      step: '03',
      name: 'ship',
      title: 'Prove the work',
      cmd: '$ devsync task close --all',
      points: [
        'Mark tasks done, track velocity',
        'Instant notifications to stakeholders',
        'Auto-generated activity feed',
        'Full audit trail per project',
      ],
    },
  ];

  return (
    <section id="lifecycle" className="border-t border-white/5 px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-2xl">
          
          <h2 className="mt-4 text-3xl font-semibold leading-tight tracking-tight text-white sm:text-4xl">
            One workspace.{' '}
            <span className="text-white/30">Full lifecycle.</span>
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-white/50">
            From the first invite to the final task — DevSync carries your team
            through every stage without switching tools.
          </p>
        </div>

        <div className="mt-14 grid gap-3 md:grid-cols-3">
          {stages.map((s) => (
            <div key={s.step} className="rounded-xl border border-white/10 bg-black p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="font-mono text-[10px] tracking-widest text-white/25">
                  {s.step}
                </span>
                <span className="font-mono text-[10px] tracking-widest text-white/40">
                  {s.name}
                </span>
              </div>

              <h3 className="text-base font-semibold text-white">{s.title}</h3>

              {/* terminal snippet */}
              <div className="mt-4 rounded-md border border-white/5 bg-white/[0.02] px-3 py-2">
                <code className="font-mono text-[10px] text-green-400">{s.cmd}</code>
              </div>

              <ul className="mt-5 space-y-2">
                {s.points.map((p) => (
                  <li key={p} className="flex items-start gap-2 text-[13px] text-white/50">
                    <span className="mt-1 h-1 w-1 flex-shrink-0 rounded-full bg-white/30" />
                    {p}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};