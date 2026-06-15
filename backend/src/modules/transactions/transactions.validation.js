const { z } = require('zod');

const createTransactionSchema = z.object({
  params: z.object({
    customerId: z.string().uuid('Invalid customer ID format'),
  }),
  body: z.object({
    amount: z.coerce.number().positive('Transaction amount must be a positive number'),
    note: z.string().optional().nullable(),
    itemsJson: z.any().optional().nullable(),
  }),
});

const getTransactionsSchema = z.object({
  params: z.object({
    customerId: z.string().uuid('Invalid customer ID format'),
  }),
});

module.exports = {
  createTransactionSchema,
  getTransactionsSchema,
};
