import { formatEther, parseEther } from "viem";

export function formatTip(tip) {
  // Convert tip to a floating-point number (assuming tip might be a string)
  const mEth = parseFloat(formatEther(tip))*1000;

  if (isNaN(mEth) || mEth === 0) {
    return "0";
  }

  if (mEth < 0.01) {
    return "< 0.01";
  }

  if (mEth < 1) {
    return parseFloat(mEth.toFixed(2)).toString();  // Keep up to two decimal places for tips less than 1
  }

  if (mEth >= 1 && mEth < 10) {
    return parseFloat(mEth.toFixed(1)).toString();  // Keep up to one decimal place for tips between 1 and 10
  }

  if (mEth >= 10 && mEth < 1000) {
    return Math.round(mEth).toString();  // Round to the nearest integer for tips between 10 and 1000
  }

  if (mEth >= 1000) {
    return parseFloat((mEth / 1000).toFixed(1)).toString() + "k";  // Divide by 1000 and append 'k' for tips greater than 1000
  }
}