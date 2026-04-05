export type Role = "viewer" | "analyst" | "admin";

export type User = {
  id: string;
  name: string;
  email: string;
  role: Role;
  isActive: boolean;
};

export type FinancialRecord = {
  _id: string;
  amount: number;
  type: "income" | "expense";
  category: string;
  date: string;
  notes?: string;
};

export type DashboardSummary = {
  totals: {
    income: number;
    expenses: number;
    balance: number;
  };
  trend: Array<{
    month: string;
    income: number;
    expense: number;
    balance: number;
  }>;
  categoryBreakdown: Array<{
    category: string;
    amount: number;
  }>;
  recentActivity: FinancialRecord[];
  insights: {
    highestSpendingCategory: {
      category: string;
      amount: number;
    };
    monthlyExpenseDelta: number;
    observation: string;
  };
};
