"use client";

import { useEffect, useState } from "react";
import useAuth from "@/hooks/useAuth";

export default function VerifyPage() {
  const { user } = useAuth();

  const [patients, setPatients] = useState<any[]>([]);
  const [records, setRecords] = useState<any[]>([]);
  const [selectedPatient, setSelectedPatient] = useState("");
  const [selectedRecord, setSelectedRecord] = useState("");

  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // 🔹 Fetch patients
  useEffect(() => {
    if (!user) return;

    if (user.role === "HEALTHCARE_ADMIN") {
      fetch("/api/users/patients")
        .then((res) => res.json())
        .then((data) => setPatients(data.patients || []));
    }

    if (user.role === "PATIENT") {
      setPatients([user]);
      setSelectedPatient(String(user.id));
    }
  }, [user]);

  // 🔹 Fetch records
  useEffect(() => {
    if (!selectedPatient) return;

    fetch(`/api/records/get?patientId=${selectedPatient}`)
      .then((res) => res.json())
      .then((data) => setRecords(data.records || data || []));
  }, [selectedPatient]);

  // 🔹 Verify
  const handleVerify = async () => {
    if (!selectedRecord) return;

    setLoading(true);
    setResult(null);

    try {
      const res = await fetch(
        `/api/records/verify?id=${selectedRecord}`
      );

      const data = await res.json();
      setResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-black py-16 px-4">
      <div className="mx-auto max-w-2xl">

        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-8 text-center">
          Verify Record
        </h1>

        <div className="bg-white dark:bg-neutral-900 p-6 rounded-xl shadow space-y-5">

          {/* Patient */}
          <div>
            <label className="form-label">Select Patient</label>
            <select
              value={selectedPatient}
              onChange={(e) => setSelectedPatient(e.target.value)}
              className="w-full p-3 border border-slate-200 dark:border-neutral-800 rounded-md bg-white dark:bg-neutral-900 text-slate-900 dark:text-slate-100"
            >
              <option value="">-- Choose Patient --</option>
              {patients.map((p) => (
                <option key={p.id} value={String(p.id)}>{p.name || p.email}</option>
              ))}
            </select>
          </div>

          {/* Record */}
          {selectedPatient && (
            <div>
              <label className="form-label">Select Record</label>
              {records.length > 0 ? (
                <select
                  value={selectedRecord}
                  onChange={(e) => setSelectedRecord(e.target.value)}
                  className="w-full p-3 border border-slate-200 dark:border-neutral-800 rounded-md bg-white dark:bg-neutral-900 text-slate-900 dark:text-slate-100"
                >
                  <option value="">-- Choose Record --</option>
                  {records.map((r) => (
                    <option key={r.id} value={String(r.id)}>Record #{r.id} – {r.diagnosis}</option>
                  ))}
                </select>
              ) : (
                <p className="text-yellow-600 text-sm">No records found.</p>
              )}
            </div>
          )}

          {/* Button */}
          <button
            onClick={handleVerify}
            disabled={!selectedRecord || loading}
            className="btn-primary w-full disabled:opacity-50"
          >
            {loading ? "Verifying..." : "Verify Record"}
          </button>

          {result && (
            <div className="mt-4 p-4 border border-slate-200 dark:border-neutral-800 rounded-lg text-center">
              <p className="text-slate-900 dark:text-white font-semibold">Record Verified</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Integrity confirmed on-chain</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

