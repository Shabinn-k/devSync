import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Zap, Shield, GitBranch } from 'lucide-react';

export const Hero = () => {
  return (
    <section className="relative overflow-hidden pt-32 pb-20 sm:pt-40 sm:pb-28">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/5 via-transparent to-transparent" />
      
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
        
          {/* Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl font-extrabold tracking-tight text-white sm:text-6xl lg:text-7xl"
          >
            Build Better
            <br />
            <span className="bg-gradient-to-r from-white via-white/80 to-white/50 bg-clip-text text-transparent">
              Software.
            </span>
          </motion.h1>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mx-auto mt-6 max-w-2xl text-lg text-white/60"
          >
            The unified workspace for high-velocity engineering teams.
            Sync code, tasks, and documentation in a single,
            distraction-free environment.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
          >
            <Link
              to="/register"
              className="group inline-flex items-center gap-2 rounded-full bg-white px-8 py-3.5 text-sm font-semibold text-black transition-all hover:bg-white/90"
            >
              Start Free Trial
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              to="/features"
              className="inline-flex items-center gap-2 rounded-full border border-white/10 px-8 py-3.5 text-sm font-medium text-white/80 transition-all hover:border-white/30 hover:text-white"
            >
              View Features
            </Link>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-3"
          >
            <div>
              <div className="flex items-center justify-center gap-2">
                <Zap className="h-5 w-5 text-white/40" />
                <span className="text-2xl font-bold text-white">99.9%</span>
              </div>
              <p className="mt-1 text-sm text-white/40">Uptime Guaranteed</p>
            </div>
            <div>
              <div className="flex items-center justify-center gap-2">
                <Shield className="h-5 w-5 text-white/40" />
                <span className="text-2xl font-bold text-white">SOC2</span>
              </div>
              <p className="mt-1 text-sm text-white/40">Compliant</p>
            </div>
            <div>
              <div className="flex items-center justify-center gap-2">
                <GitBranch className="h-5 w-5 text-white/40" />
                <span className="text-2xl font-bold text-white">10k+</span>
              </div>
              <p className="mt-1 text-sm text-white/40">Teams Trust Us</p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};