export function formatTip(tip) {
  // Convert tip to a floating-point number (assuming tip might be a string)
  tip = parseFloat(tip/1000000000000);

  if (isNaN(tip) || tip === 0) {
    return "0";
  }

  if (tip < 0.01) {
    return "< 0.01";
  }

  if (tip < 1) {
    return parseFloat(tip.toFixed(2)).toString();  // Keep up to two decimal places for tips less than 1
  }

  if (tip >= 1 && tip < 10) {
    return parseFloat(tip.toFixed(1)).toString();  // Keep up to one decimal place for tips between 1 and 10
  }

  if (tip >= 10 && tip < 1000) {
    return Math.round(tip).toString();  // Round to the nearest integer for tips between 10 and 1000
  }

  if (tip >= 1000) {
    return parseFloat((tip / 1000).toFixed(1)).toString() + "k";  // Divide by 1000 and append 'k' for tips greater than 1000
  }
}