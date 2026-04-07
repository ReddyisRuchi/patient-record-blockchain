"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

// Each cell gets a random delay so they don't all pulse together
function GridCell({ delay, duration }: { delay: number; duration: number }) {
  return (
    <div
      className="h-8 rounded bg-slate-900 dark:bg-white animate-breathe"
      style={{ animationDelay: `${delay}s`, animationDuration: `${duration}s` }}
    />
  );
}

export default function HeroSection() {
  const [cells, setCells] = useState<{ delay: number; duration: number }[]>([]);

  useEffect(() => {
    setCells(
      Array.from({ length: 16 }, () => ({
        delay:    parseFloat((Math.random() * 4).toFixed(2)),
        duration: parseFloat((3 + Math.random() * 3).toFixed(2)),
      }))
    );
  }, []);

  return (
    <section className="bg-white dark:bg-black min-h-[88vh] flex items-center justify-center px-4">
      <div className="container-max w-full">
        <div className="grid md:grid-cols-2 gap-16 items-center">

          {/* Left */}
          <div className="space-y-8">

            {/* Animated grid */}
            <div
              className="grid grid-cols-4 gap-2 w-48 opacity-20"
              style={{ animation: "fadeInUp 0.8s ease 0.1s both", opacity: 0 }}
            >
              {cells.map((cell, i) => (
                <GridCell key={i} delay={cell.delay} duration={cell.duration} />
              ))}
            </div>

            {/* Title */}
            <div style={{ animation: "fadeInUp 0.7s ease 0.3s both", opacity: 0 }}>
              <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white leading-tight">
                Patient Record Management System
              </h1>
              <p className="text-slate-400 dark:text-white/40 text-sm uppercase tracking-widest mt-3">
                Using Blockchain
              </p>
            </div>
          </div>

          {/* Right */}
          <div className="space-y-8">

            {/* Staggered dot labels */}
            <div className="space-y-3">
              {[
                { label: "Blockchain-Secured",   delay: "0.5s",  dotClass: "bg-slate-900 dark:bg-white",     textClass: "text-slate-700 dark:text-white/60" },
                { label: "Role-Based Access",    delay: "0.65s", dotClass: "bg-slate-500 dark:bg-white/40",  textClass: "text-slate-500 dark:text-white/40" },
                { label: "Tamper-Proof Records", delay: "0.8s",  dotClass: "bg-slate-300 dark:bg-white/20",  textClass: "text-slate-400 dark:text-white/20" },
              ].map(({ label, delay, dotClass, textClass }) => (
                <div
                  key={label}
                  className="flex items-center gap-3"
                  style={{ animation: `fadeInUp 0.6s ease ${delay} both`, opacity: 0 }}
                >
                  <div className={`w-2 h-2 rounded-full shrink-0 ${dotClass}`} />
                  <span className={`text-xs uppercase tracking-widest ${textClass}`}>{label}</span>
                </div>
              ))}
            </div>

            {/* CTAs */}
            <div
              className="flex flex-col sm:flex-row gap-3"
              style={{ animation: "fadeInUp 0.6s ease 1s both", opacity: 0 }}
            >
              <Link
                href="/login"
                className="inline-flex items-center justify-center px-6 py-3 rounded-lg font-medium text-white bg-slate-900 hover:bg-slate-700 dark:text-slate-900 dark:bg-white dark:hover:bg-slate-100 transition-all duration-200"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="inline-flex items-center justify-center px-6 py-3 rounded-lg font-medium text-slate-900 dark:text-white border border-slate-300 dark:border-white/30 hover:border-slate-500 dark:hover:border-white/60 hover:bg-slate-50 dark:hover:bg-white/5 transition-all duration-200"
              >
                Create Account
              </Link>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
