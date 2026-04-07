"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import api from "@/lib/api";

export default function RegisterPage() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: any) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const name = e.target.name.value;
    const email = e.target.email.value;
    const password = e.target.password.value;
    const confirm = e.target.confirm.value;
    const role = e.target.role.value;

    if (password !== confirm) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      await api.post("/api/auth/register", {
        name,
        email,
        password,
        role,
      });

      router.push("/login");
    } catch (err: any) {
      setError(
        err.message ||
        (err.payload && err.payload.message) ||
        "Registration failed"
      );
    } finally {
      setLoading(false);
    }
  }

  const inputStyle =
    "w-full px-4 py-2.5 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 dark:text-slate-100 focus:ring-2 focus:ring-blue-200 focus:border-blue-500 focus:outline-none transition";

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <Navbar />

      <div className="flex items-center justify-center py-16 px-4">
        <div className="w-full max-w-md card">

          <h2 className="text-3xl font-bold text-slate-900 dark:text-white text-center mb-6">
            Create Account
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5">

            <div>
              <label className="block mb-1 text-sm text-slate-600">
                Full Name
              </label>
              <input
                name="name"
                required
                className={inputStyle}
              />
            </div>

            <div>
              <label className="block mb-1 text-sm text-slate-600">
                Email
              </label>
              <input
                name="email"
                type="email"
                required
                className={inputStyle}
              />
            </div>

            <div>
              <label className="block mb-1 text-sm text-slate-600">
                Password
              </label>
              <input
                name="password"
                type="password"
                required
                className={inputStyle}
              />
            </div>

            <div>
              <label className="block mb-1 text-sm text-slate-600">
                Confirm Password
              </label>
              <input
                name="confirm"
                type="password"
                required
                className={inputStyle}
              />
            </div>

            <div>
              <label className="block mb-1 text-sm text-slate-600">
                Role
              </label>
              <select
                name="role"
                required
                className={inputStyle}
              >
                <option value="PATIENT">Patient</option>
                <option value="HEALTHCARE_ADMIN">Healthcare Admin</option>
                <option value="DONOR">Donor</option>
              </select>
            </div>

            {error && (
              <p className="text-sm text-red-500 text-center">
                {error}
              </p>
            )}

            <button
              disabled={loading}
              className="btn-primary w-full"
            >
              {loading ? "Registering..." : "Register"}
            </button>

          </form>
        </div>
      </div>
    </div>
  );
}