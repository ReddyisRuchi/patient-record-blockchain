"use client";

import Link from "next/link";
import useAuth from "@/hooks/useAuth";

export default function DashboardPage() {
  const { user } = useAuth();
const submitRoute =
    user?.role === "PATIENT" ? "/patient_submit" : "/doctor_submit";
  return (
    <div className="min-h-screen bg-slate-50 py-16 px-4">
      <div className="mx-auto w-full max-w-5xl">

        {/* Welcome Section */}
        <div className="mb-12 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-blue-600">
            Welcome{user?.name ? `, ${user.name}` : ""} 👋
          </h1>
          <p className="text-slate-500 mt-2">
            Manage patient records securely and efficiently.
          </p>
        </div>

        {/* Action Cards */}
        <div className="grid md:grid-cols-3 gap-6">

          {/* View Records */}
          <div className="card text-center">
            <h3 className="text-xl font-semibold mb-3 text-blue-600">
              View Records
            </h3>
            <p className="text-slate-500 mb-6 text-sm">
              Access and review previously submitted patient records.
            </p>
            <Link href="/records" className="btn-primary w-full">
              Open
            </Link>
          </div>

          
          <div className="card text-center">
            <h3 className="text-xl font-semibold mb-3 text-emerald-600">
              Create Record
            </h3>
            <p className="text-slate-500 mb-6 text-sm">
              Create a Medical Record
            </p>
            <br></br>
            <Link href={submitRoute} className="btn-secondary w-full">
              Create
            </Link>
          </div>

          {/* Verify Record */}
          <div className="card text-center">
            <h3 className="text-xl font-semibold mb-3 text-indigo-600">
              Verify Record
            </h3>
            <p className="text-slate-500 mb-6 text-sm">
              Validate patient record integrity.
            </p>
            <br></br>
            <Link href="/verify" className="btn-outline w-full">
  Verify
</Link> 
          </div>

        </div>

      </div>
    </div>
  );
}