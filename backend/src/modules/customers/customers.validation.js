const { z } = require('zod');

const createCustomerSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Customer name must be at least 2 characters'),
    phone: z.string().optional().nullable(),
  }),
});

const updateCustomerSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid customer ID format'),
  }),
  body: z.object({
    name: z.string().min(2, 'Customer name must be at least 2 characters').optional(),
    phone: z.string().optional().nullable(),
  }),
});

const getCustomerSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid customer ID format'),
  }),
});

module.exports = {
  createCustomerSchema,
  updateCustomerSchema,
  getCustomerSchema,
};
