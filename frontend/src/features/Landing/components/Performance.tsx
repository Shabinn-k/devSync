import { motion } from 'framer-motion';
import { Zap, Shield, GitBranch, LayoutGrid, MessageSquare } from 'lucide-react';

const stats = [
  { label: 'Reduced Latency', value: '99.9%', icon: Zap, desc: 'Engineered for excellence' },
  { label: 'End-to-End Encryption', value: 'AES-256', icon: Shield, desc: 'Bank-grade security' },
  { label: 'Real-Time Syncing', value: '<50ms', icon: GitBranch, desc: 'Instant updates' },
];

export const Performance = () => {
  return (
    <section className="border-t border-white/5 py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-3xl font-bold text-white sm:text-4xl"
          >
            High-Fidelity Interaction
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            viewport={{ once: true }}
            className="mx-auto mt-4 max-w-2xl text-lg text-white/60"
          >
            Every interface is designed with a focus on information density and visual clarity.
          </motion.p>
        </div>
 
        <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-3">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="rounded-2xl border border-white/5 bg-white/5 p-8 text-center"
            >
              <stat.icon className="mx-auto h-10 w-10 text-white/40" />
              <div className="mt-4 text-3xl font-bold text-white">{stat.value}</div>
              <div className="mt-2 text-sm font-medium text-white">{stat.label}</div>
              <div className="mt-1 text-sm text-white/40">{stat.desc}</div>
            </motion.div>
          ))}
        </div>

        <div className="mt-16 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="rounded-2xl border border-white/5 bg-white/5 p-8"
          >
            <div className="flex items-center gap-3">
              <LayoutGrid className="h-6 w-6 text-white/60" />
              <h3 className="text-lg font-semibold text-white">Kanban Interface</h3>
            </div>
            <p className="mt-3 text-sm text-white/40">
              High-density boards optimized for keyboard-first navigation.
              Drag-and-drop with zero lag.
            </p>
            <div className="mt-6 flex items-center gap-2 rounded-lg border border-white/10 bg-black/30 px-4 py-3">
              <span className="text-xs font-medium text-white/60">DEVSYNC</span>
              <span className="text-xs text-white/30">|</span>
              <span className="text-xs text-white/40">DS DevSync Projects</span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="rounded-2xl border border-white/5 bg-white/5 p-8"
          >
            <div className="flex items-center gap-3">
              <MessageSquare className="h-6 w-6 text-white/60" />
              <h3 className="text-lg font-semibold text-white">Collaborative Chat</h3>
            </div>
            <p className="mt-3 text-sm text-white/40">
              Threaded discussions integrated directly with pull requests.
              Real-time multi-player editing.
            </p>
            <div className="mt-6 flex items-center gap-2 rounded-lg border border-white/10 bg-black/30 px-4 py-3">
              <span className="text-xs font-medium text-white/60">#general</span>
              <span className="text-xs text-white/30">|</span>
              <span className="text-xs text-white/40">3 active members</span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};