/**
 * Global Utility Functions
 */

/**
 * Format a date string into a readable format (e.g., 'Oct 24, 2026')
 * @param {string|Date} dateString - The date to format
 * @returns {string} - Formatted date string
 */
export const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(date);
};

/**
 * Format a number into currency (e.g., '$1,200.00' or '₹1,200')
 * @param {number} amount - The amount to format
 * @param {string} currency - Currency code (default: 'INR')
 * @returns {string} - Formatted currency string
 */
export const formatCurrency = (amount, currency = 'INR') => {
  if (amount === null || amount === undefined) return '';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: currency,
    maximumFractionDigits: 0
  }).format(amount);
};
