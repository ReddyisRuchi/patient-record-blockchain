"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function RecordsPage() {
  const [patientId, setPatientId] = useState("");
  const [patients, setPatients] = useState<any[]>([]);
  const [records, setRecords] = useState<any[]>([]);

  const router = useRouter();

  useEffect(() => {
    fetch("/api/users/patients")
      .then((res) => res.json())
      .then((data) => setPatients(data.patients || []));
  }, []);

  // Fetch records
  const fetchRecords = async () => {
    if (!patientId) return;

    const res = await fetch(`/api/records/get?patientId=${patientId}`);
    const data = await res.json();
    setRecords(data.records || data || []);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-16 px-4">
      <div className="mx-auto max-w-5xl">

        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-8 text-center">
          View Medical Records
        </h1>

        {/* 🔹 Patient Selection */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow mb-6 space-y-4">

          <div>
            <label className="form-label">Select Patient</label>

            <select
              value={patientId}
              onChange={(e) => setPatientId(e.target.value)}
              className="w-full border dark:border-slate-600 p-2 rounded bg-white dark:bg-slate-700 dark:text-slate-100"
            >
              <option value="">-- Select Patient --</option>

              {patients.map((p) => (
                <option key={p.id} value={String(p.id)}>
                  {p.name || p.email} (ID: {p.id})
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={fetchRecords}
            className="btn-primary"
          >
            Fetch Records
          </button>
        </div>

        {/* 🔹 Records Table */}
        {records.length > 0 && (
          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow">
            <table className="w-full border-collapse">

              <thead>
                <tr className="text-left border-b dark:border-slate-700">
                  <th className="p-2">Department</th>
                  <th className="p-2">Visit Type</th>
                  <th className="p-2">Diagnosis</th>
                  <th className="p-2">Prescription</th>
                  <th className="p-2">Severity</th>
                  <th className="p-2">Follow Up</th>
                  <th className="p-2">Created At</th>
                  <th className="p-2">Blockchain</th>
                </tr>
              </thead>

              <tbody>
                {records.map((record) => (
                  <tr
                    key={record.id}
                    onClick={() => router.push(`/records/${record.id}`)}
                    className="cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-700 transition border-b dark:border-slate-700"
                  >
                    <td className="p-2">{record.department}</td>
                    <td className="p-2">{record.visitType}</td>
                    <td className="p-2">{record.diagnosis}</td>
                    <td className="p-2">{record.prescription}</td>

                    <td className="p-2">
                      <span className="px-2 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded text-xs font-medium">
                        {record.severity}
                      </span>
                    </td>

                    <td className="p-2">{record.followUp}</td>

                    <td className="p-2">
                      {new Date(record.createdAt).toLocaleString()}
                    </td>

                    <td className="p-2 text-xs text-gray-500 dark:text-slate-400">
                      On-Chain
                    </td>
                  </tr>
                ))}
              </tbody>

            </table>
          </div>
        )}

      </div>
    </div>
  );
}