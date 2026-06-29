import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { transactionCategoryStyles } from "@/constants";
import {
  cn,
  formatAmount,
  formatDateTime,
  removeSpecialCharacters,
} from "@/lib/utils";

const CategoryBadge = ({ category }: CategoryBadgeProps) => {
  const { borderColor, backgroundColor, textColor, chipBackgroundColor } =
    transactionCategoryStyles[
      category as keyof typeof transactionCategoryStyles
    ] || transactionCategoryStyles.default;

  return (
    <div className={cn("category-badge", borderColor, chipBackgroundColor)}>
      <div className={cn("size-2 rounded-full", backgroundColor)} />
      <p className={cn("text-[12px] font-medium", textColor)}>{category}</p>
    </div>
  );
};

const TransactionsTable = ({ transactions }: TransactionTableProps) => {
  return (
    <Table>
      <TableHeader className="bg-gray-100 dark:bg-gray-800">
        <TableRow className="border-gray-300 dark:border-gray-700">
          <TableHead className="px-2 text-gray-700 dark:text-gray-300">
            Transaction
          </TableHead>
          <TableHead className="px-2 text-gray-700 dark:text-gray-300">
            Amount
          </TableHead>
          <TableHead className="px-2 text-gray-700 dark:text-gray-300">
            Status
          </TableHead>
          <TableHead className="px-2 text-gray-700 dark:text-gray-300">
            Date
          </TableHead>
          <TableHead className="px-2 max-md:hidden text-gray-700 dark:text-gray-300">
            Channel
          </TableHead>
          <TableHead className="px-2 max-md:hidden text-gray-700 dark:text-gray-300">
            Category
          </TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        {transactions.map((t: Transaction) => {
          // demo rows are never pending, so they always read "Success"; only a
          // genuinely pending (real Plaid) transaction shows "Processing"
          const status = t.pending ? "Processing" : "Success";
          const amount = formatAmount(t.amount);

          const isDebit = t.type === "debit";
          const isCredit = t.type === "credit";

          return (
            <TableRow
              key={t.id}
              className="border-gray-200 dark:border-gray-700 dark:bg-gray-900/50">
              <TableCell className="max-w-[250px] pl-2 pr-10">
                <div className="flex items-center gap-3">
                  <h1 className="text-14 truncate font-semibold text-gray-700 dark:text-white">
                    {removeSpecialCharacters(t.name)}
                  </h1>
                </div>
              </TableCell>

              <TableCell
                className={`whitespace-nowrap pl-2 pr-10 font-black ${
                  isDebit
                    ? "text-red-500 dark:text-red-400"
                    : "text-green-600 dark:text-green-400"
                }`}>
                {isDebit ? `−${amount}` : amount}
              </TableCell>

              <TableCell className="pl-2 pr-10">
                <CategoryBadge category={status} />
              </TableCell>

              <TableCell className="min-w-32 pl-2 pr-10 text-gray-600 dark:text-gray-300">
                {formatDateTime(new Date(t.date)).dateTime}
              </TableCell>

              <TableCell className="min-w-24 pl-2 pr-10 capitalize text-gray-600 dark:text-gray-300">
                {t.paymentChannel}
              </TableCell>

              <TableCell className="pl-2 pr-10 max-md:hidden">
                <CategoryBadge category={t.category} />
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
};

export default TransactionsTable;
