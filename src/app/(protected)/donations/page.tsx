"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Toast, useToast } from "@/components/Toast";

const statusColors: Record<string, string> = {
  collected: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300",
  assigned:  "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
};

const inputCls = "w-full border border-slate-200 dark:border-neutral-800 px-4 py-2.5 rounded-lg bg-white dark:bg-neutral-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-300 transition";

function isExpiringSoon(expiryDate: string | null) {
  if (!expiryDate) return false;
  const diff = new Date(expiryDate).getTime() - Date.now();
  return diff > 0 && diff < 3 * 24 * 60 * 60 * 1000; // within 3 days
}

function isExpired(expiryDate: string | null) {
  if (!expiryDate) return false;
  return new Date(expiryDate).getTime() < Date.now();
}

export default function DonationsPage() {
  const router = useRouter();
  const { toast, show, hide } = useToast();

  const [donations, setDonations]           = useState<any[]>([]);
  const [patients, setPatients]             = useState<any[]>([]);
  const [showAdd, setShowAdd]               = useState(false);
  const [showAssign, setShowAssign]         = useState(false);
  const [showDetails, setShowDetails]       = useState(false);
  const [selectedDonation, setSelectedDonation] = useState<any>(null);
  const [type, setType]                     = useState("");
  const [bloodGroup, setBloodGroup]         = useState("");
  const [donorInfo, setDonorInfo]           = useState("");
  const [notes, setNotes]                   = useState("");
  const [location, setLocation]             = useState("");
  const [expiryDate, setExpiryDate]         = useState("");
  const [selectedPatient, setSelectedPatient] = useState("");
  const [filterBlood, setFilterBlood]       = useState("");

  const fetchData = async () => {
    const d = await fetch("/api/donations/get").then((r) => r.json());
    setDonations(d.donations || []);
    const p = await fetch("/api/users/patients").then((r) => r.json());
    setPatients(p.patients || []);
  };

  useEffect(() => { fetchData(); }, []);

  const bloodGroups = [...new Set(donations.map((d) => d.bloodGroup).filter(Boolean))];
  const filtered = filterBlood ? donations.filter((d) => d.bloodGroup === filterBlood) : donations;

  const createDonation = async () => {
    if (!type || !location) { show("Fill required fields.", "error"); return; }
    await fetch("/api/donations/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, bloodGroup, donorInfo, notes, currentLocation: location, expiryDate: expiryDate || null }),
    });
    setShowAdd(false);
    setType(""); setBloodGroup(""); setDonorInfo(""); setNotes(""); setLocation(""); setExpiryDate("");
    show("Donation added.");
    fetchData();
  };

  const assignDonation = async () => {
    if (!selectedPatient) { show("Select a patient.", "error"); return; }
    await fetch("/api/donations/assign", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ donationId: selectedDonation.id, patientId: selectedPatient }),
    });
    setShowAssign(false);
    show("Donation assigned.");
    fetchData();
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-black py-16 px-4">
      {toast && <Toast message={toast.message} type={toast.type} onClose={hide} />}

      <div className="mx-auto max-w-5xl">

        <div className="flex items-center justify-between mb-8 fade-in fade-in-1">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Donations Registry</h1>
          <div className="flex items-center gap-3">
            {bloodGroups.length > 0 && (
              <select
                value={filterBlood}
                onChange={(e) => setFilterBlood(e.target.value)}
                className="border border-slate-200 dark:border-neutral-800 px-3 py-2 rounded-lg bg-white dark:bg-neutral-900 dark:text-slate-100 text-sm"
              >
                <option value="">All Blood Groups</option>
                {bloodGroups.map((b) => <option key={b}>{b}</option>)}
              </select>
            )}
            <button onClick={() => setShowAdd(true)} className="btn-primary">Add Donation</button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white dark:bg-neutral-900 rounded-xl shadow overflow-hidden fade-in fade-in-2">
          {donations.length === 0 ? (            <div className="p-16 text-center">
              <svg className="mx-auto mb-4 text-slate-300 dark:text-slate-600" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
              <p className="text-slate-500 dark:text-slate-400">No donations yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="text-left border-b dark:border-neutral-800 text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    <th className="px-4 py-3">ID</th>
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3">Blood Group</th>
                    <th className="px-4 py-3">Location</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Expiry</th>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((d: any) => {
                    const expiring = isExpiringSoon(d.expiryDate);
                    const expired  = isExpired(d.expiryDate);
                    return (
                    <tr key={d.id} className={`border-b dark:border-neutral-800 hover:bg-slate-50 dark:hover:bg-neutral-900 transition text-sm ${expired ? "opacity-60" : ""}`}>
                      <td className="px-4 py-3 text-slate-500 dark:text-slate-400">#{d.id}</td>
                      <td className="px-4 py-3 font-medium">{d.type}</td>
                      <td className="px-4 py-3">{d.bloodGroup || "—"}</td>
                      <td className="px-4 py-3">{d.currentLocation}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${statusColors[d.status] || "bg-slate-100 text-slate-600"}`}>
                          {d.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {d.expiryDate ? (
                          <span className={`text-xs font-medium ${expired ? "text-red-500" : expiring ? "text-yellow-600 dark:text-yellow-400" : "text-slate-500 dark:text-slate-400"}`}>
                            {expired ? "Expired" : expiring ? "⚠ " + new Date(d.expiryDate).toLocaleDateString() : new Date(d.expiryDate).toLocaleDateString()}
                          </span>
                        ) : "—"}
                      </td>
                      <td className="px-4 py-3 text-slate-500 dark:text-slate-400">
                        {new Date(d.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button onClick={() => { setSelectedDonation(d); setShowDetails(true); }} className="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">Details</button>
                          <span className="text-slate-300 dark:text-slate-600">·</span>
                          <button onClick={() => { setSelectedDonation(d); setShowAssign(true); }} className="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">Assign</button>
                          <span className="text-slate-300 dark:text-slate-600">·</span>
                          <button onClick={() => router.push(`/donation/${d.id}`)} className="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">Track</button>
                        </div>
                      </td>
                    </tr>
                  )})}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Add Modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setShowAdd(false)}>
          <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-xl p-6 w-full max-w-md mx-4 animate-slideUp space-y-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Add Donation</h3>
            <div><label className="form-label">Type *</label><input value={type} onChange={(e) => setType(e.target.value)} placeholder="e.g. Blood, Organ" className={inputCls} /></div>
            <div><label className="form-label">Blood Group</label><input value={bloodGroup} onChange={(e) => setBloodGroup(e.target.value)} placeholder="e.g. A+" className={inputCls} /></div>
            <div><label className="form-label">Donor Info</label><input value={donorInfo} onChange={(e) => setDonorInfo(e.target.value)} placeholder="Donor name or ID" className={inputCls} /></div>
            <div><label className="form-label">Location *</label><input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Current location" className={inputCls} /></div>
            <div><label className="form-label">Expiry Date</label><input type="date" value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)} className={inputCls} /></div>
            <div><label className="form-label">Notes</label><input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Optional notes" className={inputCls} /></div>
            <div className="flex gap-3 pt-2">
              <button onClick={createDonation} className="btn-primary flex-1">Submit</button>
              <button onClick={() => setShowAdd(false)} className="btn-outline flex-1">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Assign Modal */}
      {showAssign && selectedDonation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setShowAssign(false)}>
          <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-xl p-6 w-full max-w-sm mx-4 animate-slideUp space-y-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Assign Donation #{selectedDonation.id}</h3>
            <div>
              <label className="form-label">Select Patient</label>
              <select value={selectedPatient} onChange={(e) => setSelectedPatient(e.target.value)} className={inputCls}>
                <option value="">-- Select Patient --</option>
                {patients.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={assignDonation} className="btn-primary flex-1">Assign</button>
              <button onClick={() => setShowAssign(false)} className="btn-outline flex-1">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {showDetails && selectedDonation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setShowDetails(false)}>
          <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-xl p-6 w-full max-w-sm mx-4 animate-slideUp space-y-3" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Donation #{selectedDonation.id}</h3>
            {[
              ["Type", selectedDonation.type],
              ["Blood Group", selectedDonation.bloodGroup || "—"],
              ["Donor Info", selectedDonation.donorInfo || "—"],
              ["Notes", selectedDonation.notes || "—"],
              ["Status", selectedDonation.status],
              ["Location", selectedDonation.currentLocation],
            ].map(([label, value]) => (
              <p key={label} className="text-sm"><span className="font-medium">{label}:</span> {value}</p>
            ))}
            <button onClick={() => setShowDetails(false)} className="btn-outline w-full mt-2">Close</button>
          </div>
        </div>
      )}
    </div>
  );
}


