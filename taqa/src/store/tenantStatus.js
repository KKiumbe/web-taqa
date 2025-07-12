// src/store/tenantStore.js
import { create } from "zustand";
import axios from "axios";

export const useTenantStore = create((set, get) => ({
  tenantStatus: "ACTIVE", // default fallback
  error: null,
  isLoading: false,

  fetchTenantStatus: async () => {
    const BASEURL = import.meta.env.VITE_BASE_URL || "https://taqa.co.ke/api";
    const TIMEOUT_MS = 3000; // 3-second timeout
    set({ isLoading: true, error: null });

    try {
      const response = await Promise.race([
        axios.get(`${BASEURL}/tenant/status`, { withCredentials: true }),
        new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), TIMEOUT_MS)),
      ]);

      const status = response.data.status;

      set({
        tenantStatus: status,
        isLoading: false,
        error: status !== "ACTIVE"
          ? {
              message: "Feature disabled due to non-payment of the service.",
              severity: "warning",
            }
          : null,
      });
    } catch (err) {
      let fallbackStatus = "ACTIVE";
      let errorMessage = "Failed to fetch tenant status.";
      let severity = "error";

      if (err.message === "Timeout") {
        console.warn("Tenant status fetch timed out. Using fallback: ACTIVE.");
        // Keep fallbackStatus as "ACTIVE"
      } else if (err.response) {
        const statusCode = err.response.status;
        fallbackStatus = statusCode === 402 ? "EXPIRED" : "DISABLED";
        errorMessage = err.response.data?.error || errorMessage;
        severity = statusCode === 402 ? "warning" : "error";
      }

      set({
        tenantStatus: fallbackStatus,
        isLoading: false,
        error: {
          message: fallbackStatus !== "ACTIVE"
            ? "Feature disabled due to non-payment of the service."
            : errorMessage,
          severity,
        },
      });
    }
  },

  clearError: () => set({ error: null }),

  isApiEnabled: () => get().tenantStatus === "ACTIVE",
}));
