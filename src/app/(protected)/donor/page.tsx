"use client";

import { useState } from "react";
import useAuth from "@/hooks/useAuth";

export default function DonorPage() {
  const { user } = useAuth();
  const isLoggedIn = Boolean(user);
  const [donationType, setDonationType] = useState("");

  function handleSubmit(e: any) {
    e.preventDefault();
    if (!isLoggedIn) return;

    console.log("Donor registered:", donationType);
    alert("Donor registration submitted (static demo).");
  }

  const inputStyle =
    "w-full px-4 py-2.5 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 dark:text-slate-100 focus:ring-2 focus:ring-slate-300 focus:border-slate-500 focus:outline-none transition";

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-16 px-4">
      <div className="mx-auto w-full max-w-2xl">

        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-8 text-center">
          Donor Registration
        </h1>

        <div className="card">
          {!isLoggedIn && (
            <p className="text-sm text-red-500 mb-6 text-center">
              You must be logged in to register as a donor.
            </p>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="form-label">Donation Type</label>
              <select
                value={donationType}
                onChange={(e) => setDonationType(e.target.value)}
                required
                className={inputStyle}
              >
                <option value="">Select Donation Type</option>
                <option value="blood">Blood</option>
                <option value="organ">Organ</option>
              </select>
            </div>

            <button type="submit" disabled={!isLoggedIn} className="btn-primary w-full">
              Register as Donor
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}