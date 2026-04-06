"use client";

import { useState, useEffect } from "react";
import useAuth from "@/hooks/useAuth";

export default function SubmitPage() {
  const { user } = useAuth();

  const [patients, setPatients] = useState<any[]>([]);
  const [patientId, setPatientId] = useState<string>("");
  const [createdRecord, setCreatedRecord] = useState<any>(null);
  const [loadingPatients, setLoadingPatients] = useState(true);

  const isLoggedIn = Boolean(user);
  const isDoctor = user?.role === "DOCTOR";

  // 🔁 Fetch patients
  useEffect(() => {
    if (!isDoctor) return;

    const fetchPatients = async () => {
      try {
        const res = await fetch("/api/users/patients", {
          credentials: "same-origin",
        });

        const data = await res.json();

        console.log("PATIENTS API RESPONSE:", data); // 🧪 DEBUG

        if (data?.patients) {
          setPatients(data.patients);
        } else {
          setPatients([]);
        }
      } catch (err) {
        console.error("Error fetching patients:", err);
      } finally {
        setLoadingPatients(false);
      }
    };

    fetchPatients();
  }, [isDoctor]);

  // 📝 Submit form
  async function handleSubmit(e: any) {
    e.preventDefault();

    if (!isLoggedIn || !isDoctor) return;

    if (!patientId) {
      alert("Please select a patient.");
      return;
    }

    const formData = {
      patientId: Number(patientId), // ✅ ensure number
      department: e.target.department.value,
      visitType: e.target.visitType.value,
      symptoms: e.target.symptoms.value,
      diagnosis: e.target.diagnosis.value,
      prescription: e.target.prescription.value,
      severity: e.target.severity.value,
      followUp: e.target.followUp.value,
      notes: e.target.notes.value,
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
      console.error("Error creating record:", err);
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

        <div className="bg-white p-6 rounded-xl shadow">

          {/* Auth Checks */}
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

          {/* FORM */}
          {isDoctor && (
            <form onSubmit={handleSubmit} className="space-y-6">

              {/* 👤 Patient Dropdown */}
              <div>
                <label className="block mb-1 text-sm text-slate-600">
                  Select Patient
                </label>

                {loadingPatients ? (
                  <p className="text-sm text-gray-500">Loading patients...</p>
                ) : patients.length === 0 ? (
                  <p className="text-sm text-red-500">
                    No patients found. Please register a patient first.
                  </p>
                ) : (
                  <select
                    value={patientId}
                    onChange={(e) => setPatientId(e.target.value)}
                    className={inputStyle}
                    required
                  >
                    <option value="">-- Select Patient --</option>

                    {patients.map((p) => (
                      <option key={p.id} value={String(p.id)}>
                        {p.name || p.email} (ID: {p.id})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Department */}
              <div>
                <label className="block mb-1 text-sm text-slate-600">
                  Department
                </label>
                <select name="department" className={inputStyle} required>
                  <option value="">Select Department</option>
                  <option>General Medicine</option>
                  <option>Cardiology</option>
                  <option>Neurology</option>
                  <option>Orthopedics</option>
                  <option>Dermatology</option>
                  <option>Pediatrics</option>
                  <option>ENT</option>
                  <option>Gastroenterology</option>
                  <option>Pulmonology</option>
                  <option>Endocrinology</option>
                </select>
              </div>

              {/* Visit Type */}
              <div>
                <label className="block mb-1 text-sm text-slate-600">
                  Visit Type
                </label>
                <select name="visitType" className={inputStyle} required>
                  <option value="">Select Visit Type</option>
                  <option>General Checkup</option>
                  <option>Follow-up</option>
                  <option>Emergency</option>
                  <option>Specialist Consultation</option>
                </select>
              </div>

              {/* Symptoms */}
              <textarea
                name="symptoms"
                required
                rows={3}
                className={inputStyle}
                placeholder="Symptoms..."
              />

              {/* Diagnosis */}
              <textarea
                name="diagnosis"
                required
                rows={3}
                className={inputStyle}
                placeholder="Diagnosis..."
              />

              {/* Prescription */}
              <textarea
                name="prescription"
                required
                rows={3}
                className={inputStyle}
                placeholder="Prescription..."
              />

              {/* Severity */}
              <select name="severity" className={inputStyle} required>
                <option value="">Select Severity</option>
                <option>Mild</option>
                <option>Moderate</option>
                <option>Severe</option>
                <option>Critical</option>
              </select>

              {/* Follow Up */}
              <select name="followUp" className={inputStyle}>
                <option>No Follow-up</option>
                <option>3 days</option>
                <option>1 week</option>
                <option>2 weeks</option>
                <option>1 month</option>
              </select>

              {/* Notes */}
              <textarea
                name="notes"
                rows={3}
                className={inputStyle}
                placeholder="Additional notes..."
              />

              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
              >
                Save Record
              </button>
            </form>
          )}
        </div>

        {/* ✅ Success */}
        {createdRecord && (
          <div className="bg-white p-6 rounded-xl shadow mt-6">
            <h2 className="text-lg font-semibold mb-4 text-green-600">
              Record Created Successfully
            </h2>

            <p><strong>Patient ID:</strong> {createdRecord.patientId}</p>
            <p><strong>Diagnosis:</strong> {createdRecord.diagnosis}</p>
            <p><strong>Prescription:</strong> {createdRecord.prescription}</p>

            <p className="text-sm text-slate-500 mt-2">
              {new Date(createdRecord.createdAt).toLocaleString()}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}