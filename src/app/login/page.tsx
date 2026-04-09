"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import useAuth from "@/hooks/useAuth";
import api from "@/lib/api";

export default function LoginPage() {
  const [error, setError]         = useState("");
  const [walletLoading, setWalletLoading] = useState(false);
  const router = useRouter();
  const { refreshAuth } = useAuth();

  async function handleSubmit(e: any) {
    e.preventDefault();
    setError("");
    try {
      await api.post("/api/auth/login", { email: e.target.email.value, password: e.target.password.value });
      await refreshAuth().catch(() => {});
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Login failed");
    }
  }

  async function handleWalletLogin() {
    setError("");
    setWalletLoading(true);
    try {
      const { ethereum } = window as any;
      if (!ethereum) { setError("MetaMask not found. Please install it."); setWalletLoading(false); return; }

      // Request account
      const accounts = await ethereum.request({ method: "eth_requestAccounts" });
      const walletAddress = accounts[0];

      // Get nonce
      const nonceRes  = await fetch("/api/auth/wallet/nonce", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ walletAddress }),
      });
      const { message } = await nonceRes.json();

      // Sign message
      const signature = await ethereum.request({
        method: "personal_sign",
        params: [message, walletAddress],
      });

      // Verify
      const verifyRes = await fetch("/api/auth/wallet/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ walletAddress, signature }),
      });
      const data = await verifyRes.json();
      if (!verifyRes.ok) { setError(data.error || "Wallet login failed"); setWalletLoading(false); return; }

      await refreshAuth().catch(() => {});
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Wallet login failed");
    } finally {
      setWalletLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-black">
      <Navbar />

      <div className="flex items-center justify-center px-4 py-20">
        <div className="card w-full max-w-md">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 text-center">Sign In</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="form-control">
              <label className="form-label">Email</label>
              <input name="email" type="email" placeholder="Enter your email" required />
            </div>
            <div className="form-control">
              <label className="form-label">Password</label>
              <input name="password" type="password" placeholder="Enter your password" required />
            </div>
            <button type="submit" className="btn-primary w-full">Sign In</button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-slate-200 dark:bg-neutral-800" />
            <span className="text-xs text-slate-400 dark:text-neutral-500">or</span>
            <div className="flex-1 h-px bg-slate-200 dark:bg-neutral-800" />
          </div>

          {/* MetaMask button */}
          <button
            onClick={handleWalletLogin}
            disabled={walletLoading}
            className="w-full flex items-center justify-center gap-3 px-5 py-2.5 rounded-lg border border-slate-200 dark:border-neutral-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-neutral-900 transition-all duration-200 font-medium text-sm disabled:opacity-50"
          >
            {/* MetaMask fox icon */}
            <svg width="20" height="20" viewBox="0 0 318 318" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M274.1 35.5L174.6 109.4L193 65.8L274.1 35.5Z" fill="#E2761B" stroke="#E2761B" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M44.4 35.5L143.1 110.1L125.5 65.8L44.4 35.5Z" fill="#E4761B" stroke="#E4761B" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M238.3 206.8L211.8 247.4L268.5 263L284.8 207.7L238.3 206.8Z" fill="#E4761B" stroke="#E4761B" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M33.9 207.7L50.1 263L106.8 247.4L80.3 206.8L33.9 207.7Z" fill="#E4761B" stroke="#E4761B" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            {walletLoading ? "Connecting..." : "Sign in with MetaMask"}
          </button>

          {error && <p className="text-red-500 text-sm mt-4 text-center">{error}</p>}

          <p className="text-sm text-center text-slate-500 dark:text-neutral-400 mt-4">
            Don't have an account?{" "}
            <a href="/register" className="font-medium text-slate-900 dark:text-white hover:underline">Register</a>
          </p>
        </div>
      </div>
    </div>
  );
}
