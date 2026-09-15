import { Link } from 'react-router-dom';

export const Footer = () => {
  return (
    <footer className="border-t border-white/5 px-6 py-12">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* brand */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="flex h-6 w-6 items-center justify-center rounded-md border border-white/20 bg-white/5 font-mono text-[10px] font-bold text-white">
                {'<>'}
              </div>
              <span className="font-mono text-[13px] font-medium tracking-tight text-white">
                devsync
              </span>
            </Link>
            <p className="mt-4 max-w-xs font-mono text-[11px] leading-relaxed text-white/35">
              The workspace where engineering teams actually ship. Projects, tasks,
              chat, and teams — unified.
            </p>
            <p className="mt-4 font-mono text-[10px] tracking-widest text-white/20">
              v1.0.0 · MIT · BUILT WITH GO + REACT
            </p>
          </div>

          <div>
            <h4 className="font-mono text-[10px] uppercase tracking-widest text-white/40">
              product
            </h4>
            <ul className="mt-4 space-y-2.5">
              <li><a href="#features" className="font-mono text-[12px] text-white/50 hover:text-white transition-colors">features</a></li>
              <li><a href="#lifecycle" className="font-mono text-[12px] text-white/50 hover:text-white transition-colors">platform</a></li>
              <li><a href="#pricing" className="font-mono text-[12px] text-white/50 hover:text-white transition-colors">pricing</a></li>
              <li><a href="#faq" className="font-mono text-[12px] text-white/50 hover:text-white transition-colors">faq</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-mono text-[10px] uppercase tracking-widest text-white/40">
              account
            </h4>
            <ul className="mt-4 space-y-2.5">
              <li><Link to="/register" className="font-mono text-[12px] text-white/50 hover:text-white transition-colors">sign up</Link></li>
              <li><Link to="/login" className="font-mono text-[12px] text-white/50 hover:text-white transition-colors">sign in</Link></li>
              <li><a href="#" className="font-mono text-[12px] text-white/50 hover:text-white transition-colors">privacy</a></li>
              <li><a href="#" className="font-mono text-[12px] text-white/50 hover:text-white transition-colors">terms</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/5 pt-6 sm:flex-row">
          <p className="font-mono text-[10px] text-white/25">
            © {new Date().getFullYear()} devsync · all rights reserved
          </p>
          <p className="font-mono text-[10px] text-white/20">
            <span className="text-green-400">●</span> all systems operational
          </p>
        </div>
      </div>
    </footer>
  );
};