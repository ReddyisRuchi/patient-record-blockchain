"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Toast, useToast } from "@/components/Toast";
import useAuth from "@/hooks/useAuth";

const severityColors: Record<string, string> = {
  Mild:     "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
  Moderate: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300",
  Severe:   "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300",
  Critical: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
};

function SkeletonRow() {
  return (
    <tr className="border-b dark:border-neutral-800">
      {Array.from({ length: 8 }).map((_, i) => (
        <td key={i} className="p-2">
          <div className="h-4 bg-slate-200 dark:bg-neutral-900 rounded animate-pulse w-full" />
        </td>
      ))}
    </tr>
  );
}

export default function RecordsPage() {
  const { user }                            = useAuth();
  const isPatient                           = user?.role === "PATIENT";
  const [patientId, setPatientId]           = useState("");
  const [patients, setPatients]             = useState<any[]>([]);
  const [records, setRecords]               = useState<any[]>([]);
  const [loading, setLoading]               = useState(false);
  const [fetched, setFetched]               = useState(false);
  const [search, setSearch]                 = useState("");
  const [filterSeverity, setFilterSeverity] = useState("");
  const [filterDept, setFilterDept]         = useState("");
  const { toast, show, hide }               = useToast();
  const router                              = useRouter();

  useEffect(() => {
    if (!user) return;
    if (isPatient) {
      setPatientId(String(user.id));
    } else {
      fetch("/api/users/patients")
        .then((r) => r.json())
        .then((d) => setPatients(d.patients || []));
    }
  }, [user]);

  useEffect(() => {
    if (!patientId) { setRecords([]); setFetched(false); return; }
    fetchRecords();
  }, [patientId]);

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const url  = isPatient ? "/api/records/get" : `/api/records/get?patientId=${patientId}`;
      const res  = await fetch(url);
      const data = await res.json();
      const list = data.records || data || [];
      setRecords(list);
      setFetched(true);
      if (list.length === 0) show("No records found.", "error");
    } catch {
      show("Failed to fetch records.", "error");
    } finally {
      setLoading(false);
    }
  };

  const filtered = records.filter((r) => {
    const q           = search.toLowerCase();
    const matchSearch = !q || r.diagnosis?.toLowerCase().includes(q) || r.department?.toLowerCase().includes(q) || r.prescription?.toLowerCase().includes(q);
    const matchSev    = !filterSeverity || r.severity === filterSeverity;
    const matchDept   = !filterDept || r.department === filterDept;
    return matchSearch && matchSev && matchDept;
  });

  const departments = [...new Set(records.map((r) => r.department).filter(Boolean))];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-black py-16 px-4">
      {toast && <Toast message={toast.message} type={toast.type} onClose={hide} />}

      <div className="mx-auto max-w-6xl">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-8 text-center fade-in fade-in-1">
          Medical Records
        </h1>

        {/* Patient selector — admins only */}
        {!isPatient && (
          <div className="bg-white dark:bg-neutral-900 p-6 rounded-xl shadow mb-6 fade-in fade-in-2">
            <div className="flex items-center justify-between mb-2">
              <label className="form-label">Select Patient</label>
              {patientId && (
                <button onClick={() => router.push(`/patients/${patientId}`)} className="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                  View Profile →
                </button>
              )}
            </div>
            <select
              value={patientId}
              onChange={(e) => setPatientId(e.target.value)}
              className="w-full border dark:border-neutral-800 p-2.5 rounded-lg bg-white dark:bg-neutral-900 dark:text-slate-100"
            >
              <option value="">-- Select Patient --</option>
              {patients.map((p) => (
                <option key={p.id} value={String(p.id)}>
                  {p.name || p.email} (ID: {p.id})
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Filters */}
        {fetched && records.length > 0 && (
          <div className="bg-white dark:bg-neutral-900 p-4 rounded-xl shadow mb-6 flex flex-wrap gap-3 fade-in fade-in-2">
            <input
              type="text"
              placeholder="Search diagnosis, department..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 min-w-[180px] border border-slate-200 dark:border-neutral-800 px-3 py-2 rounded-lg bg-white dark:bg-neutral-900 dark:text-slate-100 text-sm"
            />
            <select
              value={filterSeverity}
              onChange={(e) => setFilterSeverity(e.target.value)}
              className="border border-slate-200 dark:border-neutral-800 px-3 py-2 rounded-lg bg-white dark:bg-neutral-900 dark:text-slate-100 text-sm"
            >
              <option value="">All Severities</option>
              {["Mild","Moderate","Severe","Critical"].map((s) => <option key={s}>{s}</option>)}
            </select>
            <select
              value={filterDept}
              onChange={(e) => setFilterDept(e.target.value)}
              className="border border-slate-200 dark:border-neutral-800 px-3 py-2 rounded-lg bg-white dark:bg-neutral-900 dark:text-slate-100 text-sm"
            >
              <option value="">All Departments</option>
              {departments.map((d) => <option key={d}>{d}</option>)}
            </select>
          </div>
        )}

        {/* Skeleton */}
        {loading && (
          <div className="bg-white dark:bg-neutral-900 p-6 rounded-xl shadow">
            <table className="w-full border-collapse">
              <tbody>{Array.from({ length: 4 }).map((_, i) => <SkeletonRow key={i} />)}</tbody>
            </table>
          </div>
        )}

        {/* Empty state */}
        {!loading && fetched && filtered.length === 0 && (
          <div className="bg-white dark:bg-neutral-900 p-16 rounded-xl shadow text-center fade-in fade-in-2">
            <svg className="mx-auto mb-4 text-slate-300 dark:text-slate-600" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="9" y1="13" x2="15" y2="13"/>
            </svg>
            <p className="text-slate-500 dark:text-slate-400 font-medium">No records found</p>
            <p className="text-slate-400 dark:text-slate-500 text-sm mt-1">Try adjusting your filters.</p>
          </div>
        )}

        {/* Table */}
        {!loading && filtered.length > 0 && (
          <div className="bg-white dark:bg-neutral-900 rounded-xl shadow overflow-hidden fade-in fade-in-3">
            <div className="px-6 py-4 border-b dark:border-neutral-800 flex items-center justify-between">
              <span className="text-sm text-slate-500 dark:text-slate-400">
                {filtered.length} record{filtered.length !== 1 ? "s" : ""}
                {patientId && patients.find(p => String(p.id) === patientId) && (
                  <span className="ml-1">for <span className="font-medium text-slate-700 dark:text-slate-200">{patients.find(p => String(p.id) === patientId)?.name}</span></span>
                )}
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="text-left border-b dark:border-neutral-800 text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    <th className="px-4 py-3">Department</th>
                    <th className="px-4 py-3">Visit Type</th>
                    <th className="px-4 py-3">Diagnosis</th>
                    <th className="px-4 py-3">Prescription</th>
                    <th className="px-4 py-3">Severity</th>
                    <th className="px-4 py-3">Follow Up</th>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Chain</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((record) => (
                    <tr
                      key={record.id}
                      onClick={() => router.push(`/records/${record.id}`)}
                      className="cursor-pointer hover:bg-slate-50 dark:hover:bg-neutral-900 transition border-b dark:border-neutral-800 text-sm"
                    >
                      <td className="px-4 py-3">{record.department}</td>
                      <td className="px-4 py-3">{record.visitType}</td>
                      <td className="px-4 py-3">{record.diagnosis}</td>
                      <td className="px-4 py-3">{record.prescription}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${severityColors[record.severity] || "bg-slate-100 text-slate-600"}`}>
                          {record.severity}
                        </span>
                      </td>
                      <td className="px-4 py-3">{record.followUp}</td>
                      <td className="px-4 py-3 text-slate-500 dark:text-slate-400">{new Date(record.createdAt).toLocaleDateString()}</td>
                      <td className="px-4 py-3 text-xs text-slate-400 dark:text-slate-500">On-Chain</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


