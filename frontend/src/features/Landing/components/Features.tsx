import { motion } from 'framer-motion';
import { 
  LayoutGrid, MessageSquare, GitBranch, FileText,
  GitPullRequest, Shield, Bell, BarChart3,
} from 'lucide-react';

const features = [
  {
    icon: LayoutGrid,
    title: 'Task Management',
    description: 'High-density kanban boards optimized for keyboard-first navigation.'
  },
  {
    icon: MessageSquare,
    title: 'Real-time Chat',
    description: 'Threaded discussions integrated directly with your pull requests.'
  },
  {
    icon: GitBranch,
    title: 'GitHub Sync',
    description: 'Two-way synchronization between your issues and DevSync tasks.'
  },
  {
    icon: FileText,
    title: 'Documentation',
    description: 'Markdown-first docs with built-in versioning and component previews.'
  },
  {
    icon: GitPullRequest,
    title: 'Timeline',
    description: 'Visualize dependencies and release cycles across multiple squads.'
  },
  {
    icon: Shield,
    title: 'Permissions',
    description: 'Granular RBAC and SSO integration for enterprise-grade security.'
  },
  {
    icon: Bell,
    title: 'Notifications',
    description: 'Smart filtering to ensure you only see what\'s critical for your workflow.'
  },
  {
    icon: BarChart3,
    title: 'Analytics',
    description: 'DORA metrics and velocity charts generated automatically from activity.'
  },
];

export const Features = () => {
  return (
    <section className="py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-3xl font-bold text-white sm:text-4xl"
          >
            Engineered for Excellence
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            viewport={{ once: true }}
            className="mx-auto mt-4 max-w-2xl text-lg text-white/60"
          >
            Every feature is designed with precision for high-velocity engineering teams.
          </motion.p>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              viewport={{ once: true }}
              className="group rounded-2xl border border-white/5 bg-white/5 p-6 transition-all hover:border-white/20 hover:bg-white/10"
            >
              <feature.icon className="h-8 w-8 text-white/60 group-hover:text-white transition-colors" />
              <h3 className="mt-4 text-sm font-semibold text-white">{feature.title}</h3>
              <p className="mt-2 text-sm text-white/40">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};