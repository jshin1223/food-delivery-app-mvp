// wyzly/lib/price.ts

/**
 * Converts cents (integer) to Korean Won formatted string.
 * @param cents Amount in cents (integer, e.g., 5000 for ₩50).
 * @returns Formatted string in ₩ (KRW) currency.
 */
export function centsToWon(cents: number): string {
  const won = cents / 100;
  return `₩${won.toLocaleString("ko-KR")}`;
}

/**
 * Converts cents (integer) to US Dollar formatted string.
 * @param cents Amount in cents (integer).
 * @returns Formatted string in $ (USD) currency.
 */
export function centsToDollars(cents: number): string {
  const dollars = cents / 100;
  return `$${dollars.toLocaleString("en-US", { minimumFractionDigits: 2 })}`;
}

/**
 * Formats a price in cents for display in plain number (no currency).
 * @param cents 
 * @returns Number value scaled down to units.
 */
export function formatPriceNumber(cents: number): number {
  return cents / 100;
}
