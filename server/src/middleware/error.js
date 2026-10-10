import ApiError from '../utils/ApiError.js';

export function notFoundHandler(req, _res, next) {
  next(ApiError.notFound(`Route not found: ${req.method} ${req.originalUrl}`));
}

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, _next) {
  let error = err;

  // Mongoose bad ObjectId
  if (error.name === 'CastError') {
    error = ApiError.badRequest(`Invalid ${error.path}: ${error.value}`);
  }
  // Mongoose validation
  if (error.name === 'ValidationError') {
    const details = Object.values(error.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }));
    error = ApiError.badRequest('Validation failed', details);
  }
  // Duplicate key
  if (error.code === 11000) {
    const field = Object.keys(error.keyValue || {}).join(', ') || 'field';
    error = ApiError.conflict(`Duplicate value for ${field}`);
  }
  // Multer size
  if (error.code === 'LIMIT_FILE_SIZE') {
    error = ApiError.badRequest('File too large');
  }

  const statusCode = error.statusCode || 500;
  if (statusCode >= 500) {
    // eslint-disable-next-line no-console
    console.error('[error]', err);
  }

  res.status(statusCode).json({
    success: false,
    message: statusCode >= 500 && process.env.NODE_ENV === 'production'
      ? 'Internal server error'
      : error.message,
    ...(error.details ? { details: error.details } : {}),
    ...(process.env.NODE_ENV === 'development' && statusCode >= 500 ? { stack: err.stack } : {}),
  });
}

export default { notFoundHandler, errorHandler };
