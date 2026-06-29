import { formatAmount } from "@/lib/utils";

// ৳ symbol a bit bigger/bolder than the digits
const Money = ({
  value,
  className,
}: {
  value: number;
  className?: string;
}) => {
  const formatted = formatAmount(value); // abs value, e.g. "৳1,234.00"
  const symbol = formatted.charAt(0);
  const rest = formatted.slice(1);

  // formatAmount drops the sign, so restore it for negatives (e.g. remaining)
  const negative = value < 0;

  return (
    <span className={className}>
      {negative && "-"}
      <span className="font-black">{symbol}</span>
      {rest}
    </span>
  );
};

export default Money;
