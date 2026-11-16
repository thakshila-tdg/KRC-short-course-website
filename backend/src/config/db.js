import mongoose from 'mongoose'
import { config } from './env.js'

mongoose.set('strictQuery', true)

export async function connectDb() {
  try {
    await mongoose.connect(config.mongodbUri, { serverSelectionTimeoutMS: 15000 })
    // Make sure unique indexes (email, slug, references) exist before handling requests
    await Promise.all(Object.values(mongoose.models).map((model) => model.init()))
    console.log(`MongoDB connected: database "${mongoose.connection.name}" on ${mongoose.connection.host}`)
  } catch (err) {
    console.error('\nCould not connect to MongoDB.')
    console.error(`Reason: ${err.message}`)
    console.error('Check these:')
    console.error('  1) MONGODB_URI in backend/.env: password correct, no < > characters, symbols URL-encoded')
    console.error('  2) Atlas > Network Access contains 0.0.0.0/0 (or your IP address)')
    console.error('  3) The Atlas cluster is active and this computer has internet access\n')
    process.exit(1)
  }
}

export async function disconnectDb() {
  await mongoose.disconnect()
}
