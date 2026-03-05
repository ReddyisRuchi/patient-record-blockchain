"use client";

import { useEffect, useState } from "react";
import useAuth from "@/hooks/useAuth";

export default function VerifyPage() {
  const [patients, setPatients] = useState([]);
  const [records, setRecords] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState("");
  const [selectedRecord, setSelectedRecord] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  // 🔹 Fetch all patients on load
  useEffect(() => {
  if (!user) return;

  // If doctor → fetch all patients
  if (user.role === "DOCTOR") {
    const fetchPatients = async () => {
      const res = await fetch("/api/users/patients");
      const data = await res.json();
      setPatients(data.patients || []);
    };
    fetchPatients();
  }

  // If patient → auto-set themselves
  if (user.role === "PATIENT") {
    setPatients([user]);
    setSelectedPatient(user.id);
  }

}, [user]);

  // 🔹 Fetch records when patient changes
  useEffect(() => {
    if (!selectedPatient) return;

    const fetchRecords = async () => {
  const res = await fetch(`/api/records/get?patientId=${selectedPatient}`);
  const data = await res.json();
  console.log("Records API response:", data);
  setRecords(data.records || data);
};

    fetchRecords();
  }, [selectedPatient]);

  const handleVerify = async () => {
    if (!selectedRecord) return;

    setLoading(true);
    setResult(null);

    try {
      const res = await fetch(
        `/api/records/verify?recordId=${selectedRecord}`
      );
      const data = await res.json();
      setResult(data);
    } catch (err) {
      console.error("Verification failed:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-16 px-4">
      <div className="mx-auto max-w-2xl">

        <h1 className="text-3xl font-bold text-indigo-600 mb-8 text-center">
          Verify Medical Record
        </h1>

        <div className="card space-y-5">

          {/* Patient Dropdown */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Select Patient
            </label>
            <select
              value={selectedPatient}
              onChange={(e) => setSelectedPatient(e.target.value)}
              className="w-full p-3 border rounded-md"
            >
              <option value="">-- Choose Patient --</option>
              {patients.map((patient) => (
                <option key={patient.id} value={patient.id}>
                  {patient.name || patient.email}
                </option>
              ))}
            </select>
          </div>

         {/* Record Section */}
{selectedPatient && (
  <div>
    <label className="block text-sm font-medium mb-1">
      Select Record
    </label>

    {records.length > 0 ? (
      <select
        value={selectedRecord}
        onChange={(e) => setSelectedRecord(e.target.value)}
        className="w-full p-3 border rounded-md"
      >
        <option value="">-- Choose Record --</option>
        {records.map((record) => (
          <option key={record.id} value={record.id}>
            Record #{record.id} – {record.diagnosis}
          </option>
        ))}
      </select>
    ) : (
      <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md text-yellow-700 text-sm">
        ⚠ No records found for this patient.
      </div>
    )}
  </div>
)}

          {/* Verify Button */}
          <button
            onClick={handleVerify}
            disabled={!selectedRecord || loading}
            className="btn-primary w-full"
          >
            {loading ? "Verifying..." : "Verify Record"}
          </button>

          {/* Result */}
          {result && (
            <div className="mt-6 p-4 border rounded-md bg-white space-y-3">

              <div>
                <strong>DB Hash:</strong>
                <p className="text-xs break-all text-slate-600">
                  {result.dbHash}
                </p>
              </div>

              <div>
                <strong>On-Chain Hash:</strong>
                <p className="text-xs break-all text-slate-600">
                  {result.onChainHash}
                </p>
              </div>

              <div className="text-center mt-4">
                {result.verified ? (
                  <span className="px-4 py-2 bg-emerald-100 text-emerald-700 rounded-full font-semibold">
                    ✅ Record Verified
                  </span>
                ) : (
                  <span className="px-4 py-2 bg-red-100 text-red-600 rounded-full font-semibold">
                    ❌ Tampered / Invalid
                  </span>
                )}
              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
}