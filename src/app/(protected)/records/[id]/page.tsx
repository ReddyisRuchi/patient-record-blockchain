"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Toast, useToast } from "@/components/Toast";

type RecordType = {
  id: number; diagnosis: string; symptoms: string; prescription: string;
  department: string; visitType: string; severity: string; followUp: string;
  createdAt: string; blockchainHash?: string;
};
type EventType = { location: string; action: string; timestamp: number | string; };

export default function RecordDetailsPage() {
  const params   = useParams();
  const router   = useRouter();
  const id       = params?.id;

  const [record, setRecord]   = useState<RecordType | null>(null);
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [history, setHistory] = useState<EventType[]>([]);
  const [location, setLocation] = useState("");
  const [action, setAction]   = useState("");
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const { toast, show, hide } = useToast();

  const role = "HEALTHCARE_ADMIN";

  useEffect(() => {
    if (!id) return;
    fetchRecord(); fetchVerification(); fetchHistory();
  }, [id]);

  const fetchRecord = async () => {
    try {
      const res = await fetch(`/api/records/getById?id=${id}`);
      const data = await res.json();
      setRecord(data.record);
    } catch { show("Failed to load record.", "error"); }
    finally { setLoading(false); }
  };

  const fetchVerification = async () => {
    try {
      const res = await fetch(`/api/records/verify?id=${id}`);
      const data = await res.json();
      setIsValid(data.valid ?? data.verified);
    } catch {}
  };

  const fetchHistory = async () => {
    try {
      const res = await fetch(`/api/track/history?id=${id}`);
      const data = await res.json();
      setHistory(data.history || []);
    } catch {}
  };

  const handleAddEvent = async () => {
    if (!location || !action) { show("Please fill all fields.", "error"); return; }
    try {
      const res = await fetch("/api/track/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recordId: Number(id), location, action }),
      });
      if (res.ok) {
        setLocation(""); setAction("");
        fetchHistory();
        show("Tracking event added.");
        setShowModal(false);
      } else {
        show("Failed to add event.", "error");
      }
    } catch { show("Failed to add event.", "error"); }
  };

  if (loading) return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-8">
      <div className="max-w-3xl mx-auto space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="bg-white dark:bg-slate-800 rounded-xl p-6">
            <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded animate-pulse w-1/3 mb-4" />
            {Array.from({ length: 4 }).map((_, j) => (
              <div key={j} className="h-4 bg-slate-100 dark:bg-slate-700 rounded animate-pulse mb-2" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );

  if (!record) return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
      <p className="text-slate-500 dark:text-slate-400">Record not found.</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-10 px-4 text-slate-900 dark:text-slate-100">
      {toast && <Toast message={toast.message} type={toast.type} onClose={hide} />}

      <div className="max-w-3xl mx-auto space-y-6">

        {/* Breadcrumbs + Back */}
        <div className="flex items-center justify-between fade-in fade-in-1">
          <nav className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
            <button onClick={() => router.push("/records")} className="hover:text-slate-900 dark:hover:text-white transition-colors">
              Records
            </button>
            <span>/</span>
            <span className="text-slate-900 dark:text-white font-medium">Record #{record.id}</span>
          </nav>
          <div className="flex items-center gap-3">
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/>
                <rect x="6" y="14" width="12" height="8"/>
              </svg>
              Print
            </button>
            <button
              onClick={() => router.back()}
              className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
              </svg>
              Back
            </button>
          </div>
        </div>

        {/* Medical Data */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow space-y-2 fade-in fade-in-2">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">Medical Record</h2>
          {[
            ["Diagnosis", record.diagnosis], ["Symptoms", record.symptoms],
            ["Prescription", record.prescription], ["Department", record.department],
            ["Visit Type", record.visitType], ["Severity", record.severity],
            ["Follow Up", record.followUp], ["Date", new Date(record.createdAt).toLocaleString()],
          ].map(([label, value]) => (
            <p key={label}><span className="font-medium">{label}:</span> {value}</p>
          ))}
        </div>

        {/* Verification */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow fade-in fade-in-3">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">Integrity Verification</h2>
          {isValid === null ? (
            <p className="text-slate-500 dark:text-slate-400">Checking...</p>
          ) : isValid ? (
            <p className="font-medium">Status: <span className="font-semibold">Valid</span></p>
          ) : (
            <p className="font-medium">Status: <span className="text-red-500 font-semibold">Tampered</span></p>
          )}

          {record.blockchainHash && (
            <div className="mt-4 space-y-2">
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider">Blockchain Hash</p>
              <p className="text-xs font-mono bg-slate-50 dark:bg-slate-700 px-3 py-2 rounded-lg break-all text-slate-700 dark:text-slate-300">
                {record.blockchainHash}
              </p>
              <a
                href={`https://sepolia.etherscan.io/search?q=${record.blockchainHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                  <polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
                </svg>
                View on Etherscan
              </a>
            </div>
          )}
        </div>

        {/* Tracking History */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow fade-in fade-in-4">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-6">Tracking History</h2>
          {history.length === 0 ? (
            <div className="text-center py-8">
              <svg className="mx-auto mb-3 text-slate-300 dark:text-slate-600" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              <p className="text-slate-500 dark:text-slate-400 text-sm">No tracking events yet.</p>
            </div>
          ) : (
            <div className="relative border-l-2 border-slate-200 dark:border-slate-600 ml-3 space-y-6">
              {history.map((event, i) => (
                <div key={i} className="relative pl-6">
                  <div className="absolute -left-[9px] top-2 w-4 h-4 bg-slate-900 dark:bg-white rounded-full border-2 border-white dark:border-slate-800" />
                  <div className="bg-slate-50 dark:bg-slate-700 p-4 rounded-lg">
                    <p className="font-medium">{event.action}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{event.location}</p>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                      {typeof event.timestamp === "number" ? new Date(event.timestamp * 1000).toLocaleString() : event.timestamp}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add Event */}
        {role === "HEALTHCARE_ADMIN" && (
          <div className="fade-in fade-in-5">
            <button onClick={() => setShowModal(true)} className="btn-primary">
              Add Tracking Event
            </button>
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-6 w-full max-w-md mx-4 animate-slideUp space-y-4">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Add Tracking Event</h3>
            <div>
              <label className="form-label">Location</label>
              <input
                type="text" placeholder="e.g. City Hospital, Lab B"
                value={location} onChange={(e) => setLocation(e.target.value)}
                className="w-full border border-slate-200 dark:border-slate-600 p-2.5 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
              />
            </div>
            <div>
              <label className="form-label">Action</label>
              <input
                type="text" placeholder="e.g. Collected, Transported, Received"
                value={action} onChange={(e) => setAction(e.target.value)}
                className="w-full border border-slate-200 dark:border-slate-600 p-2.5 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
              />
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={handleAddEvent} className="btn-primary flex-1">Confirm</button>
              <button onClick={() => setShowModal(false)} className="btn-outline flex-1">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
