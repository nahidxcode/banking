"use client";

import { useMemo, useState } from "react";
import {
  ArrowDownLeft,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Download,
  Receipt,
  Scale,
  Search,
} from "lucide-react";

import Money from "@/components/Money";
import TransactionsTable from "@/components/TransactionsTable";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn, removeSpecialCharacters } from "@/lib/utils";

const ROWS_PER_PAGE = 10;

type TypeFilter = "all" | "credit" | "debit";

const TYPE_FILTERS: { label: string; value: TypeFilter }[] = [
  { label: "All", value: "all" },
  { label: "Money in", value: "credit" },
  { label: "Money out", value: "debit" },
];

const SummaryCard = ({
  label,
  value,
  icon,
  accent,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  accent: string;
}) => (
  <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white px-4 py-3 dark:border-gray-700 dark:bg-gray-900">
    <span
      className={cn(
        "flex size-9 shrink-0 items-center justify-center rounded-md",
        accent,
      )}>
      {icon}
    </span>
    <div className="flex flex-col">
      <p className="text-12 text-gray-600 dark:text-gray-400">{label}</p>
      <Money
        value={value}
        className="text-16 font-bold text-gray-900 dark:text-white"
      />
    </div>
  </div>
);

const TransactionHistoryView = ({
  transactions = [],
}: {
  transactions: Transaction[];
}) => {
  const [query, setQuery] = useState("");
  const [type, setType] = useState<TypeFilter>("all");
  const [category, setCategory] = useState("all");
  const [page, setPage] = useState(1);

  const categories = useMemo(
    () =>
      Array.from(new Set(transactions.map((t) => t.category).filter(Boolean))).sort(),
    [transactions],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return transactions.filter((t) => {
      if (type !== "all" && t.type !== type) return false;
      if (category !== "all" && t.category !== category) return false;
      if (q && !removeSpecialCharacters(t.name).toLowerCase().includes(q))
        return false;
      return true;
    });
  }, [transactions, query, type, category]);

  const totals = useMemo(() => {
    let moneyIn = 0;
    let moneyOut = 0;
    for (const t of filtered) {
      if (t.type === "credit") moneyIn += Math.abs(t.amount);
      else if (t.type === "debit") moneyOut += Math.abs(t.amount);
    }
    return { moneyIn, moneyOut, net: moneyIn - moneyOut };
  }, [filtered]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ROWS_PER_PAGE));
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * ROWS_PER_PAGE;
  const pageRows = filtered.slice(start, start + ROWS_PER_PAGE);

  // Reset to the first page whenever the active filters change the result set.
  const resetPage = () => setPage(1);

  const exportCsv = () => {
    const header = ["Name", "Amount", "Type", "Category", "Channel", "Date"];
    const rows = filtered.map((t) => [
      removeSpecialCharacters(t.name),
      t.amount,
      t.type,
      t.category,
      t.paymentChannel,
      new Date(t.date).toISOString(),
    ]);
    const csv = [header, ...rows]
      .map((row) =>
        row
          .map((cell) => `"${String(cell ?? "").replace(/"/g, '""')}"`)
          .join(","),
      )
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "transactions.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <section className="flex w-full flex-col gap-5">
      {/* Summary */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <SummaryCard
          label="Money in"
          value={totals.moneyIn}
          accent="bg-green-100 text-green-600 dark:bg-green-950/40 dark:text-green-400"
          icon={<ArrowDownLeft size={18} />}
        />
        <SummaryCard
          label="Money out"
          value={totals.moneyOut}
          accent="bg-red-100 text-red-600 dark:bg-red-950/40 dark:text-red-400"
          icon={<ArrowUpRight size={18} />}
        />
        <SummaryCard
          label="Net"
          value={totals.net}
          accent="bg-blue-100 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400"
          icon={<Scale size={18} />}
        />
      </div>

      {/* Controls */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative w-full lg:max-w-xs">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <Input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              resetPage();
            }}
            placeholder="Search transactions"
            className="pl-9 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Type tabs */}
          <div className="flex rounded-md border border-gray-200 bg-white p-0.5 dark:border-gray-700 dark:bg-gray-900">
            {TYPE_FILTERS.map((f) => (
              <button
                key={f.value}
                type="button"
                onClick={() => {
                  setType(f.value);
                  resetPage();
                }}
                className={cn(
                  "rounded px-3 py-1.5 text-14 font-medium transition-colors",
                  type === f.value
                    ? "bg-blue-600 text-white"
                    : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white",
                )}>
                {f.label}
              </button>
            ))}
          </div>

          {/* Category filter */}
          <Select
            value={category}
            onValueChange={(value) => {
              setCategory(value);
              resetPage();
            }}>
            <SelectTrigger className="w-[170px] dark:border-gray-700 dark:bg-gray-900 dark:text-white">
              <SelectValue placeholder="All categories" />
            </SelectTrigger>
            <SelectContent className="dark:border-gray-700 dark:bg-gray-900">
              <SelectItem value="all">All categories</SelectItem>
              {categories.map((c) => (
                <SelectItem key={c} value={c} className="capitalize">
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <button
            type="button"
            onClick={exportCsv}
            disabled={filtered.length === 0}
            className="flex items-center gap-2 rounded-md border border-gray-200 bg-white px-3 py-2 text-14 font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800">
            <Download size={16} />
            Export
          </button>
        </div>
      </div>

      {/* Table / empty state */}
      {pageRows.length > 0 ? (
        <TransactionsTable transactions={pageRows} />
      ) : (
        <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-gray-300 bg-white py-16 text-center dark:border-gray-700 dark:bg-gray-900">
          <span className="flex size-12 items-center justify-center rounded-full bg-gray-100 text-gray-400 dark:bg-gray-800">
            <Receipt size={22} />
          </span>
          <p className="text-14 font-semibold text-gray-900 dark:text-white">
            No transactions found
          </p>
          <p className="text-14 text-gray-500 dark:text-gray-400">
            {transactions.length === 0
              ? "This account has no transactions yet."
              : "Try adjusting your search or filters."}
          </p>
        </div>
      )}

      {/* Pagination */}
      {filtered.length > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-14 text-gray-500 dark:text-gray-400">
            Showing {start + 1}-{Math.min(start + ROWS_PER_PAGE, filtered.length)}{" "}
            of {filtered.length}
          </p>
          {totalPages > 1 && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={currentPage <= 1}
                className="flex items-center gap-1 rounded-md border border-gray-200 px-3 py-1.5 text-14 font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800">
                <ChevronLeft size={16} />
                Prev
              </button>
              <p className="text-14 px-1 text-gray-600 dark:text-gray-300">
                {currentPage} / {totalPages}
              </p>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage >= totalPages}
                className="flex items-center gap-1 rounded-md border border-gray-200 px-3 py-1.5 text-14 font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800">
                Next
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>
      )}
    </section>
  );
};

export default TransactionHistoryView;
