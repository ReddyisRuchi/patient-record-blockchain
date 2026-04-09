"use client";

import { useState, useEffect } from "react";
import useAuth from "@/hooks/useAuth";
import { Toast, useToast } from "@/components/Toast";

export default function SubmitPage() {
  const { user } = useAuth();
  const { toast, show, hide } = useToast();

  const [patients, setPatients]           = useState<any[]>([]);
  const [patientId, setPatientId]         = useState<string>("");
  const [createdRecord, setCreatedRecord] = useState<any>(null);
  const [loadingPatients, setLoadingPatients] = useState(true);
  const [showModal, setShowModal]         = useState(false);
  const [pendingData, setPendingData]     = useState<any>(null);

  const isLoggedIn = Boolean(user);
  const isDoctor   = user?.role === "HEALTHCARE_ADMIN";

  // 🔁 Fetch patients
  useEffect(() => {
    if (!isDoctor) return;

    const fetchPatients = async () => {
      try {
        const res = await fetch("/api/users/patients", {
          credentials: "same-origin",
        });

        const data = await res.json();

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

  // 📝 Submit form — collect data then show modal
  async function handleSubmit(e: any) {
    e.preventDefault();
    if (!isLoggedIn || !isDoctor) return;
    if (!patientId) { show("Please select a patient.", "error"); return; }

    setPendingData({
      patientId: Number(patientId),
      department: e.target.department.value,
      visitType: e.target.visitType.value,
      symptoms: e.target.symptoms.value,
      diagnosis: e.target.diagnosis.value,
      prescription: e.target.prescription.value,
      severity: e.target.severity.value,
      followUp: e.target.followUp.value,
      notes: e.target.notes.value,
    });
    setShowModal(true);
  }

  const confirmSubmit = async () => {
    setShowModal(false);
    try {
      const res  = await fetch("/api/records/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify(pendingData),
      });
      const data = await res.json();
      if (res.ok) {
        setCreatedRecord(data.record);
        setPatientId("");
        show("Record created successfully.");
      } else {
        show(data.error || "Failed to create record.", "error");
      }
    } catch {
      show("Something went wrong.", "error");
    }
  };

  const inputStyle =
    "w-full px-4 py-2.5 border border-slate-200 dark:border-neutral-800 rounded-lg bg-white dark:bg-neutral-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-200 focus:border-blue-500 focus:outline-none transition";

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-black py-16 px-4">
      {toast && <Toast message={toast.message} type={toast.type} onClose={hide} />}
      <div className="mx-auto w-full max-w-2xl">

        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-8 text-center">
          Create Medical Record
        </h1>

        <div className="bg-white dark:bg-neutral-900 p-6 rounded-xl shadow">

          {/* Auth Checks */}
          {!isLoggedIn && (
            <p className="text-sm text-red-500 mb-6 text-center">
              You must be logged in.
            </p>
          )}

          {isLoggedIn && !isDoctor && (
            <p className="text-sm text-red-500 mb-6 text-center">
              Only Healthcare Admins can create records.
            </p>
          )}

          {/* FORM */}
          {isDoctor && (
            <form onSubmit={handleSubmit} className="space-y-6">

              {/* 👤 Patient Dropdown */}
              <div>
                <label className="form-label">Select Patient</label>
                {loadingPatients ? (
                  <p className="text-sm text-slate-500 dark:text-slate-400">Loading patients...</p>
                ) : patients.length === 0 ? (
                  <p className="text-sm text-red-500">No patients found. Please register a patient first.</p>
                ) : (
                  <select value={patientId} onChange={(e) => setPatientId(e.target.value)} className={inputStyle} required>
                    <option value="">-- Select Patient --</option>
                    {patients.map((p) => (
                      <option key={p.id} value={String(p.id)}>{p.name || p.email} (ID: {p.id})</option>
                    ))}
                  </select>
                )}
              </div>

              {/* Department */}
              <div>
                <label className="form-label">Department</label>
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
                <label className="form-label">Visit Type</label>
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
                className="btn-primary w-full"
              >
                Save Record
              </button>
            </form>
          )}
        </div>

        {createdRecord && (
          <div className="bg-white dark:bg-neutral-900 p-6 rounded-xl shadow mt-6 fade-in fade-in-1">
            <h2 className="text-lg font-semibold mb-4 text-slate-900 dark:text-white">Record Created</h2>
            <p><strong>Patient ID:</strong> {createdRecord.patientId}</p>
            <p><strong>Diagnosis:</strong> {createdRecord.diagnosis}</p>
            <p><strong>Prescription:</strong> {createdRecord.prescription}</p>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
              {new Date(createdRecord.createdAt).toLocaleString()}
            </p>
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-xl p-6 w-full max-w-sm mx-4 animate-slideUp space-y-4">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Confirm Submission</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              Are you sure you want to save this medical record? This will be written to the blockchain.
            </p>
            <div className="flex gap-3 pt-2">
              <button onClick={confirmSubmit} className="btn-primary flex-1">Confirm</button>
              <button onClick={() => setShowModal(false)} className="btn-outline flex-1">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

