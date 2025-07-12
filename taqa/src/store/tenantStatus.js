// src/store/tenantStore.js
import { create } from "zustand";
import axios from "axios";

export const useTenantStore = create((set, get) => ({
  tenantStatus: "ACTIVE", // Assume active by default
  error: null,
  isLoading: false,

  fetchTenantStatus: async () => {
    const BASEURL = import.meta.env.VITE_BASE_URL || "https://taqa.co.ke/api";
    set({ isLoading: true, error: null });

    try {
      const response = await axios.get(`${BASEURL}/tenant-status`, {
        withCredentials: true,
      });
      const status = response.data.status;
      set({
        tenantStatus: status,
        isLoading: false,
        error: status !== "ACTIVE" ? {
          message: "Feature disabled due to non-payment of the service.",
          severity: "warning",
        } : null,
      });
    } catch (err) {
      console.error("fetchTenantStatus error:", err);
      const errorMessage = err.response?.data?.error || "Failed to fetch tenant status.";
      const errorSeverity = err.response?.status === 402 ? "warning" : "error";
      set({
        isLoading: false,
        error: {
          message: err.response?.status === 402 ? "Feature disabled due to non-payment of the service." : errorMessage,
          severity: errorSeverity,
        },
      });
      if (err.response?.status === 402) {
        set({ tenantStatus: err.response.data.status || "EXPIRED" });
      }
    }
  },

  clearError: () => set({ error: null }),

  isApiEnabled: () => get().tenantStatus === "ACTIVE",
}));