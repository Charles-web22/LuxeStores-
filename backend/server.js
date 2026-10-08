import express from 'express'
import mongoose from 'mongoose'
import cors from 'cors'
import dotenv from 'dotenv'
import authRoutes from './routes/auth.js'
import checkoutRoutes from './routes/checkout.js'
import vendorRoutes from './routes/vendor.js'
import paystackRoutes from './routes/paystack.js'

dotenv.config()
const app=express()
app.use(cors({origin:process.env.FRONTEND_URL}))
app.use(express.json())

app.use('/api/auth',authRoutes)
app.use('/api/checkout',checkoutRoutes) // Stripe
app.use('/api/paystack',paystackRoutes) // Paystack Nigeria
app.use('/api/vendor',vendorRoutes)

app.get('/',(req,res)=>res.json({
  msg:'LUXE Marketplace API - Jumia Style + Stripe + Paystack + Commission',
  endpoints:{
    stripe:'POST /api/checkout/create-payment-intent',
    paystack_init:'POST /api/paystack/initialize',
    paystack_verify:'GET /api/paystack/verify/:reference',
    paystack_webhook:'POST /api/paystack/webhook'
  }
}))

mongoose.connect(process.env.MONGODB_URI||'mongodb://localhost:27017/luxe-marketplace').then(()=>console.log('Mongo connected')).catch(e=>console.log('Mongo error',e.message))
const PORT=process.env.PORT||5000
app.listen(PORT,()=>console.log('Server running on '+PORT+' | Paystack & Stripe ready'))
