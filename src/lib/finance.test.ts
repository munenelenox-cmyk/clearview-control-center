import { describe, expect, it } from "vitest";
import { summarizeTransactions } from "./finance";
import { canEditRecords, isAdmin } from "./permissions";

describe("group balance", () => {
  it("subtracts expenses from income", () => {
    const s = summarizeTransactions([
      { kind: "Contribution", amount: 1000 },
      { kind: "Registration fee", amount: "500" },
      { kind: "Expense", amount: 300 },
    ]);
    expect(s).toEqual({ income: 1500, expenses: 300, balance: 1200 });
  });
});

describe("permissions", () => {
  it("only admins and editors can change records", () => {
    expect(canEditRecords("admin")).toBe(true);
    expect(canEditRecords("editor")).toBe(true);
    expect(canEditRecords("viewer")).toBe(false);
    expect(canEditRecords(null)).toBe(false);
  });

  it("only admins manage users and settings", () => {
    expect(isAdmin("admin")).toBe(true);
    expect(isAdmin("editor")).toBe(false);
  });
});
