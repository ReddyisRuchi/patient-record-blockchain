"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";

export default function DonationPage() {
  const { id } = useParams();
  const [history, setHistory] = useState([]);

  // NEW STATES 👇
  const [location, setLocation] = useState("");
  const [action, setAction] = useState("");

  const fetchHistory = () => {
    fetch(`/api/track/history?id=${id}`)
      .then((res) => res.json())
      .then((data) => {
        console.log("History:", data);
        setHistory(data.history || []);
      });
  };

  useEffect(() => {
    if (!id) return;
    fetchHistory();
  }, [id]);

  // NEW FUNCTION 👇
  const addEvent = async () => {
    if (!location || !action) {
      alert("Please fill all fields");
      return;
    }

    await fetch("/api/track/add", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        donationId: Number(id),
        location,
        action,
      }),
    });

    alert("Event added!");

    // clear inputs
    setLocation("");
    setAction("");

    // refresh timeline
    fetchHistory();
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Donation ID: {id}</h1>

      <h2>QR Code:</h2>
      <QRCodeCanvas
        value={`http://localhost:3000/donation/${id}`}
        size={200}
      />

      <p style={{ marginTop: "10px" }}>
        <a href={`/donation/${id}`} target="_blank">
          👉 Click here to simulate scanning QR
        </a>
      </p>

      {/* 🔥 ADD EVENT UI */}
      <h2>Add Event</h2>

      <input
        placeholder="Location"
        value={location}
        onChange={(e) => setLocation(e.target.value)}
        style={{ display: "block", marginBottom: "10px" }}
      />

      <input
        placeholder="Action"
        value={action}
        onChange={(e) => setAction(e.target.value)}
        style={{ display: "block", marginBottom: "10px" }}
      />

      <button onClick={addEvent}>Add Event</button>

      {/* EXISTING HISTORY */}
      <h2 style={{ marginTop: "20px" }}>Journey:</h2>

      {history.length === 0 ? (
        <p>No events yet</p>
      ) : (
        history.map((item: any, index: number) => (
          <div key={index} style={{ marginBottom: "10px" }}>
            <p>
              <strong>{item.action}</strong> at {item.location}
            </p>
            <small>{item.timestamp}</small>
          </div>
        ))
      )}
    </div>
  );
}