import { motion } from 'framer-motion';
import { Star } from 'lucide-react';

const testimonials = [
  {
    quote: "DevSync is the first tool that actually keeps up with our deployment velocity. The GitHub integration is flawless.",
    author: "Sarah Jenkins",
    role: "CTO, CloudScale",
    rating: 5
  },
  {
    quote: "We've reduced our sprint planning time by 40% since switching. The information density is exactly what pros need.",
    author: "Elena Rodriguez",
    role: "Staff Engineer, LinearFlow",
    rating: 5
  },
  {
    quote: "Stark, minimal, and incredibly fast. It feels like an extension of my terminal rather than a heavy web app.",
    author: "Marcus Chen",
    role: "Senior Dev, NexaLabs",
    rating: 5
  }
];

export const Testimonials = () => {
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
            Built for Developers,
            <br />
            by Developers
          </motion.h2>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.author}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="rounded-2xl border border-white/5 bg-white/5 p-8 transition-all hover:border-white/20"
            >
              <div className="flex gap-0.5">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-white/60 text-white/60" />
                ))}
              </div>
              <p className="mt-4 text-sm leading-relaxed text-white/70">
                "{testimonial.quote}"
              </p>
              <div className="mt-6">
                <p className="font-semibold text-white">{testimonial.author}</p>
                <p className="text-sm text-white/40">{testimonial.role}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};