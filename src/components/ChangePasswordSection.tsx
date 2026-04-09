"use client";

import { useState } from "react";
import { Toast, useToast } from "@/components/Toast";

export default function ChangePasswordSection() {
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

  const inp = "w-full border border-slate-200 dark:border-neutral-800 px-4 py-2.5 rounded-lg bg-white dark:bg-neutral-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-300";

  return (
    <div className="bg-white dark:bg-neutral-900 rounded-xl shadow p-6">
      {toast && <Toast message={toast.message} type={toast.type} onClose={hide} />}
      <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Change Password</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div><label className="form-label">Current Password</label><input name="currentPassword" type="password" required className={inp} /></div>
        <div><label className="form-label">New Password</label><input name="newPassword" type="password" required minLength={6} className={inp} /></div>
        <div><label className="form-label">Confirm New Password</label><input name="confirm" type="password" required className={inp} /></div>
        <button type="submit" disabled={loading} className="btn-primary disabled:opacity-50">
          {loading ? "Updating..." : "Update Password"}
        </button>
      </form>
    </div>
  );
}
