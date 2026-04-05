import { create } from "zustand";
import { persist } from "zustand/middleware";
import axios from "axios";
import { apiClient } from "../api/client";
import type { Role, User } from "../../types";

type AuthState = {
  token: string | null;
  user: User | null;
  status: "idle" | "loading" | "error";
  errorMessage: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  role: () => Role | null;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      status: "idle",
      errorMessage: null,
      login: async (email: string, password: string) => {
        try {
          set({ status: "loading", errorMessage: null });
          const response = await apiClient.post("/api/auth/login", {
            email: email.trim().toLowerCase(),
            password: password.trim()
          });
          set({ token: response.data.token, user: response.data.user, status: "idle" });
        } catch (error) {
          const message =
            axios.isAxiosError<{ message?: string }>(error) && error.response?.data?.message
              ? error.response.data.message
              : "Unable to login";

          set({
            status: "error",
            errorMessage: message
          });
        }
      },
      logout: () => set({ token: null, user: null, status: "idle", errorMessage: null }),
      role: () => get().user?.role ?? null
    }),
    {
      name: "finance-auth"
    }
  )
);
