import express from 'express'
import Stripe from 'stripe'
import { calculateCommission } from '../config/commission.js'
import Order from '../models/Order.js'
import { protect } from '../middleware/auth.js'
const router = express.Router()
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_dummy')

router.post('/create-payment-intent', protect, async (req,res)=>{
  try{
    const {items} = req.body
    let total=0, commissionTotal=0
    const enriched = items.map(i=>{
      const {rate,commission,vendorPayout} = calculateCommission(i.price*i.qty, i.category)
      total+= i.price*i.qty
      commissionTotal+= commission
      return {...i, commissionRate:rate, commissionAmount:commission, vendorPayout}
    })
    const shipping=1500
    const grandTotal= total+shipping
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(grandTotal*100),
      currency:'ngn',
      metadata:{ commissionTotal: commissionTotal.toString(), vendorPayout: (total-commissionTotal).toString() }
    })
    await Order.create({customer:req.user.id, items:enriched, total, commissionTotal, shipping, grandTotal, stripePaymentIntentId: paymentIntent.id})
    res.json({clientSecret: paymentIntent.client_secret, total, commissionTotal, grandTotal})
  }catch(e){ console.error(e); res.status(500).json({msg:e.message})}
})
export default router
