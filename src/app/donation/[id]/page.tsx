"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { Toast, useToast } from "@/components/Toast";

export default function DonationPage() {
  const { id }   = useParams();
  const router   = useRouter();
  const { toast, show, hide } = useToast();

  const [history, setHistory]   = useState<any[]>([]);
  const [location, setLocation] = useState("");
  const [action, setAction]     = useState("");

  const fetchHistory = () => {
    fetch(`/api/track/history?id=${id}`)
      .then((r) => r.json())
      .then((d) => setHistory(d.history || []));
  };

  useEffect(() => { if (id) fetchHistory(); }, [id]);

  const addEvent = async () => {
    if (!location || !action) { show("Please fill all fields.", "error"); return; }
    await fetch("/api/track/add", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ donationId: Number(id), location, action }),
    });
    setLocation(""); setAction("");
    show("Event added.");
    fetchHistory();
  };

  const inputCls = "w-full border border-slate-200 dark:border-slate-600 px-4 py-2.5 rounded-lg bg-white dark:bg-slate-700 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-300 transition";

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-10 px-4 text-slate-900 dark:text-slate-100">
      {toast && <Toast message={toast.message} type={toast.type} onClose={hide} />}

      <div className="max-w-2xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between fade-in fade-in-1">
          <nav className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
            <button onClick={() => router.push("/donations")} className="hover:text-slate-900 dark:hover:text-white transition-colors">
              Donations
            </button>
            <span>/</span>
            <span className="text-slate-900 dark:text-white font-medium">Donation #{id}</span>
          </nav>
          <button onClick={() => router.back()} className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
            </svg>
            Back
          </button>
        </div>

        {/* QR Code */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow p-6 flex flex-col items-center gap-4 fade-in fade-in-2">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white self-start">QR Code</h2>
          <div className="p-3 bg-white rounded-xl">
            <QRCodeCanvas value={`${typeof window !== "undefined" ? window.location.origin : ""}/donation/${id}`} size={180} />
          </div>
          <p className="text-xs text-slate-400 dark:text-slate-500">Scan to view this donation's tracking page</p>
        </div>

        {/* Journey timeline */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow p-6 fade-in fade-in-3">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">Journey</h2>
          {history.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-slate-500 dark:text-slate-400 text-sm">No events recorded yet.</p>
            </div>
          ) : (
            <div className="relative border-l-2 border-slate-200 dark:border-slate-600 ml-3 space-y-6">
              {history.map((item: any, i: number) => (
                <div key={i} className="relative pl-6">
                  <div className="absolute -left-[9px] top-2 w-4 h-4 bg-slate-900 dark:bg-white rounded-full border-2 border-white dark:border-slate-800" />
                  <div className="bg-slate-50 dark:bg-slate-700 p-4 rounded-lg">
                    <p className="font-medium">{item.action}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{item.location}</p>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{item.timestamp}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add event */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow p-6 space-y-4 fade-in fade-in-4">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Add Event</h2>
          <div><label className="form-label">Location</label><input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g. City Hospital, Lab B" className={inputCls} /></div>
          <div><label className="form-label">Action</label><input value={action} onChange={(e) => setAction(e.target.value)} placeholder="e.g. Collected, Transported, Received" className={inputCls} /></div>
          <button onClick={addEvent} className="btn-primary">Add Event</button>
        </div>

      </div>
    </div>
  );
}
