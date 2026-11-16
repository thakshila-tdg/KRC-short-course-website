import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Loads backend/.env (two folders up from src/config)
dotenv.config({ path: path.resolve(__dirname, '../../.env') })

function fail(message) {
  console.error(`\n[Config error] ${message}`)
  console.error('Fix backend/.env (copy backend/.env.example to backend/.env first) and start again.\n')
  process.exit(1)
}

const nodeEnv = process.env.NODE_ENV || 'development'
const isProd = nodeEnv === 'production'

const mongodbUri = (process.env.MONGODB_URI || '').trim()
if (!/^mongodb(\+srv)?:\/\//.test(mongodbUri)) {
  fail('MONGODB_URI is missing or does not start with mongodb:// or mongodb+srv://')
}
if (/USERNAME|YOUR_CLUSTER|<db_password>|<password>/.test(mongodbUri)) {
  fail('MONGODB_URI still contains placeholder text. Paste your real Atlas connection string.')
}

const jwtSecret = (process.env.JWT_SECRET || '').trim()
if (jwtSecret.length < 32 || /PASTE|CHANGE_ME|put-a-long/i.test(jwtSecret)) {
  fail('JWT_SECRET is missing, too short (min 32 characters) or still the placeholder. Generate a random one.')
}

export const config = {
  port: Number(process.env.PORT) || 5000,
  nodeEnv,
  isProd,
  mongodbUri,
  jwtSecret,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  clientUrls: (process.env.CLIENT_URL || 'http://localhost:5173')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean),
  // Demo helper only; can never be enabled in production
  allowResetTokenInResponse: !isProd && process.env.DEV_RESET_TOKEN_IN_RESPONSE === 'true'
}
