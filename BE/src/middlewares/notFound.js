const { errorResponse } = require('../utils/response');

/**
 * 404 Route Not Found Middleware
 */
function notFoundHandler(req, res, next) {
  return errorResponse(res, `Route not found: ${req.method} ${req.originalUrl}`, 404);
}

module.exports = notFoundHandler;
