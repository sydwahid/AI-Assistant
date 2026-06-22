import express from 'express'
import 'dotenv/config'

// console.log("MONGO URI:", process.env.MONGODB_URI);

import cors from 'cors'
import connectDB from './configs/db.js'
import userRouter from './routes/userRoutes.js'
import chatRouter from './routes/chatRoutes.js'
import messageRouter from './routes/messageRoutes.js'
import creditRouter from './routes/creditRoutes.js'
import { stripeWebhooks } from './controllers/webhooks.js'

const app = express()

await connectDB()

//Stripe webhooks
app.post('/api/stripe', express.raw({ type: 'application/json' }), stripeWebhooks)

//Middleware — restrict CORS in production, open in dev
const corsOptions = process.env.FRONTEND_URL
    ? { origin: [process.env.FRONTEND_URL, 'http://localhost:5173'], credentials: true }
    : {}
app.use(cors(corsOptions))
app.use(express.json())

//Health check for Render (keeps service responsive)
app.get('/health', (req, res) => res.json({ status: 'ok' }))

//Routes
app.get('/', (req, res) => res.send('Server is Live!'))
app.use('/api/user', userRouter)
app.use('/api/chat', chatRouter)
app.use('/api/message', messageRouter)
app.use('/api/credit', creditRouter)


const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
})
