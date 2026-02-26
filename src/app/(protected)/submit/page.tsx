"use client";

import { useState, useEffect } from "react";
import useAuth from "@/hooks/useAuth";

export default function SubmitPage() {
  const { user } = useAuth();

  const [patients, setPatients] = useState([]);
  const [patientId, setPatientId] = useState("");
  const [createdRecord, setCreatedRecord] = useState(null);

  const isLoggedIn = Boolean(user);
  const isDoctor = user?.role === "DOCTOR";

  // 🔹 Fetch patients when doctor loads page
  useEffect(() => {
    if (isDoctor) {
      fetch("/api/users/patients", {
        credentials: "same-origin",
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.patients) {
            setPatients(data.patients);
          }
        })
        .catch((err) => console.error(err));
    }
  }, [isDoctor]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!isLoggedIn || !isDoctor) return;

    if (!patientId) {
      alert("Please select a patient.");
      return;
    }

    const formData = {
      patientId,
      diagnosis: e.target.diagnosis.value,
      treatment: e.target.treatment.value,
    };

    try {
      const res = await fetch("/api/records/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        setCreatedRecord(data.record);
        setPatientId("");
        e.target.reset();
      } else {
        alert(data.error || "Failed to create record");
      }
    } catch (err) {
      console.error(err);
    }
  }

  const inputStyle =
    "w-full px-4 py-2.5 border border-slate-200 rounded-lg bg-white focus:ring-2 focus:ring-blue-200 focus:border-blue-500 focus:outline-none transition";

  return (
    <div className="min-h-screen bg-slate-50 py-16 px-4">
      <div className="mx-auto w-full max-w-2xl">
        <h1 className="text-3xl font-bold text-blue-600 mb-8 text-center">
          Create Medical Record
        </h1>

        <div className="card">
          {!isLoggedIn && (
            <p className="text-sm text-red-500 mb-6 text-center">
              You must be logged in.
            </p>
          )}

          {isLoggedIn && !isDoctor && (
            <p className="text-sm text-red-500 mb-6 text-center">
              Only DOCTORS can create records.
            </p>
          )}

          {isDoctor && (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Patient Dropdown */}
              <div>
                <label className="block mb-1 text-sm text-slate-600">
                  Select Patient
                </label>
                <select
                  value={patientId}
                  onChange={(e) => setPatientId(e.target.value)}
                  className={inputStyle}
                  required
                >
                  <option value="">-- Select Patient --</option>
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} (ID: {p.id})
                    </option>
                  ))}
                </select>
              </div>

              {/* Diagnosis */}
              <div>
                <label className="block mb-1 text-sm text-slate-600">
                  Diagnosis
                </label>
                <textarea
                  name="diagnosis"
                  required
                  className={inputStyle}
                />
              </div>

              {/* Treatment */}
              <div>
                <label className="block mb-1 text-sm text-slate-600">
                  Treatment
                </label>
                <textarea
                  name="treatment"
                  required
                  className={inputStyle}
                />
              </div>

              <button type="submit" className="btn-primary w-full">
                Save Record
              </button>
            </form>
          )}
        </div>

        {/* Success Preview */}
        {createdRecord && (
          <div className="card mt-6">
            <h2 className="text-lg font-semibold mb-4 text-green-600">
              Record Created Successfully
            </h2>
            <p><strong>Patient ID:</strong> {createdRecord.patientId}</p>
            <p><strong>Diagnosis:</strong> {createdRecord.diagnosis}</p>
            <p><strong>Treatment:</strong> {createdRecord.treatment}</p>
            <p className="text-sm text-slate-500 mt-2">
              {new Date(createdRecord.createdAt).toLocaleString()}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}