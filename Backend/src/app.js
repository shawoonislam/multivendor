require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const cookieParser = require('cookie-parser')
const authRoutes = require('./routes/auth')
const adminRoutes = require('./routes/admin')
const productRoutes = require('./routes/product')
const cartRoutes = require('./routes/cart')
const swaggerUi = require('swagger-ui-express')
const swaggerSpecs = require('./config/swagger')
const { apiLimiter } = require('./middlewares/rateLimiter')

const app = express()

//middleware
app.use(express.json({limit: '10kb'}))
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true
}))
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs))
app.use(cookieParser())

// Routes
app.use('/api/v1',apiLimiter)
app.use('/api/v1/auth',authRoutes)
app.use('/api/v1/admin',adminRoutes)
app.use('/api/v1/product',productRoutes)
app.use('/api/v1/cart',cartRoutes)

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
    .then(()=>{
        console.log("MongoDB connected successfully")
    }).catch((err)=>{
        console.log("MongoDB connection error: ", err)
    })


// Server 
const port = process.env.PORT || 5000
app.listen(port,()=>{
    console.log(`Server running on port ${port}`)
})

