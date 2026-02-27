"use client";

import { useState, useEffect } from "react";
import useAuth from "@/hooks/useAuth";

export default function RecordsPage() {
  const { user } = useAuth();

  const [records, setRecords] = useState([]);
  const [patients, setPatients] = useState([]);
  const [selectedPatientId, setSelectedPatientId] = useState("");
  const [loading, setLoading] = useState(false);

  const isPatient = user?.role === "PATIENT";
  const isDoctor = user?.role === "DOCTOR";

  // 🔹 Auto-fetch for PATIENT
  useEffect(() => {
    if (!user || !isPatient) return;

    async function loadPatientRecords() {
      try {
        setLoading(true);
        const res = await fetch("/api/records/get", {
          credentials: "same-origin",
        });

        const data = await res.json();
        if (res.ok) {
          setRecords(data.records || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadPatientRecords();
  }, [user, isPatient]);

  // 🔹 Fetch patients list for DOCTOR
  useEffect(() => {
    if (!user || !isDoctor) return;

    async function loadPatients() {
      try {
        const res = await fetch("/api/users/patients", {
          credentials: "same-origin",
        });

        const data = await res.json();
        if (res.ok) {
          setPatients(data.patients || []);
        }
      } catch (err) {
        console.error(err);
      }
    }

    loadPatients();
  }, [user, isDoctor]);

  async function fetchRecordsForDoctor() {
    if (!selectedPatientId) {
      alert("Please select a patient.");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(
        `/api/records/get?patientId=${selectedPatientId}`,
        { credentials: "same-origin" }
      );

      const data = await res.json();

      if (res.ok) {
        setRecords(data.records || []);
      } else {
        alert(data.error);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  // ✅ NOW safe to conditionally render
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  const inputStyle =
    "w-full px-4 py-2.5 border border-slate-200 rounded-lg bg-white focus:ring-2 focus:ring-blue-200 focus:border-blue-500 focus:outline-none transition";

  return (
    <div className="min-h-screen bg-slate-50 py-16 px-4">
      <div className="mx-auto w-full max-w-5xl">

        <div className="mb-10 text-center">
          <h1 className="text-3xl font-bold text-blue-600">
            View Medical Records
          </h1>
        </div>

        {isDoctor && (
          <div className="card mb-6 space-y-4">
            <label className="block text-sm text-slate-600">
              Select Patient
            </label>
            <select
              value={selectedPatientId}
              onChange={(e) => setSelectedPatientId(e.target.value)}
              className={inputStyle}
            >
              <option value="">-- Select Patient --</option>
              {patients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} (ID: {p.id})
                </option>
              ))}
            </select>

            <button
              onClick={fetchRecordsForDoctor}
              className="btn-primary w-full"
            >
              Fetch Records
            </button>
          </div>
        )}

        <div className="card overflow-x-auto">
          {loading ? (
            <div className="text-center py-12 text-slate-500">
              Loading records...
            </div>
          ) : records.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              No records found.
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-600 text-sm">
                  <th className="py-3 px-4">Diagnosis</th>
                  <th className="py-3 px-4">Treatment</th>
                  <th className="py-3 px-4">Created At</th>
                  <th className="py-3 px-4">Blockchain</th>
                </tr>
              </thead>
              <tbody>
                {records.map((record, index) => (
                  <tr
                    key={record.id}
                    className={`border-b border-slate-100 ${
                      index % 2 === 0 ? "bg-white" : "bg-slate-50"
                    }`}
                  >
                    <td className="py-3 px-4">{record.diagnosis}</td>
                    <td className="py-3 px-4">{record.treatment}</td>
                    <td className="py-3 px-4 text-slate-600">
                      {new Date(record.createdAt).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-xs break-all text-slate-500">
                      {record.blockchainHash ? (
                        <div className="flex flex-col gap-1">
                          <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded-full w-fit">
                            On-Chain
                          </span>
                          {record.blockchainHash}
                        </div>
                      ) : (
                        <span className="text-slate-400">Not Stored</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

      </div>
    </div>
  );
}