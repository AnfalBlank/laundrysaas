import { AppShell } from "@/components/layout/app-shell";
import { ExpensesView } from "@/components/expenses/expenses-view";
import {
  listExpenses,
  listExpenseCategories,
  getExpenseSummary,
  listBranches,
} from "@/db/repositories";

export const dynamic = "force-dynamic";

export default async function ExpensesPage() {
  // Default to current month
  const now = new Date();
  const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
  const endDate = now;

  const [expenses, categories, summary, branches] = await Promise.all([
    listExpenses({ startDate, endDate, limit: 100 }),
    listExpenseCategories(),
    getExpenseSummary({ startDate, endDate }),
    listBranches(),
  ]);

  return (
    <AppShell title="Expenses" subtitle="Pencatatan biaya operasional bisnis">
      <ExpensesView
        initialExpenses={expenses}
        categories={categories}
        summary={summary}
        branches={branches}
      />
    </AppShell>
  );
}
