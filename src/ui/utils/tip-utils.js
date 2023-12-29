import { formatEther, parseEther } from "viem";

export function formatTip(tip, exchangeRate) {
  // Convert tip to a floating-point number (assuming tip might be a string)
  console.debug('tip', tip, exchangeRate)
  const amount = exchangeRate ? parseFloat(formatEther(tip)) / exchangeRate * 1000_000_000 : parseFloat(formatEther(tip));

  if (isNaN(amount) || amount === 0) {
    return "0";
  }

  if (amount < 0.01) {
    return "< 0.01";
  }

  if (amount < 1) {
    return parseFloat(amount.toFixed(2)).toString();  // Keep up to two decimal places for tips less than 1
  }

  if (amount >= 1 && amount < 10) {
    return parseFloat(amount.toFixed(1)).toString();  // Keep up to one decimal place for tips between 1 and 10
  }

  if (amount >= 10 && amount < 1000) {
    return Math.round(amount).toString();  // Round to the nearest integer for tips between 10 and 1000
  }

  if (amount >= 1000) {
    return parseFloat((amount / 1000).toFixed(1)).toString() + "k";  // Divide by 1000 and append 'k' for tips greater than 1000
  }
}