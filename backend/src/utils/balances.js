/**
 * Balance calculation helper functions
 */

/**
 * Calculates customer balance based on transactions.
 * Balance = sum(DEBT) - sum(PAYMENT)
 * 
 * @param {Array<Object>} transactions - List of transactions with amount and type
 * @returns {number} 
 */
const calculateCustomerBalance = (transactions = []) => {
  let balance = 0.0;
  
  for (const tx of transactions) {
    const amount = parseFloat(tx.amount || 0);
    if (tx.type === 'DEBT') {
      balance += amount;
    } else if (tx.type === 'PAYMENT') {
      balance -= amount;
    }
  }
  
  return Number(balance.toFixed(2));
};

/**
 * Calculates total outstanding debt for a shop.
 * Outstading Debt is the sum of positive customer balances only.
 * Credit balances (negative) are ignored and do not offset the total.
 * 
 * @param {Array<number>} customerBalances - Array of customer balances
 * @returns {number}
 */
const calculateShopOutstandingDebt = (customerBalances = []) => {
  const positiveBalances = customerBalances.filter(bal => bal > 0);
  const total = positiveBalances.reduce((acc, bal) => acc + bal, 0.0);
  return Number(total.toFixed(2));
};

module.exports = {
  calculateCustomerBalance,
  calculateShopOutstandingDebt,
};
