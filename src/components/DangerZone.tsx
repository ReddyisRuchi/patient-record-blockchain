"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import useAuth from "@/hooks/useAuth";

export default function DangerZone() {
  const [confirm, setConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const { refreshAuth } = useAuth();
  const router = useRouter();

  const handleDelete = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/delete-account", { method: "DELETE" });
      if (res.ok) { await refreshAuth(); router.push("/"); }
    } catch {}
    finally { setLoading(false); }
  };

  return (
    <div className="bg-white dark:bg-neutral-900 rounded-xl shadow p-6 border border-red-200 dark:border-red-900">
      <h2 className="text-lg font-semibold text-red-600 mb-2">Danger Zone</h2>
      <p className="text-sm text-slate-500 dark:text-neutral-400 mb-4">
        Permanently delete your account and all associated records. This cannot be undone.
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
