import { config } from '../config/env.js'

export function notFoundHandler(req, res) {
  res.status(404).json({
    success: false,
    message: `Resource not found: ${req.method} ${req.originalUrl}`
  })
}

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  let status = err.status || err.statusCode || 500
  let message = err.message || 'An unexpected internal server error occurred.'

  if (err.name === 'CastError') {
    status = 400
    message = 'Invalid identifier supplied.'
  } else if (err.name === 'ValidationError' && err.errors) {
    status = 400
    message = Object.values(err.errors).map((e) => e.message).join(' ')
  } else if (err.code === 11000) {
    status = 409
    message = 'A record with the same unique value already exists.'
  }

  if (status >= 500) console.error(`[Error] ${req.method} ${req.originalUrl}:`, err)

  res.status(status).json({
    success: false,
    message: status >= 500 && config.isProd ? 'An unexpected internal server error occurred.' : message,
    ...(config.nodeEnv === 'development' && status >= 500 && { stack: err.stack })
  })
}
