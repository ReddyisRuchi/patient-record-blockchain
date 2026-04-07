"use client";

import { useEffect, useRef } from "react";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";

const features = [
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
        <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
      </svg>
    ),
    label: "Encrypted Storage",
    desc: "Every record is hashed and stored on-chain, making tampering detectable.",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ),
    label: "Role-Based Access",
    desc: "Patients, healthcare admins, and donors each have scoped permissions.",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="9 11 12 14 22 4"/>
        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
      </svg>
    ),
    label: "Integrity Verification",
    desc: "Any record can be verified against its blockchain hash at any time.",
  },
];

function FeatureStrip() {
  const refs = useRef([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.style.animation = `revealUp 0.6s ease ${entry.target.dataset.delay} both`;
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );

    refs.current.forEach((el) => { if (el) observer.observe(el); });
    return () => observer.disconnect();
  }, []);

  return (
    <section className="bg-white dark:bg-slate-800">
      <div className="container-max">
        <div className="grid md:grid-cols-3">
          {features.map((f, i) => (
            <div
              key={f.label}
              ref={(el) => (refs.current[i] = el)}
              data-delay={`${0.1 + i * 0.15}s`}
              className="flex items-start gap-4 px-8 py-10 opacity-0"
            >
              <div className="text-slate-400 dark:text-slate-500 shrink-0 mt-0.5">{f.icon}</div>
              <div>
                <p className="font-semibold text-slate-900 dark:text-white text-sm mb-1">{f.label}</p>
                <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <>
      <Navbar />
      <HeroSection />
      <FeatureStrip />
    </>
  );
}
