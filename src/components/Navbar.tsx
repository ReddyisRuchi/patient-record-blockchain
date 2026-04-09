"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import api from "@/lib/api";
import useAuth from "@/hooks/useAuth";
import { useTheme } from "@/components/ThemeProvider";
import CommandPalette from "@/components/CommandPalette";

export default function Navbar() {
  const router   = useRouter();
  const pathname = usePathname();
  const { user, refreshAuth } = useAuth();
  const { dark, toggle } = useTheme();

  const isLoggedIn = Boolean(user);
  const isAuthPage = pathname === "/login" || pathname === "/register";

  const navLink = (href: string, label: string) => {
    const active = pathname === href || pathname.startsWith(href + "/");
    return (
      <Link
        href={href}
        className={`relative text-sm transition-colors pb-0.5
          ${active
            ? "text-slate-900 dark:text-white font-semibold after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-slate-900 after:dark:bg-white after:rounded-full"
            : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
          }`}
      >
        {label}
      </Link>
    );
  };

  const handleLogout = async () => {
    try {
      await api.post("/api/auth/logout");
      await refreshAuth();
    } catch {}
    finally { router.push("/"); }
  };

  return (
    <nav className="navbar">
      <div className="w-full px-6 flex justify-between items-center py-4">

        <div className="flex items-center gap-4">
          <Link href={isLoggedIn ? "/dashboard" : "/"} className="flex flex-col leading-tight mr-2">
            <span className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">Patient Record Management System</span>
            <span className="text-xs text-slate-400 dark:text-neutral-500 tracking-widest uppercase">Using Blockchain</span>
          </Link>

          <div className="hidden md:flex gap-4 items-center">
            {!isLoggedIn && navLink("/", "Home")}
            {isLoggedIn && (
              <>
                {navLink("/dashboard", "Dashboard")}
                {navLink("/records", "Records")}
                {user?.role === "HEALTHCARE_ADMIN" && navLink("/doctor_submit", "Create Record")}
                {user?.role === "HEALTHCARE_ADMIN" && navLink("/audit", "Audit")}
              </>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4">
          {isLoggedIn && <CommandPalette />}

          <button
            onClick={toggle}
            aria-label="Toggle dark mode"
            className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-neutral-900 transition-colors"
          >
            {dark ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="4"/>
                <line x1="12" y1="2" x2="12" y2="4"/>
                <line x1="12" y1="20" x2="12" y2="22"/>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                <line x1="2" y1="12" x2="4" y2="12"/>
                <line x1="20" y1="12" x2="22" y2="12"/>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
              </svg>
            )}
          </button>

          {/* Login/Register removed from navbar — use login/register pages directly */}
          {isLoggedIn && (
            <>
              <button
                onClick={() => router.push(user?.role === "HEALTHCARE_ADMIN" ? "/admin/profile" : `/patients/${user?.id}`)}
                className="text-sm text-slate-600 dark:text-slate-300 font-bold hidden md:block tracking-widest uppercase hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                {user?.name}
              </button>
              <span className={`hidden md:inline-block text-xs font-medium px-2 py-0.5 rounded-full ${
                user?.role === "HEALTHCARE_ADMIN"
                  ? "bg-slate-900 text-white dark:bg-white dark:text-black"
                  : "bg-slate-100 text-slate-600 dark:bg-neutral-800 dark:text-neutral-300"
              }`}>
                {user?.role === "HEALTHCARE_ADMIN" ? "Admin" : user?.role === "PATIENT" ? "Patient" : user?.role}
              </span>
              <button onClick={handleLogout} className="btn-secondary">
                Logout
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
