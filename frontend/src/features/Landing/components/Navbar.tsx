import { Link } from 'react-router-dom';

export const Navbar = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-40 border-b border-white/5 bg-black/70 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="relative h-6 w-6">
            <div className="absolute inset-0 rounded-md border border-white/20 bg-white/5" />
            <div className="absolute inset-0 flex items-center justify-center font-mono text-[10px] font-bold text-white">
              {'<>'}
            </div>
          </div>
          <span className="font-mono text-[13px] font-medium tracking-tight text-white">
            devsync
          </span>
          <span className="hidden rounded border border-white/10 bg-white/5 px-1.5 py-0.5 font-mono text-[9px] tracking-widest text-white/40 sm:inline">
            BETA
          </span>
        </Link>

        <div className="hidden items-center gap-7 md:flex">
          <a href="#features" className="font-mono text-xs tracking-tight text-white/50 hover:text-white transition-colors">features</a>
          <a href="#lifecycle" className="font-mono text-xs tracking-tight text-white/50 hover:text-white transition-colors">platform</a>
          <a href="#pricing" className="font-mono text-xs tracking-tight text-white/50 hover:text-white transition-colors">pricing</a>
          <a href="#faq" className="font-mono text-xs tracking-tight text-white/50 hover:text-white transition-colors">faq</a>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/login"
            className="hidden rounded-md px-3 py-1.5 font-mono text-xs text-white/60 hover:text-white hover:bg-white/5 transition-all sm:block"
          >
            sign in
          </Link>
          <Link
            to="/register"
            className="rounded-md border border-white/10 bg-white px-3 py-1.5 font-mono text-xs font-medium text-black transition-all duration-200 hover:bg-green-500"
          >
            get started →
          </Link>
        </div>
      </div>
    </nav>
  );
};