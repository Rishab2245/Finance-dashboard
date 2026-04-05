import { create } from "zustand";
import { apiClient } from "../api/client";
import type { DashboardSummary, FinancialRecord } from "../../types";

type Filters = {
  search: string;
  type: "all" | "income" | "expense";
  category: string;
  sortBy: "date" | "amount" | "category";
  sortOrder: "asc" | "desc";
};

type TransactionsState = {
  summary: DashboardSummary | null;
  records: FinancialRecord[];
  filters: Filters;
  loading: boolean;
  errorMessage: string | null;
  setFilters: (payload: Partial<Filters>) => void;
  fetchSummary: () => Promise<void>;
  fetchRecords: () => Promise<void>;
  createRecord: (payload: Omit<FinancialRecord, "_id">) => Promise<void>;
  updateRecord: (id: string, payload: Partial<FinancialRecord>) => Promise<void>;
};

const defaultFilters: Filters = {
  search: "",
  type: "all",
  category: "",
  sortBy: "date",
  sortOrder: "desc"
};

export const useTransactionsStore = create<TransactionsState>((set, get) => ({
  summary: null,
  records: [],
  filters: defaultFilters,
  loading: false,
  errorMessage: null,
  setFilters: (payload) => set({ filters: { ...get().filters, ...payload } }),
  fetchSummary: async () => {
    try {
      set({ loading: true, errorMessage: null });
      const response = await apiClient.get("/api/dashboard/summary");
      set({ summary: response.data, loading: false });
    } catch (error) {
      set({
        loading: false,
        errorMessage: error instanceof Error ? error.message : "Failed to load dashboard"
      });
    }
  },
  fetchRecords: async () => {
    try {
      set({ loading: true, errorMessage: null });
      const { filters } = get();
      const response = await apiClient.get("/api/records", {
        params: {
          search: filters.search || undefined,
          type: filters.type === "all" ? undefined : filters.type,
          category: filters.category || undefined,
          sortBy: filters.sortBy,
          sortOrder: filters.sortOrder
        }
      });
      set({ records: response.data, loading: false });
    } catch (error) {
      set({
        loading: false,
        errorMessage: error instanceof Error ? error.message : "Failed to load records"
      });
    }
  },
  createRecord: async (payload) => {
    await apiClient.post("/api/records", payload);
    await Promise.all([get().fetchRecords(), get().fetchSummary()]);
  },
  updateRecord: async (id, payload) => {
    await apiClient.patch(`/api/records/${id}`, payload);
    await Promise.all([get().fetchRecords(), get().fetchSummary()]);
  }
}));
