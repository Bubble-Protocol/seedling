
export function formatArticleDate(ethTimestamp) {
  const date = new Date(ethTimestamp * 1000);
  const now = new Date();
  
  const monthNames = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];
  
  const day = date.getDate();
  const month = monthNames[date.getMonth()];
  
  // If the date is from the last 11 months, omit the year
  const yearDiff = now.getFullYear() - date.getFullYear();
  const monthDiff = (now.getMonth() - date.getMonth()) + (12 * yearDiff);
  
  if (monthDiff <= 11 && monthDiff >= 0) {
    return `${month} ${day}`;
  } else {
    return `${month} ${day}, ${date.getFullYear()}`;
  }
}
