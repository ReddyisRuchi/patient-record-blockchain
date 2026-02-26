"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import useAuth from "@/hooks/useAuth";
import api from "@/lib/api";

export default function LoginPage() {
  const [error, setError] = useState("");
  const router = useRouter();
  const { refreshAuth } = useAuth();

  async function handleSubmit(e: any) {
    e.preventDefault();
    setError("");

    const email = e.target.email.value;
    const password = e.target.password.value;

    try {
      await api.post("/api/auth/login", { email, password });

      // refresh auth state
      try {
        await refreshAuth();
      } catch {}

      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Login failed");
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <div className="flex items-center justify-center px-4 py-20">
        <div className="card w-full max-w-md">
          <h2 className="text-2xl font-bold text-blue-600 mb-6 text-center">
            Sign In
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="form-control">
              <label className="block mb-1 text-sm text-slate-600">
                Email
              </label>
              <input
                name="email"
                type="email"
                placeholder="Enter your email"
                required
              />
            </div>

            <div className="form-control">
              <label className="block mb-1 text-sm text-slate-600">
                Password
              </label>
              <input
                name="password"
                type="password"
                placeholder="Enter your password"
                required
              />
            </div>

            <button type="submit" className="btn-primary w-full">
              Sign In
            </button>
          </form>

          {error && (
            <p className="text-red-500 text-sm mt-4 text-center">
              {error}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}