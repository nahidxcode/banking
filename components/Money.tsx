import { formatAmount } from "@/lib/utils";

// ৳ symbol a bit bigger/bolder than the digits
const Money = ({
  value,
  className,
}: {
  value: number;
  className?: string;
}) => {
  const formatted = formatAmount(value); // e.g. "৳1,234.00"
  const symbol = formatted.charAt(0);
  const rest = formatted.slice(1);

  return (
    <span className={className}>
      <span className="font-black">{symbol}</span>
      {rest}
    </span>
  );
};

export default Money;
