"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

type RecordType = {
  id: number;
  diagnosis: string;
  symptoms: string;
  prescription: string;
  department: string;
  visitType: string;
  severity: string;
  followUp: string;
  createdAt: string;
};

type EventType = {
  location: string;
  action: string;
  timestamp: number | string;
};

export default function RecordDetailsPage() {
  const params = useParams();
  const id = params?.id;

  const [record, setRecord] = useState<RecordType | null>(null);
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [history, setHistory] = useState<EventType[]>([]);

  const [location, setLocation] = useState("");
  const [action, setAction] = useState("");

  const [loading, setLoading] = useState(true);

  // 🔁 Fetch all data
  useEffect(() => {
    if (!id) return;

    fetchRecord();
    fetchVerification();
    fetchHistory();
  }, [id]);

  // 📄 Fetch record
  const fetchRecord = async () => {
    try {
      const res = await fetch(`/api/records/getById?id=${id}`);
      const data = await res.json();
      setRecord(data.record);
    } catch (err) {
      console.error("Error fetching record:", err);
    } finally {
      setLoading(false);
    }
  };

  // 🔐 Fetch verification (demo-safe)
  const fetchVerification = async () => {
    try {
      const res = await fetch(`/api/records/verify?id=${id}`);
      const data = await res.json();

      // supports both valid / verified
      setIsValid(data.valid ?? data.verified);
    } catch (err) {
      console.error("Error verifying record:", err);
    }
  };

  // 🕒 Fetch history
  const fetchHistory = async () => {
    try {
      const res = await fetch(`/api/track/history?id=${id}`);
      const data = await res.json();
      setHistory(data.history || []);
    } catch (err) {
      console.error("Error fetching history:", err);
    }
  };

  // ➕ Add event
  const handleAddEvent = async () => {
    if (!location || !action) {
      alert("Please fill all fields");
      return;
    }

    try {
      const res = await fetch("/api/track/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          recordId: Number(id), // ✅ FIXED
          location,
          action,
        }),
      });

      if (res.ok) {
        setLocation("");
        setAction("");
        fetchHistory(); // refresh timeline
      } else {
        alert("Failed to add event");
      }
    } catch (err) {
      console.error("Error adding event:", err);
    }
  };

  // TEMP role
  const role = "DOCTOR";

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  if (!record) {
    return <div className="p-6">Record not found</div>;
  }

  return (
    <div className="p-6 space-y-6">

      {/* 🧾 Medical Data */}
      <div className="bg-white p-6 rounded-xl shadow space-y-2">
        <h2 className="text-xl font-semibold">Medical Record</h2>

        <p><strong>Diagnosis:</strong> {record.diagnosis}</p>
        <p><strong>Symptoms:</strong> {record.symptoms}</p>
        <p><strong>Prescription:</strong> {record.prescription}</p>
        <p><strong>Department:</strong> {record.department}</p>
        <p><strong>Visit Type:</strong> {record.visitType}</p>
        <p><strong>Severity:</strong> {record.severity}</p>
        <p><strong>Follow Up:</strong> {record.followUp}</p>
        <p><strong>Date:</strong> {new Date(record.createdAt).toLocaleString()}</p>
      </div>

      {/* 🔐 Verification */}
      <div className="bg-white p-6 rounded-xl shadow">
        <h2 className="text-xl font-semibold mb-2">Verification</h2>

        {isValid === null ? (
          <p>Checking...</p>
        ) : isValid ? (
          <p className="text-green-600 font-bold">✔ VALID</p>
        ) : (
          <p className="text-red-600 font-bold">❌ TAMPERED</p>
        )}
      </div>

      {/* 🩸 Blockchain Timeline */}
      <div className="bg-white p-6 rounded-xl shadow">
        <h2 className="text-xl font-semibold mb-6">
          🩸 Organ / Blood Tracking
        </h2>

        {history.length === 0 ? (
          <p className="text-gray-500">No tracking events yet</p>
        ) : (
          <div className="relative border-l-2 border-gray-200 ml-3 space-y-6">
            {history.map((event, index) => (
              <div key={index} className="relative pl-6">

                {/* Dot */}
                <div className="absolute -left-[9px] top-2 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>

                {/* Card */}
                <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
                  <p className="font-semibold text-gray-800">
                    {event.action}
                  </p>

                  <p className="text-sm text-gray-500 mt-1">
                    📍 {event.location}
                  </p>

                  <p className="text-xs text-gray-400 mt-1">
                    {typeof event.timestamp === "number"
                      ? new Date(event.timestamp * 1000).toLocaleString()
                      : event.timestamp}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ➕ Add Event */}
      {role === "DOCTOR" && (
        <div className="bg-white p-6 rounded-xl shadow space-y-4">
          <h2 className="text-xl font-semibold">
            ➕ Add Tracking Event
          </h2>

          <input
            type="text"
            placeholder="Location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full border p-2 rounded"
          />

          <input
            type="text"
            placeholder="Action (Collected / Transported / Received)"
            value={action}
            onChange={(e) => setAction(e.target.value)}
            className="w-full border p-2 rounded"
          />

          <button
            onClick={handleAddEvent}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Add Event
          </button>
        </div>
      )}
    </div>
  );
}