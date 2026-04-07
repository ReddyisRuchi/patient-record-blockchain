"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import useAuth from "@/hooks/useAuth";

function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow p-5 flex flex-col gap-1 border border-slate-100 dark:border-slate-700">
      <p className="text-xs uppercase tracking-widest text-slate-400 dark:text-slate-500">{label}</p>
      <p className="text-3xl font-bold text-slate-900 dark:text-white">{value}</p>
      {sub && <p className="text-xs text-slate-400 dark:text-slate-500">{sub}</p>}
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats]       = useState<any>(null);
  const [activity, setActivity] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    fetch("/api/stats").then((r) => r.json()).then(setStats).catch(() => {});
    fetch("/api/activity").then((r) => r.json()).then((d) => setActivity(d.activity || [])).catch(() => {});
  }, [user]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-16 px-4">
      <div className="mx-auto w-full max-w-5xl space-y-10">

        {/* Welcome */}
        <div className="text-center fade-in fade-in-1">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">
            Welcome{user?.name ? `, ${user.name}` : ""}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2">
            Manage patient records securely and efficiently.
          </p>
        </div>

        {/* Stats */}
        {stats && (
          <div className="flex flex-wrap justify-center gap-4 fade-in fade-in-2">
            {stats.role === "PATIENT" ? (
              <>
                <div className="w-full max-w-xs"><StatCard label="Your Records" value={stats.totalRecords} /></div>
                <div className="w-full max-w-xs"><StatCard label="Last Visit" value={stats.lastVisit ? new Date(stats.lastVisit).toLocaleDateString() : "—"} /></div>
              </>
            ) : (
              <div className="grid grid-cols-3 gap-4 w-full">
                <StatCard label="Total Records" value={stats.totalRecords} />
                <StatCard label="Total Patients" value={stats.totalPatients} />
                <StatCard label="This Month" value={stats.thisMonth} sub="records created" />
              </div>
            )}
          </div>
        )}

        {/* Action Cards */}
        <div className="flex flex-wrap justify-center gap-6 fade-in fade-in-3">
          <div className="card flex flex-col text-center w-full max-w-xs">
            <h3 className="text-xl font-semibold mb-3 text-slate-900 dark:text-white">View Records</h3>
            <p className="text-slate-500 dark:text-slate-400 mb-6 text-sm flex-1">
              Access and review previously submitted patient records.
            </p>
            <Link href="/records" className="btn-primary w-full">Open</Link>
          </div>

          {user?.role === "PATIENT" && (
            <div className="card flex flex-col text-center w-full max-w-xs">
              <h3 className="text-xl font-semibold mb-3 text-slate-900 dark:text-white">Verify Record</h3>
              <p className="text-slate-500 dark:text-slate-400 mb-6 text-sm flex-1">
                Validate the integrity of your medical records on-chain.
              </p>
              <Link href="/verify" className="btn-outline w-full">Verify</Link>
            </div>
          )}

          {user?.role === "HEALTHCARE_ADMIN" && (
            <div className="card flex flex-col text-center w-full max-w-xs">
              <h3 className="text-xl font-semibold mb-3 text-slate-900 dark:text-white">Create Record</h3>
              <p className="text-slate-500 dark:text-slate-400 mb-6 text-sm flex-1">
                Submit a new medical record for a patient.
              </p>
              <Link href="/doctor_submit" className="btn-primary w-full">Create</Link>
            </div>
          )}

          {user?.role === "HEALTHCARE_ADMIN" && (
            <div className="card flex flex-col text-center w-full max-w-xs">
              <h3 className="text-xl font-semibold mb-3 text-slate-900 dark:text-white">Donations Registry</h3>
              <p className="text-slate-500 dark:text-slate-400 mb-6 text-sm flex-1">
                Manage and track all donations like an inventory system.
              </p>
              <Link href="/donations" className="btn-outline w-full">Open</Link>
            </div>
          )}

        </div>

        {/* Recent Activity */}
        {activity.length > 0 && (
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow p-6 fade-in fade-in-4">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Recent Activity</h2>
            <div className="space-y-3">
              {activity.map((item) => (
                <div key={item.id} className="flex items-start justify-between gap-4 py-2 border-b dark:border-slate-700 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{item.label}</p>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{item.sub}</p>
                  </div>
                  <span className="text-xs text-slate-400 dark:text-slate-500 whitespace-nowrap">
                    {new Date(item.date).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
