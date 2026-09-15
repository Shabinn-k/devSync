export const TrustedBy = () => {
  const teams = ['bridgeon', 'skillversity', 'northwind', 'acme-labs', 'hexagon', 'lumen'];

  return (
    <section className="border-y border-white/5 bg-white/[0.01] px-6 py-10">
      <div className="mx-auto max-w-6xl">
        <p className="text-center font-mono text-[10px] uppercase tracking-[0.2em] text-white/25">
          powering engineering teams
        </p>
        <div className="mt-6 grid grid-cols-2 items-center justify-items-center gap-8 sm:grid-cols-3 lg:grid-cols-6">
          {teams.map((t) => (
            <span
              key={t}
              className="font-mono text-xs tracking-tight text-white/20 transition-colors hover:text-white/50"
            >
              {t}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
};