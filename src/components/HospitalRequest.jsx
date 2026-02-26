"use client";

import { useState } from "react";

export default function HospitalRequest({ records }) {
  const [msg, setMsg] = useState("");

  const handleRequest = (e) => {
    e.preventDefault();
    const code = e.target.code.value;

    if (code === "HOSP-2025") {
      setMsg("Access granted.");
    } else {
      setMsg("Access denied.");
    }
  };

  return (
    <>
      <h2>4. Hospital Request</h2>
      <form onSubmit={handleRequest}>
        <select>
          {records.map((r) => (
            <option key={r.id}>{r.name}</option>
          ))}
        </select>
        <input name="code" placeholder="Authorization Code" />
        <button>Request</button>
      </form>
      <p>{msg}</p>
    </>
  );
}
