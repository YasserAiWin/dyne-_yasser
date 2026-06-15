/**
 * Request validation middleware using Zod
 */
const validate = (schema) => (req, res, next) => {
  try {
    const parsed = schema.parse({
      body: req.body,
      query: req.query,
      params: req.params,
    });
    
    // Replace req object properties with parsed/validated data (coerced types, etc.)
    if (parsed.body) req.body = parsed.body;
    if (parsed.query) req.query = parsed.query;
    if (parsed.params) req.params = parsed.params;
    
    next();
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        error: 'VALIDATION_ERROR',
        errors: error.errors.map((err) => ({
          field: err.path.slice(1).join('.'), // removes "body", "query" or "params" root
          message: err.message,
        })),
      });
    }
    next(error);
  }
};

module.exports = validate;
