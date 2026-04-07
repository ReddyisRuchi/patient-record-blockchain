"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import AuthContext from "@/context/AuthContext";

const TIMEOUT_MS    = 15 * 60 * 1000; // 15 min inactivity
const WARNING_MS    = 60 * 1000;       // warn 60s before

export default function AuthProvider({ children }) {
  const [user, setUser]           = useState(null);
  const [loading, setLoading]     = useState(true);
  const [showWarning, setShowWarning] = useState(false);
  const [countdown, setCountdown] = useState(60);

  const timeoutRef  = useRef(null);
  const warningRef  = useRef(null);
  const countRef    = useRef(null);

  const fetchUser = useCallback(async () => {
    try {
      const res  = await fetch("/api/auth/me", { credentials: "same-origin" });
      const data = await res.json();
      setUser(data?.user || null);
    } catch { setUser(null); }
    finally { setLoading(false); }
  }, []);

  const logout = useCallback(async () => {
    setShowWarning(false);
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    window.location.href = "/login";
  }, []);

  const resetTimer = useCallback(() => {
    if (!user) return;
    setShowWarning(false);
    clearTimeout(timeoutRef.current);
    clearTimeout(warningRef.current);
    clearInterval(countRef.current);

    warningRef.current = setTimeout(() => {
      setShowWarning(true);
      setCountdown(60);
      countRef.current = setInterval(() => {
        setCountdown((c) => {
          if (c <= 1) { clearInterval(countRef.current); logout(); return 0; }
          return c - 1;
        });
      }, 1000);
    }, TIMEOUT_MS - WARNING_MS);

    timeoutRef.current = setTimeout(logout, TIMEOUT_MS);
  }, [user, logout]);

  useEffect(() => { fetchUser(); }, []);

  useEffect(() => {
    if (!user) return;
    const events = ["mousemove", "keydown", "click", "scroll", "touchstart"];
    events.forEach((e) => window.addEventListener(e, resetTimer));
    resetTimer();
    return () => {
      events.forEach((e) => window.removeEventListener(e, resetTimer));
      clearTimeout(timeoutRef.current);
      clearTimeout(warningRef.current);
      clearInterval(countRef.current);
    };
  }, [user, resetTimer]);

  return (
    <AuthContext.Provider value={{ user, loading, refreshAuth: fetchUser }}>
      {children}

      {/* Session timeout warning */}
      {showWarning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-6 w-full max-w-sm mx-4 space-y-4 animate-slideUp">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Session Expiring</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              You'll be logged out in <span className="font-bold text-slate-900 dark:text-white">{countdown}s</span> due to inactivity.
            </p>
            <div className="flex gap-3">
              <button onClick={resetTimer} className="btn-primary flex-1">Stay Logged In</button>
              <button onClick={logout} className="btn-outline flex-1">Logout</button>
            </div>
          </div>
        </div>
      )}
    </AuthContext.Provider>
  );
}
