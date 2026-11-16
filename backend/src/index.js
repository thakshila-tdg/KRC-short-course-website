import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import cookieParser from 'cookie-parser'
import mongoose from 'mongoose'
import { config } from './config/env.js'
import { connectDb } from './config/db.js'
import { authenticate, enforcePasswordChange } from './middleware/auth.js'
import { apiRateLimiter } from './middleware/rateLimit.js'
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js'
import authRoutes from './routes/auth.js'
import courseRoutes from './routes/courses.js'
import applicationRoutes from './routes/applications.js'
import inquiryRoutes from './routes/inquiries.js'
import studentRoutes from './routes/student.js'
import resourceRoutes from './routes/resources.js'
import preferenceRoutes from './routes/preferences.js'
import adminRoutes from './routes/admin.js'
import staffRoutes from './routes/staff.js'

const app = express()
app.disable('x-powered-by')

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }))

// CORS: allow the configured frontend address(es); any localhost port while developing
app.use(cors({
  origin(origin, callback) {
    if (!origin) return callback(null, true) // same-origin proxy, curl, Postman
    const isLocalhost = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)
    if (config.clientUrls.includes(origin) || (!config.isProd && isLocalhost)) {
      return callback(null, true)
    }
    callback(null, false)
  },
  credentials: true
}))

app.use(express.json({ limit: '1mb' }))
app.use(cookieParser())
app.use('/api', apiRateLimiter)
app.use(authenticate)
app.use(enforcePasswordChange)

// Simple request log
app.use((req, res, next) => {
  const start = Date.now()
  res.on('finish', () => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} ${res.statusCode} (${Date.now() - start}ms)`)
  })
  next()
})

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'OUSL Short Courses API Server',
    environment: config.nodeEnv,
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString()
  })
})

app.use('/api/auth', authRoutes)
app.use('/api/courses', courseRoutes)
app.use('/api/applications', applicationRoutes)
app.use('/api/inquiries', inquiryRoutes)
app.use('/api/student', studentRoutes)
app.use('/api/resources', resourceRoutes)
app.use('/api/preferences', preferenceRoutes)
app.use('/api/staff', staffRoutes)
app.use('/api/admin', adminRoutes)

app.use(notFoundHandler)
app.use(errorHandler)

await connectDb()

const server = app.listen(config.port, () => {
  console.log(`OUSL Backend API listening at http://localhost:${config.port}`)
  console.log(`Health check: http://localhost:${config.port}/api/health`)
})

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`\nPort ${config.port} is already in use. Close the other program or change PORT in backend/.env.\n`)
  } else {
    console.error(err)
  }
  process.exit(1)
})

export default app
