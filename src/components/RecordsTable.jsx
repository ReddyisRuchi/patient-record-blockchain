"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";

export default function RecordsTable({ initialRecords = [] }) {
  const [records, setRecords] = useState(initialRecords || []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    // If initial records provided, skip fetching
    if (initialRecords && initialRecords.length > 0) return;

    let mounted = true;
    setLoading(true);
    api
      .get("/api/records")
      .then((res) => {
        if (!mounted) return;
        setRecords(res.records || []);
      })
      .catch((err) => {
        if (!mounted) return;
        setError(err.message || "Failed to load records");
      })
      .finally(() => mounted && setLoading(false));

    return () => (mounted = false);
  }, [initialRecords]);

  if (loading) return <p>Loading records…</p>;
  if (error) return <p className="error">{error}</p>;
  if (!records || records.length === 0) return <p>No records yet.</p>;

  return (
    <table>
      <thead>
        <tr>
          <th>#</th>
          <th>External ID</th>
          <th>Name</th>
          <th>Age</th>
          <th>Blood Group</th>
          <th>Notes</th>
          <th>Created At</th>
        </tr>
      </thead>
      <tbody>
        {records.map((r, i) => (
          <tr key={r.id}>
            <td>{i + 1}</td>
            <td>{r.externalId || r.id}</td>
            <td>{r.name}</td>
            <td>{r.age}</td>
            <td>{r.bloodGroup || r.blood}</td>
            <td>{r.notes || "-"}</td>
            <td>{r.createdAt ? new Date(r.createdAt).toLocaleString() : "-"}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
