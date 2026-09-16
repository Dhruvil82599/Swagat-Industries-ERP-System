const { errorResponse } = require('../utils/response');

/**
 * Centralized Error Handling Middleware for Swagat ERP
 */
function errorHandler(err, req, res, next) {
  console.error('[Error caught in errorHandler]:', err);

  // Prisma unique constraint violation (P2002)
  if (err.code === 'P2002') {
    const fields = err.meta?.target ? err.meta.target.join(', ') : 'field';
    return errorResponse(
      res,
      `A record with this ${fields} already exists.`,
      409,
      { constraint: err.meta?.target }
    );
  }

  // Prisma record not found (P2025)
  if (err.code === 'P2025') {
    return errorResponse(res, 'Requested record was not found.', 404);
  }

  // Prisma foreign key violation (P2003)
  if (err.code === 'P2003') {
    return errorResponse(
      res,
      'Operation failed due to related data constraint.',
      400,
      { field: err.meta?.field_name }
    );
  }

  // JSON parsing error
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return errorResponse(res, 'Invalid JSON payload in request body.', 400);
  }

  // Custom validation error thrown as { status, message, errors }
  if (err.status) {
    return errorResponse(res, err.message || 'Validation error', err.status, err.errors);
  }

  // Default internal server error
  const message = process.env.NODE_ENV === 'production' 
    ? 'Internal Server Error' 
    : (err.message || 'Internal Server Error');

  return errorResponse(res, message, 500);
}

module.exports = errorHandler;
