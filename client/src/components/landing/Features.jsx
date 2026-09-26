import React from 'react';
import { motion } from 'framer-motion';
import {
  Shield,
  KeyRound,
  LockKeyhole,
  Users,
  UserRoundX,
  Timer,
} from 'lucide-react';

const features = [
  {
    icon: Shield,
    title: 'Temporary Rooms',
    desc:
      'Create isolated rooms for sharing sensitive information without creating a permanent workspace or account.',
    color: 'var(--brand-mint)',
  },
  {
    icon: KeyRound,
    title: 'Access-Controlled',
    desc:
      'Protect every room with an access code. Only participants with the correct room details can enter.',
    color: 'var(--brand-blue)',
  },
  {
    icon: LockKeyhole,
    title: 'Encrypted Data',
    desc:
      'Protect sensitive content with encryption so your shared information is not stored as plain text.',
    color: 'var(--brand-violet)',
  },
  {
    icon: Users,
    title: 'Real-Time Collaboration',
    desc:
      'Multiple participants can join the same room and work with shared information in real time.',
    color: 'var(--brand-mint)',
  },
  {
    icon: UserRoundX,
    title: 'No Account Required',
    desc:
      'Join a room using a display name and access details. No email, registration, or permanent profile is required.',
    color: 'var(--semantic-info)',
  },
  {
    icon: Timer,
    title: 'Automatic Expiry',
    desc:
      'Rooms are designed to be temporary. When the configured lifetime ends, the room and its contents can be removed automatically.',
    color: 'var(--semantic-warning)',
  },
];

export const Features = () => {
  return (
    <section id="features" className="py-24 bg-canvas-black">
      <div className="max-w-7xl mx-auto px-6">

        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">

          <h2 className="text-heading-lg text-text-primary text-3xl md:text-4xl mb-4">
            Built for Secure Sharing
          </h2>

          <p className="text-body text-text-secondary text-lg">
            Everything you need to create a temporary, controlled space for
            sharing sensitive information with others.
          </p>

        </div>

        {/* Features */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">

          {features.map((feature, idx) => {
            const Icon = feature.icon;

            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{
                  duration: 0.5,
                  delay: idx * 0.1,
                }}
                whileHover={{
                  y: -5,
                  transition: { duration: 0.2 },
                }}
                className="bg-surface-slate border border-surface-border rounded-2xl p-6 relative overflow-hidden group hover:border-brand-mint/50 hover:shadow-lg transition-all"
              >

                {/* Glow */}
                <div
                  className="absolute top-0 right-0 w-32 h-32 opacity-10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:opacity-20 transition-opacity"
                  style={{
                    backgroundImage: `linear-gradient(to bottom right, ${feature.color}, transparent)`,
                  }}
                />

                {/* Icon */}
                <div className="w-12 h-12 rounded-xl border border-surface-border bg-surface-elevated flex items-center justify-center mb-6">
                  <Icon
                    className="w-6 h-6"
                    style={{ color: feature.color }}
                  />
                </div>

                {/* Content */}
                <h3 className="text-heading-md text-text-primary mb-3">
                  {feature.title}
                </h3>

                <p className="text-body text-text-secondary">
                  {feature.desc}
                </p>

              </motion.div>
            );
          })}

        </div>
      </div>
    </section>
  );
};