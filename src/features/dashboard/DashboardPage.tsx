import { useEffect, useMemo, useState } from "react";
import type { ReactElement } from "react";
import { Bar, BarChart, CartesianGrid, Cell, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import dayjs from "dayjs";
import clsx from "clsx";
import { useAuthStore } from "../../lib/state/authStore";
import { useTransactionsStore } from "../../lib/state/transactionsStore";
import type { FinancialRecord } from "../../types";

const formatCurrency = (value: number): string =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);

export const DashboardPage = (): ReactElement => {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  const {
    summary,
    records,
    filters,
    loading,
    errorMessage,
    setFilters,
    fetchSummary,
    fetchRecords,
    createRecord,
    updateRecord
  } = useTransactionsStore();

  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    amount: 100,
    type: "expense" as FinancialRecord["type"],
    category: "Food",
    date: dayjs().format("YYYY-MM-DD"),
    notes: ""
  });

  useEffect(() => {
    void Promise.all([fetchSummary(), fetchRecords()]);
  }, [fetchSummary, fetchRecords]);

  useEffect(() => {
    void fetchRecords();
  }, [filters.search, filters.type, filters.category, filters.sortBy, filters.sortOrder, fetchRecords]);

  const categories = useMemo(() => Array.from(new Set(records.map((r) => r.category))).sort(), [records]);

  const canEdit = user?.role === "admin";
  const canSeeInsights = user?.role === "admin" || user?.role === "analyst";

  const onSubmitRecord = async (event: React.FormEvent) => {
    event.preventDefault();

    const payload = {
      ...formData,
      amount: Number(formData.amount),
      date: new Date(formData.date).toISOString()
    } satisfies Omit<FinancialRecord, "_id">;

    if (editingId) {
      await updateRecord(editingId, payload);
    } else {
      await createRecord(payload);
    }

    setFormOpen(false);
    setEditingId(null);
  };

  if (!user) {
    return <p>Missing user session.</p>;
  }

  return (
    <div className="dashboard-shell">
      <header className="top-bar">
        <div>
          <h1>Finance Dashboard</h1>
          <p>
            Logged in as <strong>{user.role}</strong> ({user.email})
          </p>
        </div>
        <button onClick={logout}>Logout</button>
      </header>

      <section className="card-grid">
        <article className="metric-card">
          <h3>Total Balance</h3>
          <p>{formatCurrency(summary?.totals.balance ?? 0)}</p>
        </article>
        <article className="metric-card">
          <h3>Income</h3>
          <p>{formatCurrency(summary?.totals.income ?? 0)}</p>
        </article>
        <article className="metric-card">
          <h3>Expenses</h3>
          <p>{formatCurrency(summary?.totals.expenses ?? 0)}</p>
        </article>
      </section>

      <section className="charts-grid">
        <article className="panel">
          <h2>Balance Trend</h2>
          {summary?.trend.length ? (
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={summary.trend}>
                <CartesianGrid strokeDasharray="4 4" stroke="#c9d3d7" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="balance" stroke="#0f766e" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="empty-state">No trend data available.</p>
          )}
        </article>

        <article className="panel">
          <h2>Spending Breakdown</h2>
          {summary?.categoryBreakdown.length ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={summary.categoryBreakdown}>
                <CartesianGrid strokeDasharray="4 4" stroke="#c9d3d7" />
                <XAxis dataKey="category" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="amount" radius={[8, 8, 0, 0]}>
                  {summary.categoryBreakdown.map((entry) => (
                    <Cell key={entry.category} fill={entry.category === "Rent" ? "#1f2937" : "#f97316"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="empty-state">No category data available.</p>
          )}
        </article>
      </section>

      {canSeeInsights ? (
        <section className="panel insights">
          <h2>Insights</h2>
          <div className="insight-grid">
            <div>
              <h4>Highest Spending Category</h4>
              <p>
                {summary?.insights.highestSpendingCategory.category} -{" "}
                {formatCurrency(summary?.insights.highestSpendingCategory.amount ?? 0)}
              </p>
            </div>
            <div>
              <h4>Monthly Expense Comparison</h4>
              <p>{formatCurrency(summary?.insights.monthlyExpenseDelta ?? 0)}</p>
            </div>
            <div>
              <h4>Observation</h4>
              <p>{summary?.insights.observation}</p>
            </div>
          </div>
        </section>
      ) : null}

      <section className="panel">
        <div className="panel-header">
          <h2>Transactions</h2>
          {canEdit ? <button onClick={() => setFormOpen(true)}>Add Transaction</button> : null}
        </div>

        <div className="filter-grid">
          <input
            value={filters.search}
            onChange={(e) => setFilters({ search: e.target.value })}
            placeholder="Search by note"
          />
          <select value={filters.type} onChange={(e) => setFilters({ type: e.target.value as never })}>
            <option value="all">All types</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
          <select value={filters.category} onChange={(e) => setFilters({ category: e.target.value })}>
            <option value="">All categories</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
          <select value={filters.sortBy} onChange={(e) => setFilters({ sortBy: e.target.value as never })}>
            <option value="date">Sort by date</option>
            <option value="amount">Sort by amount</option>
            <option value="category">Sort by category</option>
          </select>
          <select value={filters.sortOrder} onChange={(e) => setFilters({ sortOrder: e.target.value as never })}>
            <option value="desc">Desc</option>
            <option value="asc">Asc</option>
          </select>
        </div>

        {loading ? <p>Loading data...</p> : null}
        {errorMessage ? <p className="error-text">{errorMessage}</p> : null}

        {records.length ? (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Amount</th>
                  <th>Category</th>
                  <th>Type</th>
                  <th>Notes</th>
                  {canEdit ? <th>Actions</th> : null}
                </tr>
              </thead>
              <tbody>
                {records.map((record) => (
                  <tr key={record._id}>
                    <td>{dayjs(record.date).format("DD MMM YYYY")}</td>
                    <td>{formatCurrency(record.amount)}</td>
                    <td>{record.category}</td>
                    <td>
                      <span className={clsx("pill", record.type)}>{record.type}</span>
                    </td>
                    <td>{record.notes || "-"}</td>
                    {canEdit ? (
                      <td>
                        <button
                          onClick={() => {
                            setEditingId(record._id);
                            setFormData({
                              amount: record.amount,
                              type: record.type,
                              category: record.category,
                              date: dayjs(record.date).format("YYYY-MM-DD"),
                              notes: record.notes ?? ""
                            });
                            setFormOpen(true);
                          }}
                        >
                          Edit
                        </button>
                      </td>
                    ) : null}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="empty-state">No transactions found. Adjust filters or add one as admin.</p>
        )}
      </section>

      {formOpen ? (
        <div className="modal-backdrop" onClick={() => setFormOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>{editingId ? "Edit Transaction" : "Add Transaction"}</h3>
            <form onSubmit={onSubmitRecord} className="auth-form">
              <label>
                Amount
                <input
                  type="number"
                  min={1}
                  value={formData.amount}
                  onChange={(e) => setFormData((prev) => ({ ...prev, amount: Number(e.target.value) }))}
                />
              </label>
              <label>
                Type
                <select
                  value={formData.type}
                  onChange={(e) => setFormData((prev) => ({ ...prev, type: e.target.value as "income" | "expense" }))}
                >
                  <option value="income">Income</option>
                  <option value="expense">Expense</option>
                </select>
              </label>
              <label>
                Category
                <input
                  value={formData.category}
                  onChange={(e) => setFormData((prev) => ({ ...prev, category: e.target.value }))}
                />
              </label>
              <label>
                Date
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData((prev) => ({ ...prev, date: e.target.value }))}
                />
              </label>
              <label>
                Notes
                <input
                  value={formData.notes}
                  onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
                />
              </label>
              <button type="submit">Save</button>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
};
