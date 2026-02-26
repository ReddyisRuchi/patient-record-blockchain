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
    "w-full px-4 py-2.5 border border-slate-200 rounded-lg bg-white focus:ring-2 focus:ring-emerald-200 focus:border-emerald-500 focus:outline-none transition";

  return (
    <div className="min-h-screen bg-slate-50 py-16 px-4">
      <div className="mx-auto w-full max-w-2xl">

        <h1 className="text-3xl font-bold text-emerald-600 mb-8 text-center">
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
              <label className="block mb-1 text-sm text-slate-600">
                Donation Type
              </label>
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

            <button
              type="submit"
              disabled={!isLoggedIn}
              className="btn-secondary w-full"
            >
              Register as Donor
            </button>

          </form>
        </div>

      </div>
    </div>
  );
}