"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import api from "@/lib/api";

const inp = "w-full px-4 py-2.5 border border-slate-200 dark:border-neutral-800 rounded-lg bg-white dark:bg-neutral-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-300 transition text-sm";
const sel = inp;

export default function RegisterPage() {
  const [step, setStep]     = useState(1);
  const [error, setError]   = useState("");
  const [loading, setLoading] = useState(false);
  const [accountData, setAccountData] = useState<any>(null);
  const [walletStep, setWalletStep]   = useState<any>(null);
  const router = useRouter();

  // Step 1 — account info
  async function handleStep1(e: any) {
    e.preventDefault();
    setError("");
    const password = e.target.password.value;
    const confirm  = e.target.confirm.value;
    if (password !== confirm) { setError("Passwords do not match"); return; }
    setAccountData({
      name:     e.target.name.value,
      email:    e.target.email.value,
      password,
      role:     e.target.role.value,
    });
    setStep(2);
  }

  // Step 2 — personal details + submit
  async function handleStep2(e: any) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api.post("/api/auth/register", { ...accountData });
      // After register, save personal details
      const loginRes = await api.post("/api/auth/login", { email: accountData.email, password: accountData.password });
      await fetch("/api/users/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone:          e.target.phone.value,
          dob:            e.target.dob.value || null,
          gender:         e.target.gender.value,
          bloodGroup:     e.target.bloodGroup.value,
          address:        e.target.address.value,
          city:           e.target.city.value,
          state:          e.target.state.value,
          emergencyName:  e.target.emergencyName.value,
        }),
      });
      router.push("/login");
    } catch (err: any) {
      setError(err.message || (err.payload?.message) || "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-black">
      <Navbar />

      <div className="flex items-center justify-center py-16 px-4">
        <div className="w-full max-w-lg card">

          {/* Step indicator */}
          <div className="flex items-center gap-2 mb-6">
            {[1, 2].map((s) => (
              <div key={s} className="flex items-center gap-2">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                  step >= s ? "bg-slate-900 dark:bg-white text-white dark:text-black" : "bg-slate-200 dark:bg-neutral-700 text-slate-500"
                }`}>{s}</div>
                {s < 2 && <div className={`h-px w-8 ${step > s ? "bg-slate-900 dark:bg-white" : "bg-slate-200 dark:bg-neutral-700"}`} />}
              </div>
            ))}
            <span className="ml-2 text-sm text-slate-500 dark:text-neutral-400">
              {step === 1 ? "Account Details" : "Personal Details"}
            </span>
          </div>

          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
            {step === 1 ? "Create Account" : "Personal Information"}
          </h2>

          {/* Step 1 */}
          {step === 1 && (
            <form onSubmit={handleStep1} className="space-y-4">
              <div><label className="form-label">Full Name</label><input name="name" required className={inp} /></div>
              <div><label className="form-label">Email</label><input name="email" type="email" required className={inp} /></div>
              <div><label className="form-label">Password</label><input name="password" type="password" required className={inp} /></div>
              <div><label className="form-label">Confirm Password</label><input name="confirm" type="password" required className={inp} /></div>
              <div>
                <label className="form-label">Role</label>
                <select name="role" required className={sel}>
                  <option value="PATIENT">Patient</option>
                  <option value="HEALTHCARE_ADMIN">Healthcare Admin</option>
                  <option value="DONOR">Donor</option>
                </select>
              </div>
              {error && <p className="text-sm text-red-500 text-center">{error}</p>}
              <button type="submit" className="btn-primary w-full">Continue</button>

              {/* MetaMask */}
              <div className="flex items-center gap-3 my-2">
                <div className="flex-1 h-px bg-slate-200 dark:bg-neutral-800" />
                <span className="text-xs text-slate-400 dark:text-neutral-500">or</span>
                <div className="flex-1 h-px bg-slate-200 dark:bg-neutral-800" />
              </div>
              <button type="button" onClick={async () => {
                setError("");
                try {
                  const { ethereum } = window as any;
                  if (!ethereum) { setError("MetaMask not found."); return; }
                  const accounts  = await ethereum.request({ method: "eth_requestAccounts" });
                  const walletAddress = accounts[0];
                  const nonceRes  = await fetch("/api/auth/wallet/nonce", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ walletAddress }) });
                  const { message } = await nonceRes.json();
                  const signature = await ethereum.request({ method: "personal_sign", params: [message, walletAddress] });
                  setWalletStep({ address: walletAddress, signature });
                } catch (err: any) { setError(err.message || "Wallet connection failed"); }
              }} className="w-full flex items-center justify-center gap-3 px-5 py-2.5 rounded-lg border border-slate-200 dark:border-neutral-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-neutral-900 transition-all text-sm font-medium">
                <svg width="18" height="18" viewBox="0 0 318 318" fill="none"><path d="M274.1 35.5L174.6 109.4L193 65.8L274.1 35.5Z" fill="#E2761B" stroke="#E2761B" strokeLinecap="round" strokeLinejoin="round"/><path d="M44.4 35.5L143.1 110.1L125.5 65.8L44.4 35.5Z" fill="#E4761B" stroke="#E4761B" strokeLinecap="round" strokeLinejoin="round"/></svg>
                Continue with MetaMask
              </button>
            </form>
          )}

          {/* Step 2 */}
          {step === 2 && (
            <form onSubmit={handleStep2} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><label className="form-label">Phone *</label><input name="phone" required className={inp} /></div>
                <div><label className="form-label">Date of Birth *</label><input name="dob" type="date" required className={inp} /></div>
                <div>
                  <label className="form-label">Gender *</label>
                  <select name="gender" required className={sel}>
                    <option value="">Select</option>
                    <option>Male</option><option>Female</option><option>Other</option>
                  </select>
                </div>
                <div>
                  <label className="form-label">Blood Group *</label>
                  <select name="bloodGroup" required className={sel}>
                    <option value="">Select</option>
                    {["A+","A-","B+","B-","AB+","AB-","O+","O-"].map((b) => <option key={b}>{b}</option>)}
                  </select>
                </div>
                <div className="col-span-2"><label className="form-label">Address *</label><input name="address" required className={inp} /></div>
                <div><label className="form-label">City *</label><input name="city" required className={inp} /></div>
                <div><label className="form-label">State *</label><input name="state" required className={inp} /></div>
                <div className="col-span-2"><label className="form-label">Emergency Contact *</label><input name="emergencyName" required className={inp} /></div>
              </div>
              {error && <p className="text-sm text-red-500 text-center">{error}</p>}
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setStep(1)} className="btn-outline flex-1">Back</button>
                <button type="submit" disabled={loading} className="btn-primary flex-1">{loading ? "Registering..." : "Complete Registration"}</button>
              </div>
            </form>
          )}

          <p className="text-sm text-center text-slate-500 dark:text-neutral-400 mt-4">
            Already have an account?{" "}
            <a href="/login" className="font-medium text-slate-900 dark:text-white hover:underline">Login</a>
          </p>
        </div>
      </div>

      {/* Wallet name + details modal */}
      {walletStep && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-xl p-6 w-full max-w-lg mx-4 animate-slideUp space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Complete Your Profile</h3>
            <p className="text-xs text-slate-400 dark:text-neutral-500">Wallet: {walletStep.address.slice(0,6)}...{walletStep.address.slice(-4)}</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2"><label className="form-label">Full Name *</label><input id="wName" required placeholder="Your name" className={inp} /></div>
              <div className="col-span-2">
                <label className="form-label">Role *</label>
                <select id="wRole" required className={sel}>
                  <option value="PATIENT">Patient</option>
                  <option value="HEALTHCARE_ADMIN">Healthcare Admin</option>
                  <option value="DONOR">Donor</option>
                </select>
              </div>
              <div><label className="form-label">Phone *</label><input id="wPhone" required className={inp} /></div>
              <div><label className="form-label">Date of Birth *</label><input id="wDob" type="date" required className={inp} /></div>
              <div><label className="form-label">Gender *</label>
                <select id="wGender" required className={sel}>
                  <option value="">Select</option><option>Male</option><option>Female</option><option>Other</option>
                </select>
              </div>
              <div><label className="form-label">Blood Group *</label>
                <select id="wBlood" required className={sel}>
                  <option value="">Select</option>
                  {["A+","A-","B+","B-","AB+","AB-","O+","O-"].map((b) => <option key={b}>{b}</option>)}
                </select>
              </div>
              <div className="col-span-2"><label className="form-label">Address *</label><input id="wAddress" required className={inp} /></div>
              <div><label className="form-label">City *</label><input id="wCity" required className={inp} /></div>
              <div><label className="form-label">State *</label><input id="wState" required className={inp} /></div>
              <div className="col-span-2"><label className="form-label">Emergency Contact *</label><input id="wEName" required className={inp} /></div>
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <div className="flex gap-3 pt-2">
              <button onClick={async () => {
                const get = (id: string) => (document.getElementById(id) as HTMLInputElement)?.value;
                const name = get("wName"); if (!name) { setError("Name is required."); return; }
                const role = (document.getElementById("wRole") as HTMLSelectElement)?.value || "PATIENT";
                setError("");
                // Verify wallet
                const verifyRes = await fetch("/api/auth/wallet/verify", {
                  method: "POST", headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ walletAddress: walletStep.address, signature: walletStep.signature, name, role }),
                });
                if (!verifyRes.ok) { const d = await verifyRes.json(); setError(d.error || "Failed"); return; }
                // Save personal details
                await fetch("/api/users/profile", {
                  method: "POST", headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ phone: get("wPhone"), dob: get("wDob") || null, gender: get("wGender"), bloodGroup: get("wBlood"), address: get("wAddress"), city: get("wCity"), state: get("wState"), emergencyName: get("wEName") }),
                });
                router.push("/dashboard");
              }} className="btn-primary flex-1">Complete Registration</button>
              <button onClick={() => { setWalletStep(null); setError(""); }} className="btn-outline flex-1">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
