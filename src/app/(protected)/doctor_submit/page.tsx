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

  // Fetch patients
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

              {/* Patient */}
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
                      {p.name || p.email} (ID: {p.id})
                    </option>
                  ))}
                </select>
              </div>
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
              <div>
                <label className="block mb-1 text-sm text-slate-600">
                  Symptoms
                </label>
                <textarea
                  name="symptoms"
                  required
                  rows="3"
                  className={inputStyle}
                  placeholder="e.g., fever, headache, cough..."
                />
              </div>

              {/* Diagnosis */}
              <div>
                <label className="block mb-1 text-sm text-slate-600">
                  Diagnosis
                </label>
                <textarea
                  name="diagnosis"
                  required
                  rows="3"
                  className={inputStyle}
                />
              </div>

              {/* Prescription */}
              <div>
                <label className="block mb-1 text-sm text-slate-600">
                  Prescription / Medication
                </label>
                <textarea
                  name="prescription"
                  required
                  rows="3"
                  className={inputStyle}
                  placeholder="Medication and dosage instructions"
                />
              </div>

              {/* Severity */}
              <div>
                <label className="block mb-1 text-sm text-slate-600">
                  Severity
                </label>
                <select name="severity" className={inputStyle} required>
                  <option value="">Select Severity</option>
                  <option>Mild</option>
                  <option>Moderate</option>
                  <option>Severe</option>
                  <option>Critical</option>
                </select>
              </div>

              {/* Follow Up */}
              <div>
                <label className="block mb-1 text-sm text-slate-600">
                  Follow-up Required
                </label>
                <select name="followUp" className={inputStyle}>
                  <option>No Follow-up</option>
                  <option>3 days</option>
                  <option>1 week</option>
                  <option>2 weeks</option>
                  <option>1 month</option>
                </select>
              </div>

              {/* Notes */}
              <div>
                <label className="block mb-1 text-sm text-slate-600">
                  Doctor Notes (Optional)
                </label>
                <textarea
                  name="notes"
                  rows="3"
                  className={inputStyle}
                  placeholder="Additional clinical notes..."
                />
              </div>

              <button type="submit" className="btn-primary w-full">
                Save Record
              </button>

            </form>
          )}
        </div>

        {/* Success Display */}
        {createdRecord && (
          <div className="card mt-6">
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