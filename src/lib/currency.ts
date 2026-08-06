export function formatCurrency(amount: number): string {
  if (isNaN(amount) || amount === null || amount === undefined) return "Rs. 0.00";
  return `Rs. ${amount.toLocaleString("en-PK", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function formatQuantity(qty: number): string {
  if (isNaN(qty) || qty === null || qty === undefined) return "0";
  return qty.toLocaleString("en-US");
}
