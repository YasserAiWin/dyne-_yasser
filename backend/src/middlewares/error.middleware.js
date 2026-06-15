const { errorResponse } = require('../utils/apiResponse');

/**
 * Global error handler middleware
 */
const errorMiddleware = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;

  // Log full stack trace only for 500+ internal server errors
  if (statusCode >= 500) {
    console.error('💥 Unhandled Server Error:', err);
  } else {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(`⚠️ Client Error (${statusCode}): ${err.message}`);
    }
  }

  // Prisma unique constraint error
  if (err.code === 'P2002') {
    return errorResponse(res, 'A record with this unique value already exists.', 409, 'UNIQUE_CONSTRAINT_VIOLATION');
  }

  const message = err.message || 'Internal Server Error';
  
  // Consistently return error code (like VALIDATION_ERROR or custom app codes)
  let errorDetails = err.code || null;
  
  // Fallback to stack trace only in development if no explicit error code exists
  if (!errorDetails && process.env.NODE_ENV === 'development') {
    errorDetails = { stack: err.stack };
  }
  
  return errorResponse(
    res,
    message,
    statusCode,
    errorDetails
  );
};

module.exports = errorMiddleware;
