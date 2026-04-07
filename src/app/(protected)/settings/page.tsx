"use client";

import { useState } from "react";
import { Toast, useToast } from "@/components/Toast";
import useAuth from "@/hooks/useAuth";

export default function SettingsPage() {
  const { user } = useAuth();
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
    <div className="min-h-screen bg-slate-50 dark:bg-black py-16 px-4">
      {toast && <Toast message={toast.message} type={toast.type} onClose={hide} />}

      <div className="mx-auto max-w-lg">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-8 fade-in fade-in-1">Settings</h1>

        {/* Profile info */}
        <div className="bg-white dark:bg-neutral-900 rounded-xl shadow p-6 mb-6 fade-in fade-in-2">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Profile</h2>
          <div className="space-y-2 text-sm">
            <p><span className="text-slate-500 dark:text-slate-400">Name:</span> <span className="font-medium">{user?.name}</span></p>
            <p><span className="text-slate-500 dark:text-slate-400">Email:</span> <span className="font-medium">{user?.email}</span></p>
            <p><span className="text-slate-500 dark:text-slate-400">Role:</span> <span className="font-medium">{user?.role}</span></p>
          </div>
        </div>

        {/* Change password */}
        <div className="bg-white dark:bg-neutral-900 rounded-xl shadow p-6 fade-in fade-in-3">
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
            <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-50">
              {loading ? "Updating..." : "Update Password"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}


