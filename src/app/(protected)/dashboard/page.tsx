"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import useAuth from "@/hooks/useAuth";

export default function DashboardPage() {
  const { user } = useAuth();
  const [recordCount, setRecordCount] = useState<number | null>(null);

  useEffect(() => {
    if (!user) return;
    fetch("/api/records/get" + (user.role !== "PATIENT" ? "" : ""))
      .then((r) => r.json())
      .then((d) => setRecordCount((d.records || d || []).length))
      .catch(() => {});
  }, [user]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-16 px-4">
      <div className="mx-auto w-full max-w-5xl">

        <div className="mb-12 text-center fade-in fade-in-1">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">
            Welcome{user?.name ? `, ${user.name}` : ""}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2">
            Manage patient records securely and efficiently.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-6">

          <div className="card flex flex-col text-center w-full max-w-xs fade-in fade-in-2">
            <h3 className="text-xl font-semibold mb-3 text-slate-900 dark:text-white">View Records</h3>
            <p className="text-slate-500 dark:text-slate-400 mb-2 text-sm flex-1">
              Access and review previously submitted patient records.
            </p>
            {recordCount !== null && (
              <p className="text-xs text-slate-400 dark:text-slate-500 mb-4">
                {recordCount} record{recordCount !== 1 ? "s" : ""}
              </p>
            )}
            <Link href="/records" className="btn-primary w-full">Open</Link>
          </div>

          {user?.role === "HEALTHCARE_ADMIN" && (
            <div className="card flex flex-col text-center w-full max-w-xs fade-in fade-in-3">
              <h3 className="text-xl font-semibold mb-3 text-slate-900 dark:text-white">Create Record</h3>
              <p className="text-slate-500 dark:text-slate-400 mb-6 text-sm flex-1">
                Submit a new medical record for a patient.
              </p>
              <Link href="/doctor_submit" className="btn-primary w-full">Create</Link>
            </div>
          )}

          {/* 🔥 REPLACED VERIFY WITH DONATIONS */}
          {user?.role === "HEALTHCARE_ADMIN" && (
            <div className="card flex flex-col text-center w-full max-w-xs fade-in fade-in-4">
              <h3 className="text-xl font-semibold mb-3 text-slate-900 dark:text-white">Donations Registry</h3>
              <p className="text-slate-500 dark:text-slate-400 mb-6 text-sm flex-1">
                Manage and track all donations like an inventory system.
              </p>
              <Link href="/donations" className="btn-outline w-full">Open</Link>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}