"use client";

import { useState } from "react";
import useAuth from "@/hooks/useAuth";

export default function VerifyPage() {
  const { user } = useAuth();
  const isLoggedIn = Boolean(user);

  const [recordId, setRecordId] = useState("");
  const [status, setStatus] = useState<null | "valid" | "invalid">(null);

  async function handleVerify(e: any) {
    e.preventDefault();
    if (!isLoggedIn) return;

    try {
      const res = await fetch("/api/records", {
        credentials: "same-origin",
      });

      if (res.ok) {
        const data = await res.json();
        const found = data.records?.find(
          (r: any) => r.id === recordId
        );

        if (found) {
          setStatus("valid");
        } else {
          setStatus("invalid");
        }
      }
    } catch {
      setStatus("invalid");
    }
  }

  const inputStyle =
    "w-full px-4 py-2.5 border border-slate-200 rounded-lg bg-white focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 focus:outline-none transition";

  return (
    <div className="min-h-screen bg-slate-50 py-16 px-4">
      <div className="mx-auto w-full max-w-2xl">

        <h1 className="text-3xl font-bold text-indigo-600 mb-8 text-center">
          Verify Patient Record
        </h1>

        <div className="card">
          {!isLoggedIn && (
            <p className="text-sm text-red-500 mb-6 text-center">
              You must be logged in to verify records.
            </p>
          )}

          <form onSubmit={handleVerify} className="space-y-6">
            <div>
              <label className="block mb-1 text-sm text-slate-600">
                Record ID
              </label>
              <input
                type="text"
                value={recordId}
                onChange={(e) => setRecordId(e.target.value)}
                required
                className={inputStyle}
              />
            </div>

            <button
              type="submit"
              disabled={!isLoggedIn}
              className="btn-outline w-full"
            >
              Verify Record
            </button>
          </form>

          {status === "valid" && (
            <div className="mt-6 text-center text-green-600 font-medium">
              ✅ Record Verified Successfully
            </div>
          )}

          {status === "invalid" && (
            <div className="mt-6 text-center text-red-500 font-medium">
              ❌ Record Not Found
            </div>
          )}
        </div>

      </div>
    </div>
  );
}