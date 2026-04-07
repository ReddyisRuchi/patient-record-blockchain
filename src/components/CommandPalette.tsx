"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import useAuth from "@/hooks/useAuth";

const allCommands = [
  { label: "Dashboard",      href: "/dashboard",      roles: ["PATIENT","HEALTHCARE_ADMIN","ADMIN"] },
  { label: "View Records",   href: "/records",         roles: ["PATIENT","HEALTHCARE_ADMIN","ADMIN"] },
  { label: "Verify Record",  href: "/verify",          roles: ["PATIENT","HEALTHCARE_ADMIN","ADMIN"] },
  { label: "Create Record",  href: "/doctor_submit",   roles: ["HEALTHCARE_ADMIN"] },
  { label: "Audit Log",      href: "/audit",           roles: ["HEALTHCARE_ADMIN","ADMIN"] },
  { label: "My Profile",     href: "/admin/profile",   roles: ["HEALTHCARE_ADMIN"] },
  { label: "Settings",       href: "/settings",        roles: ["PATIENT","HEALTHCARE_ADMIN","ADMIN"] },
  { label: "About",          href: "/about",           roles: ["PATIENT","HEALTHCARE_ADMIN","ADMIN"] },
];

export default function CommandPalette() {
  const [open, setOpen]     = useState(false);
  const [query, setQuery]   = useState("");
  const [active, setActive] = useState(0);
  const inputRef            = useRef<HTMLInputElement>(null);
  const router              = useRouter();
  const { user }            = useAuth();

  const commands = allCommands.filter((c) =>
    (!user || c.roles.includes(user.role)) &&
    c.label.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((o) => !o);
        setQuery("");
        setActive(0);
      }
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50);
  }, [open]);

  const navigate = (href: string) => {
    setOpen(false);
    router.push(href);
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setActive((a) => Math.min(a + 1, commands.length - 1)); }
    if (e.key === "ArrowUp")   { e.preventDefault(); setActive((a) => Math.max(a - 1, 0)); }
    if (e.key === "Enter" && commands[active]) navigate(commands[active].href);
  };

  if (!open) return (
    <button
      onClick={() => setOpen(true)}
      className="hidden md:flex items-center gap-2 text-xs text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 hover:border-slate-400 dark:hover:border-slate-500 transition-colors"
    >
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
      </svg>
      Search
      <kbd className="ml-1 font-mono bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded text-[10px]">⌘K</kbd>
    </button>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 bg-black/50 backdrop-blur-sm" onClick={() => setOpen(false)}>
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden animate-slideUp" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-3 px-4 py-3 border-b dark:border-slate-700">
          <svg width="16" height="16" className="text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => { setQuery(e.target.value); setActive(0); }}
            onKeyDown={handleKey}
            placeholder="Search pages..."
            className="flex-1 bg-transparent text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none text-sm"
          />
          <kbd className="text-xs text-slate-400 font-mono bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded">Esc</kbd>
        </div>
        <div className="py-2 max-h-64 overflow-y-auto">
          {commands.length === 0 ? (
            <p className="text-sm text-slate-400 dark:text-slate-500 text-center py-6">No results</p>
          ) : commands.map((cmd, i) => (
            <button
              key={cmd.href}
              onClick={() => navigate(cmd.href)}
              onMouseEnter={() => setActive(i)}
              className={`w-full text-left px-4 py-2.5 text-sm flex items-center gap-3 transition-colors
                ${i === active ? "bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white" : "text-slate-600 dark:text-slate-300"}`}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
              {cmd.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
