import { motion } from 'framer-motion';
import { Code, GitPullRequest, CheckCircle, Rocket, Monitor } from 'lucide-react';

const steps = [
  { icon: Code, label: 'PLAN', sub: 'CONCEPT' },
  { icon: GitPullRequest, label: 'CODE', sub: 'DEVELOPMENT' },
  { icon: CheckCircle, label: 'REVIEW', sub: 'VALIDATION' },
  { icon: Rocket, label: 'DEPLOY', sub: 'RELEASE' },
  { icon: Monitor, label: 'MONITOR', sub: 'PERFORMANCE' },
];

export const UnifiedLifecycle = () => {
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
            Unified Lifecycle
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            viewport={{ once: true }}
            className="mx-auto mt-4 max-w-2xl text-lg text-white/60"
          >
            End-to-end visibility across your entire development lifecycle.
          </motion.p>
        </div>

        <div className="mt-16 flex flex-wrap items-center justify-center gap-4 sm:gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={step.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="flex items-center gap-4"
            >
              <div className="flex flex-col items-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-white/5">
                  <step.icon className="h-5 w-5 text-white/80" />
                </div>
                <span className="mt-2 text-xs font-semibold uppercase tracking-wider text-white/60">
                  {step.label}
                </span>
                <span className="text-[10px] text-white/30">{step.sub}</span>
              </div>
              {index < steps.length - 1 && (
                <div className="hidden h-px w-8 bg-white/10 sm:block" />
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};