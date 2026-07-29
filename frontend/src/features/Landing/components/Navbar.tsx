import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, ChevronDown } from 'lucide-react';

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed top-0 z-50 w-full border-b border-white/5 bg-black/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5">
          <span className="h-6 w-6 rounded-[4px] border-2 border-white" />
          <span className="text-sm font-bold tracking-[0.08em] text-white">DEVSYNC</span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden items-center gap-8 lg:flex">
          <Link to="/features" className="text-sm text-white/60 hover:text-white transition-colors">
            Features
          </Link>
          <Link to="/solutions" className="text-sm text-white/60 hover:text-white transition-colors">
            Solutions
          </Link>
          <Link to="/pricing" className="text-sm text-white/60 hover:text-white transition-colors">
            Pricing
          </Link>
          <Link to="/resources" className="text-sm text-white/60 hover:text-white transition-colors">
            Resources
          </Link>
          <div className="flex items-center gap-4">
           
            <Link
              to="/login"
              className="rounded-full border border-white/20 px-5 py-2 text-sm font-medium text-white transition-all hover:bg-white hover:text-black"
            >
              Get Started
            </Link>
          </div>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="lg:hidden text-white/60 hover:text-white"
        >
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="border-t border-white/5 bg-black/95 px-4 py-6 lg:hidden">
          <div className="flex flex-col space-y-4">
            <Link to="/features" className="text-sm text-white/60 hover:text-white">Features</Link>
            <Link to="/solutions" className="text-sm text-white/60 hover:text-white">Solutions</Link>
            <Link to="/pricing" className="text-sm text-white/60 hover:text-white">Pricing</Link>
            <Link to="/resources" className="text-sm text-white/60 hover:text-white">Resources</Link>
            <div className="flex flex-col gap-3 pt-4 border-t border-white/10">
              <Link to="/login" className="text-sm text-white/60 hover:text-white">Login</Link>
              <Link
                to="/register"
                className="rounded-full border border-white/20 px-5 py-2 text-center text-sm font-medium text-white hover:bg-white hover:text-black transition-all"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};