export const Testimonial = () => {
  return (
    <section className="border-t border-white/5 px-6 py-24">
      <div className="mx-auto max-w-4xl">
        

        <blockquote className="text-xl font-semibold leading-relaxed tracking-tight text-white/80 sm:text-2xl">
          <span className="text-white/30">&gt;</span> we replaced three tools
          with devsync. projects, tasks, and chat are all in one place now —
          and real-time updates mean standups finally have something new to
          talk about.
        </blockquote>

        <div className="mt-8 flex items-center gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-md border border-white/10 bg-white/5 font-mono text-xs font-medium text-white">
            BW
          </div>
          <div>
            <p className="font-mono text-xs font-medium text-white">Bridgeon Wang</p>
            <p className="mt-0.5 font-mono text-[10px] text-white/40">
              engineering lead · bridgeon
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};