"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useParams, useRouter } from "next/navigation";
import useAuth from "@/hooks/useAuth";
import { Toast, useToast } from "@/components/Toast";

function DangerZone({ router, show }: { router: any; show: any }) {
  const [confirm, setConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const { refreshAuth } = useAuth();

  const handleDelete = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/delete-account", { method: "DELETE" });
      if (res.ok) {
        await refreshAuth();
        router.push("/");
      } else show("Failed to delete account.", "error");
    } catch { show("Something went wrong.", "error"); }
    finally { setLoading(false); }
  };

  return (
    <div className="bg-white dark:bg-neutral-900 rounded-xl shadow p-6 border border-red-200 dark:border-red-900 fade-in fade-in-6">
      <h2 className="text-lg font-semibold text-red-600 mb-2">Danger Zone</h2>
      <p className="text-sm text-slate-500 dark:text-neutral-400 mb-4">
        Permanently delete your account and all associated records. This cannot be undone.
      </p>
      {!confirm ? (
        <button onClick={() => setConfirm(true)} className="px-4 py-2 rounded-lg border border-red-500 text-red-500 text-sm font-medium hover:bg-red-50 dark:hover:bg-red-950 transition-colors">
          Delete Account
        </button>
      ) : (
        <div className="space-y-3">
          <p className="text-sm font-medium text-red-600">Are you absolutely sure?</p>
          <div className="flex gap-3">
            <button onClick={handleDelete} disabled={loading} className="px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-50">
              {loading ? "Deleting..." : "Yes, delete my account"}
            </button>
            <button onClick={() => setConfirm(false)} className="btn-outline text-sm">Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}

function PhotoViewer({ url, size = "lg" }: { url: string; size?: "sm" | "lg" }) {
  const [open, setOpen] = useState(false);
  const sizeClass = size === "sm" ? "w-14 h-14" : "w-20 h-20";

  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <>
      <img
        src={url} alt="Patient"
        onClick={() => setOpen(true)}
        className={`${sizeClass} rounded-full object-cover border border-slate-200 dark:border-neutral-700 hover:opacity-80 transition-opacity cursor-pointer shrink-0`}
      />
      {open && typeof document !== "undefined" && createPortal(
        <div
          onClick={() => setOpen(false)}
          style={{ position: "fixed", inset: 0, zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.85)", backdropFilter: "blur(4px)" }}
        >
          <img
            src={url} alt="Patient"
            onClick={(e) => e.stopPropagation()}
            style={{ maxHeight: "90vh", maxWidth: "90vw", borderRadius: "12px", boxShadow: "0 25px 50px rgba(0,0,0,0.5)" }}
          />
        </div>,
        document.body
      )}
    </>
  );
}
function ChangePasswordSection() {  const { toast, show, hide } = useToast();
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: any) {
    e.preventDefault();
    const currentPassword = e.target.currentPassword.value;
    const newPassword     = e.target.newPassword.value;
    const confirm         = e.target.confirm.value;
    if (newPassword !== confirm) { show("Passwords do not match.", "error"); return; }
    setLoading(true);
    try {
      const res  = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (res.ok) { show("Password updated."); e.target.reset(); }
      else show(data.message || "Failed.", "error");
    } catch { show("Something went wrong.", "error"); }
    finally { setLoading(false); }
  }

  return (
    <div className="bg-white dark:bg-neutral-900 rounded-xl shadow p-6 fade-in fade-in-4">
      {toast && <Toast message={toast.message} type={toast.type} onClose={hide} />}
      <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Change Password</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="form-label">Current Password</label>
          <input name="currentPassword" type="password" required
            className="w-full border border-slate-200 dark:border-neutral-800 px-4 py-2.5 rounded-lg bg-white dark:bg-neutral-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-300" />
        </div>
        <div>
          <label className="form-label">New Password</label>
          <input name="newPassword" type="password" required minLength={6}
            className="w-full border border-slate-200 dark:border-neutral-800 px-4 py-2.5 rounded-lg bg-white dark:bg-neutral-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-300" />
        </div>
        <div>
          <label className="form-label">Confirm New Password</label>
          <input name="confirm" type="password" required
            className="w-full border border-slate-200 dark:border-neutral-800 px-4 py-2.5 rounded-lg bg-white dark:bg-neutral-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-300" />
        </div>
        <button type="submit" disabled={loading} className="btn-primary disabled:opacity-50">
          {loading ? "Updating..." : "Update Password"}
        </button>
      </form>
    </div>
  );
}

const severityColors: Record<string, string> = {
  Mild:     "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
  Moderate: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300",
  Severe:   "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300",
  Critical: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
};

export default function PatientProfilePage() {
  const { id }   = useParams();
  const router   = useRouter();
  const { user } = useAuth();
  const [patient, setPatient] = useState<any>(null);
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [allergies, setAllergies] = useState("");
  const [editingAllergies, setEditingAllergies] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [editingProfile, setEditingProfile] = useState(false);
  const { toast: aToast, show: aShow, hide: aHide } = useToast();

  useEffect(() => {
    if (!user || !id) return;

    // Patients can only view their own profile
    if (user.role === "PATIENT" && String(user.id) !== String(id)) {
      router.replace(`/patients/${user.id}`);
      return;
    }

    const recordsUrl = user.role === "PATIENT"
      ? "/api/records/get"
      : `/api/records/get?patientId=${id}`;

    Promise.all([
      fetch("/api/users/patients").then((r) => r.json()),
      fetch(recordsUrl).then((r) => r.json()),
      fetch(`/api/users/profile?id=${id}`).then((r) => r.json()),
    ]).then(([pData, rData, profData]) => {
      if (user.role === "PATIENT") {
        setPatient({ id: user.id, name: user.name, email: user.email });
      } else {
        const found = (pData.patients || []).find((p: any) => String(p.id) === String(id));
        setPatient(found || null);
      }
      setRecords(rData.records || []);
      if (profData.user) {
        setProfile(profData.user);
        setAllergies(profData.user.allergies || "");
      }
      const foundPatient = user.role === "PATIENT"
        ? { id: user.id, name: user.name, email: user.email }
        : (pData.patients || []).find((p: any) => String(p.id) === String(id));
      if (foundPatient?.allergies) setAllergies(foundPatient.allergies);
    }).finally(() => setLoading(false));
  }, [user, id]);

  const saveProfile = async (e: any) => {
    e.preventDefault();
    const form = e.target;
    try {
      const res = await fetch("/api/users/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: id,
          phone: form.phone.value,
          dob: form.dob.value || null,
          gender: form.gender.value,
          bloodGroup: form.bloodGroup.value,
          address: form.address.value,
          city: form.city.value,
          state: form.state.value,
          emergencyName: form.emergencyName.value,
          emergencyPhone: form.emergencyPhone.value,
          photoUrl: form.photoUrl.value,
        }),
      });
      const data = await res.json();
      if (res.ok) { setProfile(data.user); setEditingProfile(false); aShow("Profile updated."); }
      else aShow("Failed to save.", "error");
    } catch { aShow("Something went wrong.", "error"); }
  };

  const saveAllergies = async () => {    try {
      await fetch("/api/users/allergies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ patientId: id, allergies }),
      });
      setEditingAllergies(false);
      aShow("Allergies updated.");
    } catch { aShow("Failed to save.", "error"); }
  };

  // Derived medicine history from records
  const medications = [...new Set(records.map((r) => r.prescription).filter(Boolean))];
  const symptoms    = [...new Set(records.map((r) => r.symptoms).filter(Boolean))];

  if (loading) return (
    <div className="min-h-screen bg-slate-50 dark:bg-black p-8">
      <div className="max-w-3xl mx-auto space-y-4">
        {[1,2,3].map((i) => (
          <div key={i} className="bg-white dark:bg-neutral-900 rounded-xl p-6">
            <div className="h-5 bg-slate-200 dark:bg-neutral-900 rounded animate-pulse w-1/3 mb-4" />
            <div className="h-4 bg-slate-100 dark:bg-neutral-900 rounded animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );

  if (!patient) return (
    <div className="min-h-screen bg-slate-50 dark:bg-black flex items-center justify-center">
      <p className="text-slate-500 dark:text-slate-400">Patient not found.</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-black py-10 px-4 text-slate-900 dark:text-slate-100">
      <div className="max-w-3xl mx-auto space-y-6">

        {/* Breadcrumb + back */}
        <div className="flex items-center justify-between fade-in fade-in-1">
          <nav className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
            <button onClick={() => router.push("/records")} className="hover:text-slate-900 dark:hover:text-white transition-colors">Records</button>
            <span>/</span>
            <span className="text-slate-900 dark:text-white font-medium">{patient.name}</span>
          </nav>
          <button onClick={() => router.back()} className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
            </svg>
            Back
          </button>
        </div>

        {/* Profile card */}
        <div className="bg-white dark:bg-neutral-900 rounded-xl shadow p-6 fade-in fade-in-2">
          <div className="flex items-center gap-4 mb-4">
            {profile?.photoUrl ? (
              <PhotoViewer url={profile.photoUrl} size="sm" />
            ) : (
              <div className="w-14 h-14 rounded-full bg-slate-900 dark:bg-slate-100 flex items-center justify-center shrink-0">
                <span className="text-xl font-bold text-white dark:text-slate-900">
                  {patient.name.split(" ").map((n: string) => n[0]).join("").toUpperCase()}
                </span>
              </div>
            )}
            <div>
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white">{patient.name}</h2>
            </div>
          </div>
          <div className="flex justify-center gap-4 text-sm">
            <div className="bg-slate-100 dark:bg-neutral-800 rounded-lg p-3 w-40 text-center">
              <p className="text-slate-500 dark:text-neutral-400 text-xs uppercase tracking-wider mb-1">Total Records</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{records.length}</p>
            </div>
            <div className="bg-slate-100 dark:bg-neutral-800 rounded-lg p-3 w-40 text-center">
              <p className="text-slate-500 dark:text-neutral-400 text-xs uppercase tracking-wider mb-1">Last Visit</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                {records[0] ? new Date(records[0].createdAt).toLocaleDateString() : "—"}
              </p>
            </div>
          </div>
        </div>

        {/* Personal Details */}
        <div className="bg-white dark:bg-neutral-900 rounded-xl shadow p-6 fade-in fade-in-3">
          {aToast && <Toast message={aToast.message} type={aToast.type} onClose={aHide} />}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Personal Details</h2>
            {!editingProfile && user?.role === "PATIENT" && (
              <button onClick={() => setEditingProfile(true)} className="text-xs text-slate-500 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white transition-colors">Edit</button>
            )}
          </div>

          {editingProfile ? (
            <form onSubmit={saveProfile} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><label className="form-label">Phone</label><input name="phone" defaultValue={profile?.phone || ""} className="w-full border border-slate-200 dark:border-neutral-800 px-3 py-2 rounded-lg bg-white dark:bg-neutral-900 dark:text-slate-100 text-sm" /></div>
                <div><label className="form-label">Date of Birth</label><input name="dob" type="date" defaultValue={profile?.dob ? new Date(profile.dob).toISOString().split("T")[0] : ""} className="w-full border border-slate-200 dark:border-neutral-800 px-3 py-2 rounded-lg bg-white dark:bg-neutral-900 dark:text-slate-100 text-sm" /></div>
                <div><label className="form-label">Gender</label>
                  <select name="gender" defaultValue={profile?.gender || ""} className="w-full border border-slate-200 dark:border-neutral-800 px-3 py-2 rounded-lg bg-white dark:bg-neutral-900 dark:text-slate-100 text-sm">
                    <option value="">Select</option>
                    <option>Male</option><option>Female</option><option>Other</option>
                  </select>
                </div>
                <div><label className="form-label">Blood Group</label>
                  <select name="bloodGroup" defaultValue={profile?.bloodGroup || ""} className="w-full border border-slate-200 dark:border-neutral-800 px-3 py-2 rounded-lg bg-white dark:bg-neutral-900 dark:text-slate-100 text-sm">
                    <option value="">Select</option>
                    {["A+","A-","B+","B-","AB+","AB-","O+","O-"].map((b) => <option key={b}>{b}</option>)}
                  </select>
                </div>
                <div className="col-span-2"><label className="form-label">Address</label><input name="address" defaultValue={profile?.address || ""} className="w-full border border-slate-200 dark:border-neutral-800 px-3 py-2 rounded-lg bg-white dark:bg-neutral-900 dark:text-slate-100 text-sm" /></div>
                <div><label className="form-label">City</label><input name="city" defaultValue={profile?.city || ""} className="w-full border border-slate-200 dark:border-neutral-800 px-3 py-2 rounded-lg bg-white dark:bg-neutral-900 dark:text-slate-100 text-sm" /></div>
                <div><label className="form-label">State</label><input name="state" defaultValue={profile?.state || ""} className="w-full border border-slate-200 dark:border-neutral-800 px-3 py-2 rounded-lg bg-white dark:bg-neutral-900 dark:text-slate-100 text-sm" /></div>
                <div><label className="form-label">Emergency Contact</label><input name="emergencyName" defaultValue={profile?.emergencyName || ""} placeholder="Name" className="w-full border border-slate-200 dark:border-neutral-800 px-3 py-2 rounded-lg bg-white dark:bg-neutral-900 dark:text-slate-100 text-sm" /></div>
                <div><label className="form-label">Emergency Phone</label><input name="emergencyPhone" defaultValue={profile?.emergencyPhone || ""} className="w-full border border-slate-200 dark:border-neutral-800 px-3 py-2 rounded-lg bg-white dark:bg-neutral-900 dark:text-slate-100 text-sm" /></div>
                <div className="col-span-2">
                  <label className="form-label">Photo</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const reader = new FileReader();
                        reader.onload = () => {
                          const input = document.getElementById("photoUrlInput") as HTMLInputElement;
                          if (input) input.value = reader.result as string;
                        };
                        reader.readAsDataURL(file);
                      }}
                      className="text-sm text-slate-500 dark:text-neutral-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-medium file:bg-slate-900 file:text-white dark:file:bg-white dark:file:text-black cursor-pointer"
                    />
                    <span className="text-xs text-slate-400 dark:text-neutral-500">or paste URL below</span>
                  </div>
                  <input
                    id="photoUrlInput"
                    name="photoUrl"
                    defaultValue={profile?.photoUrl || ""}
                    placeholder="https://..."
                    className="mt-2 w-full border border-slate-200 dark:border-neutral-800 px-3 py-2 rounded-lg bg-white dark:bg-neutral-900 dark:text-slate-100 text-sm"
                  />
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <button type="submit" className="btn-primary">Save</button>
                <button type="button" onClick={() => setEditingProfile(false)} className="btn-outline">Cancel</button>
              </div>
            </form>
          ) : profile && (Object.values({phone: profile.phone, dob: profile.dob, gender: profile.gender, bloodGroup: profile.bloodGroup}).some(Boolean)) ? (
            <div className="divide-y divide-slate-100 dark:divide-neutral-800">
              {[
                ["Phone", profile.phone],
                ["Date of Birth", profile.dob ? new Date(profile.dob).toLocaleDateString() : null],
                ["Gender", profile.gender],
                ["Blood Group", profile.bloodGroup],
                ["Address", [profile.address, profile.city, profile.state].filter(Boolean).join(", ")],
                ["Emergency Contact", profile.emergencyName ? `${profile.emergencyName}${profile.emergencyPhone ? " · " + profile.emergencyPhone : ""}` : null],
              ].filter(([, v]) => v).map(([label, value]) => (
                <div key={label as string} className="flex gap-4 py-2.5">
                  <span className="text-sm text-slate-500 dark:text-neutral-400 w-36 shrink-0">{label}</span>
                  <span className="text-sm text-slate-900 dark:text-white font-medium">{value}</span>
                </div>
              ))}
              
            </div>
          ) : (
            <p className="text-sm text-slate-400 dark:text-neutral-500 italic">No details added yet. Click Edit to add.</p>
          )}
        </div>

        {/* Timeline */}
        <div className="bg-white dark:bg-neutral-900 rounded-xl shadow p-6 fade-in fade-in-3">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">Record Timeline</h2>
          {records.length === 0 ? (
            <p className="text-slate-500 dark:text-slate-400 text-sm text-center py-8">No records found.</p>
          ) : (
            <div className="relative border-l-2 border-slate-200 dark:border-neutral-800 ml-3 space-y-6">
              {records.map((r) => (
                <div key={r.id} className="relative pl-6 cursor-pointer" onClick={() => router.push(`/records/${r.id}`)}>
                  <div className="absolute -left-[9px] top-2 w-4 h-4 bg-slate-900 dark:bg-white rounded-full border-2 border-white dark:border-slate-800" />
                  <div className="bg-slate-50 dark:bg-neutral-900 p-4 rounded-lg hover:bg-slate-100 dark:hover:bg-neutral-800 transition">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-medium text-slate-900 dark:text-white">{r.diagnosis}</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{r.department} · {r.visitType}</p>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs font-medium shrink-0 ${severityColors[r.severity] || ""}`}>
                        {r.severity}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">{new Date(r.createdAt).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Severity Trend */}
        {records.length > 1 && (
          <div className="bg-white dark:bg-neutral-900 rounded-xl shadow p-6 fade-in fade-in-4">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">Severity Trend</h2>
            <div className="flex items-end gap-2 h-24">
              {[...records].reverse().map((r, i) => {
                const heights: Record<string, number> = { Mild: 25, Moderate: 50, Severe: 75, Critical: 100 };
                const colors: Record<string, string>  = {
                  Mild:     "bg-green-400 dark:bg-green-500",
                  Moderate: "bg-yellow-400 dark:bg-yellow-500",
                  Severe:   "bg-orange-400 dark:bg-orange-500",
                  Critical: "bg-red-500",
                };
                const h = heights[r.severity] || 25;
                return (
                  <div key={r.id} className="flex flex-col items-center gap-1 flex-1 group relative">
                    <div
                      className={`w-full rounded-t-sm ${colors[r.severity] || "bg-slate-300"} transition-all duration-300`}
                      style={{ height: `${h}%` }}
                    />
                    {/* Tooltip */}
                    <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-slate-900 dark:bg-white text-white dark:text-black text-xs rounded px-2 py-1 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                      {r.severity} · {new Date(r.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="flex justify-between mt-2 text-xs text-slate-400 dark:text-neutral-500">
              <span>Oldest</span>
              <span>Latest</span>
            </div>
            <div className="flex gap-4 mt-3 flex-wrap">
              {["Mild","Moderate","Severe","Critical"].map((s) => (
                <div key={s} className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-neutral-400">
                  <div className={`w-2.5 h-2.5 rounded-sm ${{ Mild:"bg-green-400", Moderate:"bg-yellow-400", Severe:"bg-orange-400", Critical:"bg-red-500" }[s]}`} />
                  {s}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Medicine & Symptom History */}
        {records.length > 0 && (
          <div className="bg-white dark:bg-neutral-900 rounded-xl shadow p-6 fade-in fade-in-4">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Medical History</h2>
            <div className="space-y-4">
              <div>
                <p className="text-xs uppercase tracking-wider text-slate-500 dark:text-neutral-400 mb-2">Prescriptions Across Visits</p>
                <div className="flex flex-wrap gap-2">
                  {medications.map((m, i) => (
                    <span key={i} className="px-2.5 py-1 bg-slate-100 dark:bg-neutral-800 text-slate-700 dark:text-slate-300 rounded-full text-xs">{m}</span>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-slate-500 dark:text-neutral-400 mb-2">Reported Symptoms</p>
                <div className="flex flex-wrap gap-2">
                  {symptoms.map((s, i) => (
                    <span key={i} className="px-2.5 py-1 bg-slate-100 dark:bg-neutral-800 text-slate-700 dark:text-slate-300 rounded-full text-xs">{s}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Allergies */}
        <div className="bg-white dark:bg-neutral-900 rounded-xl shadow p-6 fade-in fade-in-5">
          {aToast && <Toast message={aToast.message} type={aToast.type} onClose={aHide} />}
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Known Allergies</h2>
            {!editingAllergies && (
              <button onClick={() => setEditingAllergies(true)} className="text-xs text-slate-500 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white transition-colors">Edit</button>
            )}
          </div>
          {editingAllergies ? (
            <div className="space-y-3">
              <textarea
                value={allergies}
                onChange={(e) => setAllergies(e.target.value)}
                rows={3}
                placeholder="e.g. Penicillin, Peanuts, Latex..."
                className="w-full border border-slate-200 dark:border-neutral-800 px-4 py-2.5 rounded-lg bg-white dark:bg-neutral-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-300 text-sm"
              />
              <div className="flex gap-2">
                <button onClick={saveAllergies} className="btn-primary">Save</button>
                <button onClick={() => setEditingAllergies(false)} className="btn-outline">Cancel</button>
              </div>
            </div>
          ) : (
            <p className="text-sm text-slate-600 dark:text-slate-300">
              {allergies || <span className="text-slate-400 dark:text-neutral-500 italic">No allergies recorded.</span>}
            </p>
          )}
        </div>

        {/* Settings */}
        <ChangePasswordSection />

        {/* Danger zone — only patients can delete their own account */}
        {user?.role === "PATIENT" && String(user?.id) === String(id) && (
          <DangerZone router={router} show={aShow} />
        )}

      </div>
    </div>
  );
}
