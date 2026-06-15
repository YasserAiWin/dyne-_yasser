/**
 * Standard API response helper functions
 */

const successResponse = (res, message, data = {}, statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

const errorResponse = (res, message, statusCode = 500, errorDetails = null) => {
  let errorCode = 'INTERNAL_SERVER_ERROR';

  if (typeof errorDetails === 'string' && errorDetails) {
    errorCode = errorDetails;
  } else {
    switch (statusCode) {
      case 400:
        errorCode = 'BAD_REQUEST';
        break;
      case 401:
        errorCode = 'UNAUTHORIZED';
        break;
      case 403:
        errorCode = 'FORBIDDEN';
        break;
      case 404:
        errorCode = 'NOT_FOUND';
        break;
      case 409:
        errorCode = 'CONFLICT';
        break;
      default:
        errorCode = 'INTERNAL_SERVER_ERROR';
    }
  }

  const response = {
    success: false,
    message,
    error: errorCode,
  };

  if (errorDetails && typeof errorDetails !== 'string') {
    response.details = errorDetails;
  }

  return res.status(statusCode).json(response);
};

module.exports = {
  successResponse,
  errorResponse,
};
