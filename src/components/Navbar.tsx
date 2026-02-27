"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import useAuth from "@/hooks/useAuth";

export default function Navbar() {
  const router = useRouter();
  const { user, loading, refreshAuth } = useAuth();

  const handleLogout = async () => {
    try {
      await api.post("/api/auth/logout");
      await refreshAuth();
    } catch (e) {
      // ignore
    } finally {
      router.push("/");
    }
  };

  const isLoggedIn = Boolean(user);

  return (
  <nav className="navbar">
    <div className="container-max flex justify-between items-center py-4">
      
      <div className="flex items-center gap-4">
        <h1 className="nav-title">HealthChain</h1>

        <div className="hidden md:flex gap-4 items-center">

          {/* Show Home ONLY when NOT logged in */}
          {!isLoggedIn && (
            <Link href="/" className="text-slate-700 hover:text-blue-600">
              Home
            </Link>
          )}

          {/* Show protected links only when logged in */}
          {isLoggedIn && (
            <>
              <Link href="/dashboard" className="text-slate-700 hover:text-blue-600">
                Dashboard
              </Link>

              <Link href="/records" className="text-slate-700 hover:text-blue-600">
                Records
              </Link>

              {/* Only doctors can see Submit */}
              {user?.role === "DOCTOR" && (
                <Link href="/submit" className="text-slate-700 hover:text-blue-600">
                  Submit
                </Link>
              )}
            </>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4">
        {!isLoggedIn ? (
          <>
            <Link href="/login" className="text-slate-700 hover:text-blue-600">
              Login
            </Link>
            <Link href="/register" className="btn-primary">
              Register
            </Link>
          </>
        ) : (
          <button onClick={handleLogout} className="btn-secondary">
            Logout
          </button>
        )}
      </div>
    </div>
  </nav>
);
}
