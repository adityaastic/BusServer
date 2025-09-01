import dotenv from 'dotenv'
import express from 'express'
import cors from "cors"
import connectDB from './config/connect.js'   // <-- typo fix (confi -> config)
import { PORT } from './config/config.js'
import userRoutes from './routes/user.js'
import busRoutes from './routes/bus.js'
import ticketRoutes from './routes/ticket.js'
import { buildAdminJS } from './config/Setup.js'
 

dotenv.config()

const app = express()

// Middleware
const corsOptions = {
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}

app.use(cors(corsOptions))
app.use(express.json())

// Routes
app.use('/user', userRoutes)
app.use('/bus', busRoutes)
app.use('/ticket', ticketRoutes)

// Start function
const start = async () => {
  try {
    await connectDB(process.env.MONGO_URI)
    await buildAdminJS(app)

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`✅ Server started on http://localhost:${PORT}/admin`)
    })
  } catch (error) {
    console.log("❌ Error Starting Server -->", error)
    process.exit(1)
  }
}

start()
