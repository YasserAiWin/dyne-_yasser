/**
 * Date utility helper functions
 */

/**
 * Calculates shop status dynamically from expiryDate and isSuspended
 * 
 * Status values:
 * - SUSPENDED: if isSuspended is true
 * - EXPIRED: if current time > expiryDate
 * - EXPIRING_SOON: if remaining days <= 5 and >= 0
 * - ACTIVE: otherwise
 * 
 * @param {Date|string} expiryDate 
 * @param {boolean} isSuspended 
 * @returns {'SUSPENDED' | 'EXPIRED' | 'EXPIRING_SOON' | 'ACTIVE'}
 */
const getShopStatus = (expiryDate, isSuspended) => {
  if (isSuspended) {
    return 'SUSPENDED';
  }

  const now = new Date();
  const expiry = new Date(expiryDate);

  if (now > expiry) {
    return 'EXPIRED';
  }

  // Calculate difference in milliseconds
  const diffTime = expiry.getTime() - now.getTime();
  // Convert to remaining days (ceiling to count partial days as remaining)
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays <= 5 && diffDays >= 0) {
    return 'EXPIRING_SOON';
  }

  return 'ACTIVE';
};

/**
 * Checks if a shop status is active (either ACTIVE or EXPIRING_SOON)
 * @param {Date|string} expiryDate 
 * @param {boolean} isSuspended 
 * @returns {boolean}
 */
const isShopActive = (expiryDate, isSuspended) => {
  const status = getShopStatus(expiryDate, isSuspended);
  return status === 'ACTIVE' || status === 'EXPIRING_SOON';
};

/**
 * Extends subscription expiry date
 * 
 * Rules:
 * - If current expiry date is in the future, extend from current expiry date.
 * - If current expiry date is in the past, extend from today.
 * 
 * @param {Date|string} currentExpiryDate 
 * @param {Object} options 
 * @param {number} [options.addDays] 
 * @param {number} [options.addMonths] 
 * @param {number} [options.addYears] 
 * @param {string} [options.customExpiryDate] 
 * @returns {Date}
 */
const calculateNewExpiryDate = (currentExpiryDate, options) => {
  const now = new Date();
  const currentExpiry = new Date(currentExpiryDate);
  
  // Extend from current expiry date if in future, otherwise from today
  const baseDate = currentExpiry > now ? currentExpiry : now;
  
  const { addDays, addMonths, addYears, customExpiryDate } = options;
  
  if (customExpiryDate) {
    return new Date(customExpiryDate);
  }
  
  const newExpiry = new Date(baseDate);
  
  if (addDays) {
    newExpiry.setDate(newExpiry.getDate() + parseInt(addDays, 10));
  }
  if (addMonths) {
    newExpiry.setMonth(newExpiry.getMonth() + parseInt(addMonths, 10));
  }
  if (addYears) {
    newExpiry.setFullYear(newExpiry.getFullYear() + parseInt(addYears, 10));
  }
  
  return newExpiry;
};

module.exports = {
  getShopStatus,
  isShopActive,
  calculateNewExpiryDate,
};
