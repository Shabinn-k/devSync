import { Link } from 'react-router-dom';

export const Footer = () => {
  return (
    <footer className="border-t border-white/5 bg-black/50 py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <span className="h-5 w-5 rounded-[4px] border-2 border-white" />
              <span className="text-sm font-bold tracking-[0.08em] text-white">DEVSYNC</span>
            </div>
            <p className="text-sm text-white/40">
              The technical editor for software teams. Precision engineered in San Francisco.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white">Platform</h4>
            <ul className="mt-4 space-y-2">
              <li><Link to="/features" className="text-sm text-white/40 hover:text-white">Features</Link></li>
              <li><Link to="/pricing" className="text-sm text-white/40 hover:text-white">Pricing</Link></li>
              <li><Link to="/desktop" className="text-sm text-white/40 hover:text-white">Desktop App</Link></li>
              <li><Link to="/api" className="text-sm text-white/40 hover:text-white">API</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white">Resources</h4>
            <ul className="mt-4 space-y-2">
              <li><Link to="/docs" className="text-sm text-white/40 hover:text-white">Documentation</Link></li>
              <li><Link to="/guides" className="text-sm text-white/40 hover:text-white">Guides</Link></li>
              <li><Link to="/changelog" className="text-sm text-white/40 hover:text-white">Changelog</Link></li>
              <li><Link to="/status" className="text-sm text-white/40 hover:text-white">Status</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white">Company</h4>
            <ul className="mt-4 space-y-2">
              <li><Link to="/about" className="text-sm text-white/40 hover:text-white">About</Link></li>
              <li><Link to="/careers" className="text-sm text-white/40 hover:text-white">Careers</Link></li>
              <li><Link to="/privacy" className="text-sm text-white/40 hover:text-white">Privacy</Link></li>
              <li><Link to="/terms" className="text-sm text-white/40 hover:text-white">Terms</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-12 border-t border-white/5 pt-8 flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-xs text-white/30">© 2024 DEVSYNC INC. ALL RIGHTS RESERVED.</p>
          <div className="flex items-center gap-4">
            <span className="text-xs text-white/30">LATENCY: 14MS</span>
            <span className="h-1.5 w-1.5 rounded-full bg-green-400" />
            <span className="text-xs text-white/30">STATUS: OPTIMAL</span>
          </div>
        </div>
      </div>
    </footer>
  );
};