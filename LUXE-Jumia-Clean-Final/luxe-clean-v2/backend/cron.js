import mongoose from 'mongoose'
import dotenv from 'dotenv'
import Order from './models/Order.js'
import axios from 'axios'
dotenv.config()

async function autoReleaseJob(){
  await mongoose.connect(process.env.MONGODB_URI)
  const sevenDaysAgo = new Date(Date.now() - 7*24*60*60*1000)
  const pending = await Order.find({status:'Delivered', deliveredAt:{$lte: sevenDaysAgo}})
  console.log(`Found ${pending.length} orders to auto-release after 7 days`)
  for(const order of pending){
    // In production, call Paystack transfer here (same as admin force-release)
    order.status='Payout Completed'
    order.payoutAt=new Date()
    await order.save()
    console.log(`Auto-released ${order._id}`)
  }
  process.exit(0)
}
autoReleaseJob()
