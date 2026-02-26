"use client";

import { useContext } from "react";
import AuthContext from "@/context/AuthContext";

export default function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) return { user: null, loading: false, refreshAuth: async () => {} };
  return ctx;
}
