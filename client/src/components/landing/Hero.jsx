import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Plus,
  LogIn,
  ShieldCheck,
  Clock3,
} from 'lucide-react';

export const Hero = () => {
  return (
    <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden bg-canvas-black">

      {/* Background grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--surface-border)_1px,transparent_1px),linear-gradient(to_bottom,var(--surface-border)_1px,transparent_1px)] bg-size-[4rem_4rem] mask-[radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-20" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">

        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">

          {/* Left - Hero content */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
            className="flex flex-col gap-6"
          >

            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-mint/10 border border-brand-mint/20 w-fit">
              <span className="w-2 h-2 rounded-full bg-brand-mint animate-pulse" />

              <span className="text-mono text-[10px] text-brand-mint uppercase tracking-wider">
                SECURE • TEMPORARY • NO ACCOUNT
              </span>
            </div>

            {/* Heading */}
            <h1 className="text-display text-text-primary text-4xl md:text-5xl lg:text-6xl leading-[1.05]">
              Secure Sharing,
              <br />
              <span className="text-brand-mint">
                Without the Account.
              </span>
            </h1>

            {/* Description */}
            <p className="text-body text-text-secondary text-lg md:text-xl max-w-xl">
              Create a temporary encrypted room, share the access details,
              and collaborate securely with your team — no registration required.
            </p>

            {/* Product highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-2">

              <div className="flex items-center gap-2 p-3 bg-surface-slate/40 border border-surface-border/60 rounded-xl">
                <ShieldCheck className="w-5 h-5 text-brand-mint shrink-0" />

                <span className="text-mono text-xs text-text-secondary">
                  Protected Rooms
                </span>
              </div>

              <div className="flex items-center gap-2 p-3 bg-surface-slate/40 border border-surface-border/60 rounded-xl">
                <Clock3 className="w-5 h-5 text-brand-mint shrink-0" />

                <span className="text-mono text-xs text-text-secondary">
                  Auto Expiry
                </span>
              </div>

              <div className="flex items-center gap-2 p-3 bg-surface-slate/40 border border-surface-border/60 rounded-xl">
                <LogIn className="w-5 h-5 text-brand-mint shrink-0" />

                <span className="text-mono text-xs text-text-secondary">
                  No Account
                </span>
              </div>

            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center gap-4 mt-2">

              <Link
                to="/create"
                className="flex items-center gap-2 bg-brand-mint text-canvas-black px-6 py-3.5 rounded-button font-mono text-sm uppercase tracking-wider hover:bg-text-primary transition-colors"
              >
                <Plus className="w-4 h-4" />
                Create a Room
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                to="/join"
                className="flex items-center gap-2 bg-surface-slate border border-surface-border text-text-primary px-6 py-3.5 rounded-button font-mono text-sm uppercase tracking-wider hover:bg-surface-elevated transition-colors"
              >
                <LogIn className="w-4 h-4" />
                Join a Room
              </Link>

            </div>

          </motion.div>

          {/* Right - Room visual */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.15 }}
            className="relative"
          >

            <div className="relative rounded-3xl border border-surface-border bg-surface-slate/70 backdrop-blur-sm p-6 md:p-8 shadow-[0_0_60px_-20px_rgba(46,204,113,0.25)]">

              {/* Window header */}
              <div className="flex items-center justify-between pb-5 border-b border-surface-border">

                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-brand-mint animate-pulse" />

                  <span className="text-mono text-xs text-text-secondary uppercase">
                    Secure Room
                  </span>
                </div>

                <span className="text-mono text-xs text-text-muted">
                  ACTIVE
                </span>

              </div>

              {/* Room information */}
              <div className="py-8">

                <p className="text-mono text-xs text-text-muted uppercase mb-2">
                  Room Code
                </p>

                <div className="flex items-center justify-between bg-canvas-black border border-surface-border rounded-xl px-5 py-4">
                  <span className="text-text-primary text-2xl md:text-3xl font-mono tracking-[0.25em]">
                    X7K92
                  </span>

                  <span className="text-mono text-xs text-brand-mint">
                    READY
                  </span>
                </div>

              </div>

              {/* Access */}
              <div className="space-y-3">

                <div className="flex items-center justify-between p-4 bg-canvas-black/60 border border-surface-border rounded-xl">
                  <div>
                    <p className="text-mono text-xs text-text-muted">
                      ACCESS
                    </p>

                    <p className="text-sm text-text-primary mt-1">
                      Protected
                    </p>
                  </div>

                  <ShieldCheck className="w-5 h-5 text-brand-mint" />
                </div>

                <div className="flex items-center justify-between p-4 bg-canvas-black/60 border border-surface-border rounded-xl">
                  <div>
                    <p className="text-mono text-xs text-text-muted">
                      EXPIRATION
                    </p>

                    <p className="text-sm text-text-primary mt-1">
                      24 hours
                    </p>
                  </div>

                  <Clock3 className="w-5 h-5 text-brand-mint" />
                </div>

              </div>

              {/* Participants */}
              <div className="mt-6 pt-5 border-t border-surface-border flex items-center justify-between">

                <span className="text-mono text-xs text-text-secondary">
                  3 participants connected
                </span>

                <div className="flex -space-x-2">
                  <div className="w-8 h-8 rounded-full bg-surface-elevated border-2 border-surface-slate flex items-center justify-center text-xs text-text-primary">
                    L
                  </div>

                  <div className="w-8 h-8 rounded-full bg-surface-elevated border-2 border-surface-slate flex items-center justify-center text-xs text-text-primary">
                    R
                  </div>

                  <div className="w-8 h-8 rounded-full bg-surface-elevated border-2 border-surface-slate flex items-center justify-center text-xs text-text-primary">
                    A
                  </div>
                </div>

              </div>

            </div>

          </motion.div>

        </div>
      </div>
    </section>
  );
};