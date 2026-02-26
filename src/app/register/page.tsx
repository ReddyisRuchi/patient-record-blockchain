"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from '@/components/Navbar';
import api from '@/lib/api';

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
    const role = e.target.role.value;   // ✅ NEW

    if (password !== confirm) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      await api.post('/api/auth/register', { 
        name, 
        email, 
        password, 
        role   // ✅ SEND ROLE
      });

      router.push('/login');
    } catch (err: any) {
      setError(err.message || (err.payload && err.payload.message) || 'Registration failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <Navbar />
      <div className="container mx-auto px-6 py-16">
        <div className="max-w-md mx-auto bg-white/5 p-6 rounded-lg">
          <h2 className="text-2xl font-semibold mb-4">Create an account</h2>

          <form onSubmit={handleSubmit} className="flex flex-col gap-3">

            <input 
              name="name" 
              placeholder="Full name" 
              required 
              className="p-3 rounded bg-white/10" 
            />

            <input 
              name="email" 
              type="email" 
              placeholder="Email" 
              required 
              className="p-3 rounded bg-white/10" 
            />

            <input 
              name="password" 
              type="password" 
              placeholder="Password" 
              required 
              className="p-3 rounded bg-white/10" 
            />

            <input 
              name="confirm" 
              type="password" 
              placeholder="Confirm password" 
              required 
              className="p-3 rounded bg-white/10" 
            />

            {/* ✅ ROLE DROPDOWN */}
            <select 
              name="role" 
              required 
              className="p-3 rounded bg-white/10 text-white"
            >
              <option value="PATIENT">PATIENT</option>
              <option value="DOCTOR">DOCTOR</option>
            </select>

            <button 
              disabled={loading} 
              className="mt-2 bg-gradient-to-r from-emerald-400 to-sky-500 rounded py-2"
            >
              {loading ? 'Registering…' : 'Register'}
            </button>

          </form>

          {error && <p className="text-red-400 mt-2">{error}</p>}
        </div>
      </div>
    </div>
  );
}