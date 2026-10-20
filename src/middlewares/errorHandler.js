/**
 * 404 Route Not Found Handler
 */
function notFoundHandler(req, res, next) {
  res.status(404).json({
    success: false,
    message: `Resource not found: ${req.method} ${req.originalUrl}`,
  });
}

/**
 * Global Error Handler Middleware
 */
function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || 500;
  console.error("Unhandled Error:", err.stack || err.message);

  res.status(statusCode).json({
    success: false,
    message: err.message || "Internal server error occurred.",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
}

module.exports = {
  notFoundHandler,
  errorHandler,
};
