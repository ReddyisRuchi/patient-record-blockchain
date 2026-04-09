"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import useAuth from "@/hooks/useAuth";
import { Toast, useToast } from "@/components/Toast";

function ChangePasswordSection() {
  const { toast, show, hide } = useToast();
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: any) {
    e.preventDefault();
    const currentPassword = e.target.currentPassword.value;
    const newPassword     = e.target.newPassword.value;
    const confirm         = e.target.confirm.value;
    if (newPassword !== confirm) { show("Passwords do not match.", "error"); return; }
    setLoading(true);
    try {
      const res  = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (res.ok) { show("Password updated."); e.target.reset(); }
      else show(data.message || "Failed.", "error");
    } catch { show("Something went wrong.", "error"); }
    finally { setLoading(false); }
  }

  return (
    <div className="bg-white dark:bg-neutral-900 rounded-xl shadow p-6 fade-in fade-in-4">
      {toast && <Toast message={toast.message} type={toast.type} onClose={hide} />}
      <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Change Password</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="form-label">Current Password</label>
          <input name="currentPassword" type="password" required
            className="w-full border border-slate-200 dark:border-neutral-800 px-4 py-2.5 rounded-lg bg-white dark:bg-neutral-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-300" />
        </div>
        <div>
          <label className="form-label">New Password</label>
          <input name="newPassword" type="password" required minLength={6}
            className="w-full border border-slate-200 dark:border-neutral-800 px-4 py-2.5 rounded-lg bg-white dark:bg-neutral-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-300" />
        </div>
        <div>
          <label className="form-label">Confirm New Password</label>
          <input name="confirm" type="password" required
            className="w-full border border-slate-200 dark:border-neutral-800 px-4 py-2.5 rounded-lg bg-white dark:bg-neutral-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-300" />
        </div>
        <button type="submit" disabled={loading} className="btn-primary disabled:opacity-50">
          {loading ? "Updating..." : "Update Password"}
        </button>
      </form>
    </div>
  );
}

function DangerZone({ router }: { router: any }) {
  const [confirm, setConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const { refreshAuth } = useAuth();

  const handleDelete = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/delete-account", { method: "DELETE" });
      if (res.ok) {
        await refreshAuth();
        router.push("/");
      }
    } catch {}
    finally { setLoading(false); }
  };

  return (
    <div className="bg-white dark:bg-neutral-900 rounded-xl shadow p-6 border border-red-200 dark:border-red-900 fade-in fade-in-5">
      <h2 className="text-lg font-semibold text-red-600 mb-2">Danger Zone</h2>
      <p className="text-sm text-slate-500 dark:text-neutral-400 mb-4">
        Permanently delete your account. This cannot be undone.
      </p>
      {!confirm ? (
        <button onClick={() => setConfirm(true)} className="px-4 py-2 rounded-lg border border-red-500 text-red-500 text-sm font-medium hover:bg-red-50 dark:hover:bg-red-950 transition-colors">
          Delete Account
        </button>
      ) : (
        <div className="space-y-3">
          <p className="text-sm font-medium text-red-600">Are you absolutely sure?</p>
          <div className="flex gap-3">
            <button onClick={handleDelete} disabled={loading} className="px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-50">
              {loading ? "Deleting..." : "Yes, delete my account"}
            </button>
            <button onClick={() => setConfirm(false)} className="btn-outline text-sm">Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminProfilePage() {
  const { user }  = useAuth();
  const router    = useRouter();
  const [stats, setStats]       = useState<any>(null);
  const [activity, setActivity] = useState<any[]>([]);
  const [deptData, setDeptData] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    if (user.role !== "HEALTHCARE_ADMIN") { router.replace("/dashboard"); return; }
    fetch("/api/stats").then((r) => r.json()).then(setStats).catch(() => {});
    fetch("/api/activity").then((r) => r.json()).then((d) => setActivity(d.activity || [])).catch(() => {});
    fetch("/api/analytics/departments").then((r) => r.json()).then((d) => setDeptData(d.data || [])).catch(() => {});
  }, [user]);

  if (!user) return null;

  const initials = user.name?.split(" ").map((n: string) => n[0]).join("").toUpperCase();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-black py-10 px-4 text-slate-900 dark:text-slate-100">
      <div className="max-w-3xl mx-auto space-y-6">

        {/* Back */}
        <div className="flex items-center justify-between fade-in fade-in-1">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">My Profile</h1>
          <button onClick={() => router.back()} className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
            </svg>
            Back
          </button>
        </div>

        {/* Identity card */}
        <div className="bg-white dark:bg-neutral-900 rounded-xl shadow p-6 fade-in fade-in-2">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-full bg-slate-900 dark:bg-slate-100 flex items-center justify-center shrink-0">
              <span className="text-xl font-bold text-white dark:text-slate-900">{initials}</span>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white">{user.name}</h2>
              <span className="inline-block mt-1 text-xs font-medium px-2 py-0.5 rounded bg-slate-100 dark:bg-neutral-900 text-slate-600 dark:text-slate-300">
                Healthcare Admin
              </span>
            </div>
          </div>

          {/* Stats row */}
          {stats && (
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-slate-50 dark:bg-neutral-900 rounded-lg p-3 text-center">
                <p className="text-xs uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">Records</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.totalRecords}</p>
              </div>
              <div className="bg-slate-50 dark:bg-neutral-900 rounded-lg p-3 text-center">
                <p className="text-xs uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">Patients</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.totalPatients}</p>
              </div>
              <div className="bg-slate-50 dark:bg-neutral-900 rounded-lg p-3 text-center">
                <p className="text-xs uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">This Month</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.thisMonth}</p>
              </div>
            </div>
          )}
        </div>

        {/* Recent activity */}
        {activity.length > 0 && (
          <div className="bg-white dark:bg-neutral-900 rounded-xl shadow p-6 fade-in fade-in-3">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Recent Activity</h2>
            <div className="divide-y dark:divide-slate-700">
              {activity.map((item) => (
                <div key={item.id} className="flex items-start justify-between gap-4 py-3 cursor-pointer hover:opacity-80 transition"
                  onClick={() => router.push(`/records/${item.id}`)}>
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

        {/* Department Analytics */}
        {deptData.length > 0 && (
          <div className="bg-white dark:bg-neutral-900 rounded-xl shadow p-6 fade-in fade-in-4">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">Department Visit Frequency</h2>
            <div className="space-y-3">
              {(() => {
                const max = Math.max(...deptData.map((d) => d.count));
                return deptData.map((d) => (
                  <div key={d.department} className="flex items-center gap-3">
                    <span className="text-xs text-slate-500 dark:text-neutral-400 w-36 shrink-0 truncate">{d.department}</span>
                    <div className="flex-1 bg-slate-100 dark:bg-neutral-800 rounded-full h-2 overflow-hidden">
                      <div
                        className="h-2 bg-slate-900 dark:bg-white rounded-full transition-all duration-500"
                        style={{ width: `${(d.count / max) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs font-medium text-slate-700 dark:text-slate-300 w-6 text-right">{d.count}</span>
                  </div>
                ));
              })()}
            </div>
          </div>
        )}

        {/* Change password */}
        <ChangePasswordSection />

        {/* Danger zone */}
        <DangerZone router={router} />

      </div>
    </div>
  );
}



