"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
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

const severityColors: Record<string, string> = {
  Mild:     "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
  Moderate: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300",
  Severe:   "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300",
  Critical: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
};

export default function PatientProfilePage() {
  const { id }   = useParams();
  const router   = useRouter();
  const { user } = useAuth();
  const [patient, setPatient] = useState<any>(null);
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !id) return;

    // Patients can only view their own profile
    if (user.role === "PATIENT" && String(user.id) !== String(id)) {
      router.replace(`/patients/${user.id}`);
      return;
    }

    const recordsUrl = user.role === "PATIENT"
      ? "/api/records/get"
      : `/api/records/get?patientId=${id}`;

    Promise.all([
      fetch("/api/users/patients").then((r) => r.json()),
      fetch(recordsUrl).then((r) => r.json()),
    ]).then(([pData, rData]) => {
      // For patients, use their own info from auth context
      if (user.role === "PATIENT") {
        setPatient({ id: user.id, name: user.name, email: user.email });
      } else {
        const found = (pData.patients || []).find((p: any) => String(p.id) === String(id));
        setPatient(found || null);
      }
      setRecords(rData.records || []);
    }).finally(() => setLoading(false));
  }, [user, id]);

  if (loading) return (
    <div className="min-h-screen bg-slate-50 dark:bg-black p-8">
      <div className="max-w-3xl mx-auto space-y-4">
        {[1,2,3].map((i) => (
          <div key={i} className="bg-white dark:bg-neutral-900 rounded-xl p-6">
            <div className="h-5 bg-slate-200 dark:bg-neutral-900 rounded animate-pulse w-1/3 mb-4" />
            <div className="h-4 bg-slate-100 dark:bg-neutral-900 rounded animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );

  if (!patient) return (
    <div className="min-h-screen bg-slate-50 dark:bg-black flex items-center justify-center">
      <p className="text-slate-500 dark:text-slate-400">Patient not found.</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-black py-10 px-4 text-slate-900 dark:text-slate-100">
      <div className="max-w-3xl mx-auto space-y-6">

        {/* Breadcrumb + back */}
        <div className="flex items-center justify-between fade-in fade-in-1">
          <nav className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
            <button onClick={() => router.push("/records")} className="hover:text-slate-900 dark:hover:text-white transition-colors">Records</button>
            <span>/</span>
            <span className="text-slate-900 dark:text-white font-medium">{patient.name}</span>
          </nav>
          <button onClick={() => router.back()} className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
            </svg>
            Back
          </button>
        </div>

        {/* Profile card */}
        <div className="bg-white dark:bg-neutral-900 rounded-xl shadow p-6 fade-in fade-in-2">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 rounded-full bg-slate-900 dark:bg-slate-100 flex items-center justify-center">
              <span className="text-xl font-bold text-white dark:text-slate-900">
                {patient.name.split(" ").map((n: string) => n[0]).join("").toUpperCase()}
              </span>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white">{patient.name}</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">{patient.email}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="bg-slate-100 dark:bg-neutral-800 rounded-lg p-3">
              <p className="text-slate-500 dark:text-neutral-400 text-xs uppercase tracking-wider mb-1">Total Records</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{records.length}</p>
            </div>
            <div className="bg-slate-100 dark:bg-neutral-800 rounded-lg p-3">
              <p className="text-slate-500 dark:text-neutral-400 text-xs uppercase tracking-wider mb-1">Last Visit</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                {records[0] ? new Date(records[0].createdAt).toLocaleDateString() : "—"}
              </p>
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="bg-white dark:bg-neutral-900 rounded-xl shadow p-6 fade-in fade-in-3">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">Record Timeline</h2>
          {records.length === 0 ? (
            <p className="text-slate-500 dark:text-slate-400 text-sm text-center py-8">No records found.</p>
          ) : (
            <div className="relative border-l-2 border-slate-200 dark:border-neutral-800 ml-3 space-y-6">
              {records.map((r) => (
                <div key={r.id} className="relative pl-6 cursor-pointer" onClick={() => router.push(`/records/${r.id}`)}>
                  <div className="absolute -left-[9px] top-2 w-4 h-4 bg-slate-900 dark:bg-white rounded-full border-2 border-white dark:border-slate-800" />
                  <div className="bg-slate-50 dark:bg-neutral-900 p-4 rounded-lg hover:bg-slate-100 dark:hover:bg-neutral-800 transition">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-medium text-slate-900 dark:text-white">{r.diagnosis}</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{r.department} · {r.visitType}</p>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs font-medium shrink-0 ${severityColors[r.severity] || ""}`}>
                        {r.severity}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">{new Date(r.createdAt).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Settings */}
        <ChangePasswordSection />

      </div>
    </div>
  );
}
