export const TRANSACTION_KINDS = [
  "Contribution",
  "Registration fee",
  "Donation",
  "Grant",
  "Expense",
] as const;

export type TransactionLike = { kind: string; amount: number | string };

export function isExpense(kind: string): boolean {
  return kind === "Expense";
}

/** Income is every non-expense entry; balance = income − expenses. */
export function summarizeTransactions(rows: TransactionLike[]) {
  let income = 0;
  let expenses = 0;
  for (const r of rows) {
    const amt = Number(r.amount) || 0;
    if (isExpense(r.kind)) expenses += amt;
    else income += amt;
  }
  return { income, expenses, balance: income - expenses };
}
