/**
 * Phone number normalization and validation helpers for Mauritanian numbers
 */

/**
 * Normalizes user-inputted phone numbers into the canonical format (+222 + 8 digits).
 * Examples:
 * - "+222 36 12 45 67" -> "+22236124567"
 * - "0022236124567" -> "+22236124567"
 * - "22236124567" -> "+22236124567"
 * - "36124567" -> "+22236124567"
 * 
 * @param {string} phone - Raw phone number input
 * @returns {string} Normalized phone number
 */
const normalizePhone = (phone) => {
  if (!phone || typeof phone !== 'string') {
    return '';
  }

  // Remove spaces, dashes, dots, parentheses, and any other non-digit/non-plus characters
  let clean = phone.replace(/[\s\-\(\)\.]/g, '');

  // Handle double zero international prefix (00222 -> +222)
  if (clean.startsWith('00222')) {
    clean = '+' + clean.substring(2);
  }
  // Handle raw 222 prefix without plus (22236124567 -> +22236124567)
  else if (clean.startsWith('222') && clean.length === 11) {
    clean = '+' + clean;
  }
  // Handle local 8-digit phone numbers (36124567 -> +22236124567)
  else if (/^\d{8}$/.test(clean)) {
    clean = '+222' + clean;
  }

  return clean;
};

/**
 * Checks if a normalized phone number is a valid Mauritanian phone number.
 * Pattern: +222 followed by exactly 8 digits.
 * 
 * @param {string} phone - Normalized phone number
 * @returns {boolean} True if valid, false otherwise
 */
const isValidMauritanianPhone = (phone) => {
  if (!phone) return false;
  return /^\+222\d{8}$/.test(phone);
};

module.exports = {
  normalizePhone,
  isValidMauritanianPhone,
};
