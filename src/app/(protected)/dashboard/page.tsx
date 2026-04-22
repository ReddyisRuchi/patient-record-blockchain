"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import useAuth from "@/hooks/useAuth";

function StatCard({ label, value, sub, warn }: { label: string; value: string | number; sub?: string; warn?: boolean }) {
  return (
    <div className={`bg-white dark:bg-neutral-900 rounded-xl shadow p-5 flex flex-col gap-1 border ${warn ? "border-yellow-400 dark:border-yellow-600" : "border-slate-100 dark:border-neutral-800"}`}>
      <p className="text-xs uppercase tracking-widest text-slate-500 dark:text-neutral-300">{label}</p>
      <p className={`text-3xl font-bold ${warn ? "text-yellow-600 dark:text-yellow-400" : "text-slate-900 dark:text-white"}`}>{value}</p>
      {sub && <p className="text-xs text-slate-400 dark:text-neutral-400">{sub}</p>}
    </div>
  );
}

function StatSkeleton() {
  return (
    <div className="bg-white dark:bg-neutral-900 rounded-xl shadow p-5 border border-slate-100 dark:border-neutral-800 space-y-2">
      <div className="h-3 bg-slate-200 dark:bg-neutral-800 rounded animate-pulse w-1/2" />
      <div className="h-8 bg-slate-200 dark:bg-neutral-800 rounded animate-pulse w-1/3" />
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats]       = useState<any>(null);
  const [activity, setActivity] = useState<any[]>([]);
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    fetch("/api/stats").then((r) => r.json()).then((d) => { setStats(d); setStatsLoading(false); }).catch(() => setStatsLoading(false));
    fetch("/api/activity").then((r) => r.json()).then((d) => setActivity(d.activity || [])).catch(() => {});
  }, [user]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-black py-16 px-4">
      <div className="mx-auto w-full max-w-5xl space-y-10">

        {/* Welcome */}
        <div className="fade-in fade-in-1">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">
            Welcome{user?.name ? `, ${user.name}` : ""}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            {user?.role === "HEALTHCARE_ADMIN" ? "Manage patient records and donations." : "View and verify your medical records."}
          </p>
        </div>

        {/* Stats */}
        <div className="fade-in fade-in-2">
          {statsLoading ? (
            <div className={`grid gap-4 ${user?.role === "HEALTHCARE_ADMIN" ? "grid-cols-2 md:grid-cols-4" : "grid-cols-2 max-w-sm"}`}>
              {Array.from({ length: user?.role === "HEALTHCARE_ADMIN" ? 4 : 2 }).map((_, i) => <StatSkeleton key={i} />)}
            </div>
          ) : stats && (
            stats.role === "PATIENT" ? (
              <div className="flex justify-center gap-4">
                <div className="w-full max-w-xs"><StatCard label="Your Records" value={stats.totalRecords} sub={stats.severityBreakdown || undefined} /></div>
                <div className="w-full max-w-xs"><StatCard label="Last Visit" value={stats.lastVisit ? new Date(stats.lastVisit).toLocaleDateString() : "—"} /></div>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
                <StatCard label="Total Records" value={stats.totalRecords} />
                <StatCard label="Total Patients" value={stats.totalPatients} />
                <StatCard label="This Month" value={stats.thisMonth} sub="records created" />
                <StatCard label="Donations" value={stats.totalDonations} sub={stats.expiringDonations > 0 ? `${stats.expiringDonations} expiring soon` : undefined} warn={stats.expiringDonations > 0} />
              </div>
            )
          )}
        </div>

        {/* Action Cards */}
        <div className={`gap-6 fade-in fade-in-3 ${
          user?.role === "HEALTHCARE_ADMIN" ? "grid grid-cols-3" : "flex justify-center"
        }`}>
          <div className={`card flex flex-col text-center ${user?.role === "PATIENT" ? "w-full max-w-xs" : ""}`}>
            <h3 className="text-xl font-semibold mb-3 text-slate-900 dark:text-white">View Records</h3>
            <p className="text-slate-500 dark:text-slate-300 mb-6 text-sm flex-1">
              Access and review previously submitted patient records.
            </p>
            <Link href="/records" className="btn-primary w-full">Open</Link>
          </div>

          {user?.role === "HEALTHCARE_ADMIN" && (
            <div className="card flex flex-col text-center">
              <h3 className="text-xl font-semibold mb-3 text-slate-900 dark:text-white">Create Record</h3>
              <p className="text-slate-500 dark:text-slate-300 mb-6 text-sm flex-1">
                Submit a new medical record for a patient.
              </p>
              <Link href="/doctor_submit" className="btn-primary w-full">Create</Link>
            </div>
          )}

          {user?.role === "HEALTHCARE_ADMIN" && (
            <div className="card flex flex-col text-center">
              <h3 className="text-xl font-semibold mb-3 text-slate-900 dark:text-white">Donations Registry</h3>
              <p className="text-slate-500 dark:text-slate-300 mb-6 text-sm flex-1">
                Manage and track all donations like an inventory system.
              </p>
              <Link href="/donations" className="btn-outline w-full">Open</Link>
            </div>
          )}

          {/* Patient empty state */}
          {user?.role === "PATIENT" && stats && stats.totalRecords === 0 && (
            <div className="bg-white dark:bg-neutral-900 rounded-xl p-8 text-center border border-dashed border-slate-200 dark:border-neutral-700 max-w-xs">
              <p className="text-slate-500 dark:text-slate-400 text-sm">No records yet. Your healthcare provider will add records after your visit.</p>
            </div>
          )}
        </div>

        {/* Recent Activity */}
        {activity.length > 0 && (
          <div className="bg-white dark:bg-neutral-900 rounded-xl shadow p-6 fade-in fade-in-4">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Recent Activity</h2>
            <div className="space-y-3">
              {activity.map((item) => (
                <div key={item.id} className="flex items-start justify-between gap-4 py-2 border-b dark:border-neutral-800 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-slate-800 dark:text-white">{item.label}</p>
                    <p className="text-xs text-slate-400 dark:text-neutral-400 mt-0.5">{item.sub}</p>
                  </div>
                  <span className="text-xs text-slate-400 dark:text-neutral-400 whitespace-nowrap">
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
