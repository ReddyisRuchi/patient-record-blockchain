"use client";

import { useState } from "react";
import useAuth from "@/hooks/useAuth";

export default function PatientUpload() {
  const { user } = useAuth();
  const [message, setMessage] = useState("");

  const isLoggedIn = Boolean(user);
  const isPatient = user?.role === "PATIENT";

  const inputStyle =
    "w-full px-4 py-2.5 border border-slate-200 rounded-lg bg-white focus:ring-2 focus:ring-blue-200 focus:border-blue-500 focus:outline-none transition";

  async function handleSubmit(e: any) {
    e.preventDefault();

    if (!user) return;

    const formData = {
      patientId: user.id, // AUTO FILLED
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
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "same-origin",
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage("Record created successfully!");
        e.target.reset();
      } else {
        setMessage(data.message || "Failed to create record");
      }
    } catch (err) {
      console.error(err);
      setMessage("Server error");
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 py-16 px-4">
      <div className="mx-auto max-w-2xl">

        <h1 className="text-3xl font-bold text-blue-600 mb-8 text-center">
          Submit Medical Record
        </h1>

        {!isLoggedIn && (
          <p className="text-center text-red-500">
            Please login first.
          </p>
        )}

        {isLoggedIn && !isPatient && (
          <p className="text-center text-red-500">
            Only patients can submit records here.
          </p>
        )}

        {isPatient && (
          <form
            onSubmit={handleSubmit}
            className="space-y-6 bg-white p-6 rounded shadow"
          >

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
            <div>
              <label className="block mb-1 text-sm text-slate-600">
                Symptoms
              </label>
              <textarea
                name="symptoms"
                rows={3}
                className={inputStyle}
                required
              />
            </div>

            {/* Diagnosis */}
            <div>
              <label className="block mb-1 text-sm text-slate-600">
                Diagnosis
              </label>
              <textarea
                name="diagnosis"
                rows={3}
                className={inputStyle}
                required
              />
            </div>

            {/* Prescription */}
            <div>
              <label className="block mb-1 text-sm text-slate-600">
                Prescription
              </label>
              <textarea
                name="prescription"
                rows={3}
                className={inputStyle}
                required
                placeholder="Medicine name and dosage"
              />
            </div>

            {/* Severity */}
            <div>
              <label className="block mb-1 text-sm text-slate-600">
                Severity
              </label>
              <select name="severity" className={inputStyle} required>
                <option value="">Select severity</option>
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
                Notes
              </label>
              <textarea
                name="notes"
                rows={3}
                className={inputStyle}
              />
            </div>

            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded w-full"
            >
              Create Record
            </button>

          </form>
        )}

        {message && (
          <p className="text-center mt-6 text-green-600">
            {message}
          </p>
        )}

      </div>
    </div>
  );
}