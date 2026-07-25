import { motion } from 'framer-motion';

const companies = [
  { name: 'GitHub', color: 'text-white/60' },
  { name: 'Microsoft', color: 'text-white/60' },
  { name: 'Google', color: 'text-white/60' },
  { name: 'Amazon', color: 'text-white/60' },
  { name: 'Netflix', color: 'text-white/60' },
  { name: 'Spotify', color: 'text-white/60' },
  { name: 'Adobe', color: 'text-white/60' },
];

export const TrustedBy = () => {
  return (
    <section className="border-t border-white/5 py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <p className="text-center text-xs font-medium uppercase tracking-wider text-white/30">
          Trusted by the world's most innovative teams
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-8 sm:gap-12">
          {companies.map((company, index) => (
            <motion.span
              key={company.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className={`text-sm font-semibold tracking-wide ${company.color} hover:text-white/90 transition-colors`}
            >
              {company.name}
            </motion.span>
          ))}
        </div>
      </div>
    </section>
  );
};