import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Check, Zap } from 'lucide-react';

const plans = [
  {
    name: 'Starter',
    price: '0',
    period: 'month',
    description: 'Perfect for small teams getting started.',
    features: ['Up to 5 users', 'Unlimited tasks', 'Public docs', 'GitHub sync'],
    cta: 'Select',
    popular: false
  },
  {
    name: 'Pro',
    price: '12',
    period: 'month',
    description: 'For teams that need more power and control.',
    features: ['Unlimited users', 'Private documentation', 'Advanced analytics', 'GitHub Enterprise sync'],
    cta: 'Start Trial',
    popular: true
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: 'month',
    description: 'For organizations with complex needs.',
    features: ['Dedicated success manager', 'SSO/SCIM', 'Custom API rate limits', 'On-premise options'],
    cta: 'Contact Sales',
    popular: false
  }
];

export const Pricing = () => {
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
            Scalable Plans
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            viewport={{ once: true }}
            className="mx-auto mt-4 max-w-2xl text-lg text-white/60"
          >
            Simple pricing for teams of all sizes.
          </motion.p>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-3">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              viewport={{ once: true }}
              className={`relative rounded-2xl border p-8 transition-all ${
                plan.popular
                  ? 'border-white/20 bg-white/10 shadow-2xl shadow-white/5'
                  : 'border-white/5 bg-white/5 hover:border-white/20'
              }`}
            >
              {plan.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-white px-3 py-0.5 text-xs font-medium text-black">
                  MOST POPULAR
                </span>
              )}
              <h3 className="text-lg font-semibold text-white">{plan.name}</h3>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-4xl font-bold text-white">${plan.price}</span>
                <span className="text-sm text-white/40">/{plan.period}</span>
              </div>
              <p className="mt-2 text-sm text-white/40">{plan.description}</p>
              <ul className="mt-6 space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-3 text-sm text-white/60">
                    <Check className="h-4 w-4 text-white/40" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Link
                to={plan.popular ? '/register' : plan.name === 'Enterprise' ? '/contact' : '/register'}
                className={`mt-8 block w-full rounded-full py-3 text-center text-sm font-semibold transition-all ${
                  plan.popular
                    ? 'bg-white text-black hover:bg-white/90'
                    : 'border border-white/20 text-white hover:bg-white/10'
                }`}
              >
                {plan.cta}
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};