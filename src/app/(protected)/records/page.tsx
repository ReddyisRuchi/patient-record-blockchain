"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RecordsPage() {
  const [patientId, setPatientId] = useState("");
  const [patients, setPatients] = useState<any[]>([]);
  const [records, setRecords] = useState<any[]>([]);

  const router = useRouter();

  // Fetch patients
  const fetchPatients = async () => {
    const res = await fetch("/api/users/patients");
    const data = await res.json();
    setPatients(data.patients || []);
  };

  // Fetch records
  const fetchRecords = async () => {
    if (!patientId) return;

    const res = await fetch(`/api/records/get?patientId=${patientId}`);
    const data = await res.json();
    setRecords(data.records || data || []);
  };

  return (
    <div className="min-h-screen bg-slate-50 py-16 px-4">
      <div className="mx-auto max-w-5xl">

        <h1 className="text-3xl font-bold text-blue-600 mb-8 text-center">
          View Medical Records
        </h1>

        {/* 🔹 Patient Selection */}
        <div className="bg-white p-6 rounded-xl shadow mb-6 space-y-4">

          <div>
            <label className="block mb-1 text-sm text-slate-600">
              Select Patient
            </label>

            <select
              value={patientId}
              onChange={(e) => setPatientId(e.target.value)}
              className="w-full border p-2 rounded"
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
            onClick={fetchPatients}
            className="bg-gray-200 px-4 py-2 rounded"
          >
            Load Patients
          </button>

          <button
            onClick={fetchRecords}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            Fetch Records
          </button>
        </div>

        {/* 🔹 Records Table */}
        {records.length > 0 && (
          <div className="bg-white p-6 rounded-xl shadow">
            <table className="w-full border-collapse">

              <thead>
                <tr className="text-left border-b">
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
                    className="cursor-pointer hover:bg-gray-100 transition border-b"
                  >
                    <td className="p-2">{record.department}</td>
                    <td className="p-2">{record.visitType}</td>
                    <td className="p-2">{record.diagnosis}</td>
                    <td className="p-2">{record.prescription}</td>

                    <td className="p-2">
                      <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-sm">
                        {record.severity}
                      </span>
                    </td>

                    <td className="p-2">{record.followUp}</td>

                    <td className="p-2">
                      {new Date(record.createdAt).toLocaleString()}
                    </td>

                    <td className="p-2 text-xs text-gray-500">
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