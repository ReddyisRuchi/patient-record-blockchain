"use client";

import { useEffect, useState } from "react";

export default function DonationsPage() {
  const [donations, setDonations] = useState([]);
  const [patients, setPatients] = useState([]);

  const [showAdd, setShowAdd] = useState(false);
  const [showAssign, setShowAssign] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const [selectedDonation, setSelectedDonation] = useState<any>(null);

  // 🔥 NEW FIELDS
  const [type, setType] = useState("");
  const [bloodGroup, setBloodGroup] = useState("");
  const [donorInfo, setDonorInfo] = useState("");
  const [notes, setNotes] = useState("");
  const [location, setLocation] = useState("");
  const [selectedPatient, setSelectedPatient] = useState("");

  const fetchData = async () => {
    const d = await fetch("/api/donations/get").then((r) => r.json());
    setDonations(d.donations || []);

    const p = await fetch("/api/users/patients").then((r) => r.json());
    setPatients(p.patients || p || []);
  };

  useEffect(() => {
    fetchData();
  }, []);

  // CREATE
  const createDonation = async () => {
    if (!type || !location) {
      alert("Fill required fields");
      return;
    }

    await fetch("/api/donations/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        type,
        bloodGroup,
        donorInfo,
        notes,
        currentLocation: location,
      }),
    });

    setShowAdd(false);
    setType("");
    setBloodGroup("");
    setDonorInfo("");
    setNotes("");
    setLocation("");

    fetchData();
  };

  // ASSIGN
  const assignDonation = async () => {
    await fetch("/api/donations/assign", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        donationId: selectedDonation.id,
        patientId: selectedPatient,
      }),
    });

    await fetch("/api/track/add", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        donationId: selectedDonation.id,
        location: "Hospital",
        action: "Assigned to patient",
      }),
    });

    setShowAssign(false);
    fetchData();
  };

  return (
    <div style={{ padding: "20px", color: "#e5e7eb" }}>
      <h1>Donations Registry</h1>

      <button style={primaryBtn} onClick={() => setShowAdd(true)}>
        + Add Donation
      </button>

      {/* TABLE */}
      <div style={tableWrapper}>
        <table style={tableStyle}>
          <thead>
            <tr style={headerRow}>
              <th style={thStyle}>ID</th>
              <th style={thStyle}>Type</th>
              <th style={thStyle}>Status</th>
              <th style={thStyle}>Actions</th>
            </tr>
          </thead>

          <tbody>
            {donations.map((d: any, i: number) => (
              <tr
                key={d.id}
                onClick={() => {
                  setSelectedDonation(d);
                  setShowDetails(true);
                }}
                style={{
                  background: i % 2 ? "#1f2937" : "#111827",
                  cursor: "pointer",
                }}
              >
                <td style={tdStyle}>{d.id}</td>
                <td style={tdStyle}>{d.type}</td>
                <td style={tdStyle}>
                  <span style={statusBadge(d.status)}>{d.status}</span>
                </td>
                <td style={tdStyle}>
                  <button
                    style={assignBtn}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedDonation(d);
                      setShowAssign(true);
                    }}
                  >
                    Assign
                  </button>

                  <a
                    href={`/donation/${d.id}`}
                    style={viewLink}
                    onClick={(e) => e.stopPropagation()}
                  >
                    View
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ADD MODAL */}
      {showAdd && (
        <div style={overlay} onClick={() => setShowAdd(false)}>
          <div style={modal} onClick={(e) => e.stopPropagation()}>
            <h2>Add Donation</h2>

            <input placeholder="Type" value={type} onChange={(e) => setType(e.target.value)} style={input}/>
            <input placeholder="Blood Group" value={bloodGroup} onChange={(e) => setBloodGroup(e.target.value)} style={input}/>
            <input placeholder="Donor Info" value={donorInfo} onChange={(e) => setDonorInfo(e.target.value)} style={input}/>
            <input placeholder="Notes" value={notes} onChange={(e) => setNotes(e.target.value)} style={input}/>
            <input placeholder="Location" value={location} onChange={(e) => setLocation(e.target.value)} style={input}/>

            <button style={primaryBtn} onClick={createDonation}>Submit</button>
            <button style={secondaryBtn} onClick={() => setShowAdd(false)}>Close</button>
          </div>
        </div>
      )}

      {/* ASSIGN MODAL */}
      {showAssign && selectedDonation && (
        <div style={overlay} onClick={() => setShowAssign(false)}>
          <div style={modal} onClick={(e) => e.stopPropagation()}>
            <h2>Assign Donation</h2>

            <select onChange={(e) => setSelectedPatient(e.target.value)} style={input}>
              <option>Select Patient</option>
              {patients.map((p: any) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>

            <button style={primaryBtn} onClick={assignDonation}>Assign</button>
          </div>
        </div>
      )}

      {/* DETAILS */}
      {showDetails && selectedDonation && (
        <div style={overlay} onClick={() => setShowDetails(false)}>
          <div style={modal} onClick={(e) => e.stopPropagation()}>
            <h2>Details</h2>

            <p>ID: {selectedDonation.id}</p>
            <p>Type: {selectedDonation.type}</p>
            <p>Blood Group: {selectedDonation.bloodGroup}</p>
            <p>Donor Info: {selectedDonation.donorInfo}</p>
            <p>Notes: {selectedDonation.notes}</p>
            <p>Status: {selectedDonation.status}</p>

          </div>
        </div>
      )}
    </div>
  );
}

/* STYLES */

const tableWrapper = { marginTop: "20px", overflowX: "auto" as const };

const tableStyle = {
  width: "100%",
  borderCollapse: "collapse" as const,
  background: "#111827",
};

const headerRow = { background: "#1f2937" };

const thStyle = { padding: "12px", textAlign: "left" as const };
const tdStyle = { padding: "12px" };

const primaryBtn = { background: "#3b82f6", color: "white", padding: "8px", borderRadius: "6px" };
const secondaryBtn = { marginLeft: "10px", padding: "8px" };

const assignBtn = { background: "#2563eb", color: "white", padding: "5px", marginRight: "10px" };

const viewLink = { color: "#34d399", textDecoration: "none" };

const statusBadge = (status: string) => ({
  padding: "4px 8px",
  borderRadius: "5px",
  background: status === "assigned" ? "#065f46" : "#78350f",
  color: "white",
});

const overlay = {
  position: "fixed" as const,
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  background: "rgba(0,0,0,0.7)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
};

const modal = {
  background: "#1f2937",
  color: "white",
  padding: "20px",
  borderRadius: "10px",
  minWidth: "320px",
};

const input = {
  display: "block",
  marginBottom: "10px",
  padding: "6px",
  width: "100%",
  background: "#111827",
  color: "white",
  border: "1px solid #374151",
};