"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import useAuth from "@/hooks/useAuth";

export default function AuditPage() {
  const { user }  = useAuth();
  const router    = useRouter();
  const [log, setLog]       = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/activity")
      .then((r) => r.json())
      .then((d) => setLog(d.activity || []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-16 px-4">
      <div className="mx-auto max-w-3xl">

        <div className="flex items-center justify-between mb-8 fade-in fade-in-1">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Audit Log</h1>
          <button onClick={() => router.back()} className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
            </svg>
            Back
          </button>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl shadow fade-in fade-in-2">
          {loading ? (
            <div className="p-6 space-y-3">
              {[1,2,3,4,5].map((i) => (
                <div key={i} className="flex justify-between">
                  <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse w-2/3" />
                  <div className="h-4 bg-slate-100 dark:bg-slate-700 rounded animate-pulse w-1/5" />
                </div>
              ))}
            </div>
          ) : log.length === 0 ? (
            <div className="p-16 text-center">
              <p className="text-slate-500 dark:text-slate-400">No activity recorded yet.</p>
            </div>
          ) : (
            <div className="divide-y dark:divide-slate-700">
              {log.map((item, i) => (
                <div key={i} className="flex items-start justify-between gap-4 px-6 py-4 hover:bg-slate-50 dark:hover:bg-slate-700 transition cursor-pointer"
                  onClick={() => router.push(`/records/${item.id}`)}>
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 w-2 h-2 rounded-full bg-slate-900 dark:bg-white shrink-0 mt-2" />
                    <div>
                      <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{item.label}</p>
                      <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{item.sub}</p>
                    </div>
                  </div>
                  <span className="text-xs text-slate-400 dark:text-slate-500 whitespace-nowrap">
                    {new Date(item.date).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
