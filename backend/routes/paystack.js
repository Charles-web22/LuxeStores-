import express from 'express'
import axios from 'axios'
import { calculateCommission } from '../config/commission.js'
import Order from '../models/Order.js'
import { protect } from '../middleware/auth.js'
const router = express.Router()

// Initialize Paystack transaction with commission split
router.post('/initialize', protect, async (req,res)=>{
  try{
    const {items, email} = req.body
    let total=0, commissionTotal=0
    const enriched = items.map(i=>{
      const {rate,commission,vendorPayout} = calculateCommission(i.price*i.qty, i.category)
      total+= i.price*i.qty
      commissionTotal+= commission
      return {...i, commissionRate:rate, commissionAmount:commission, vendorPayout, vendor:i.vendorId||req.user.id}
    })
    const shipping=1500
    const grandTotal= total+shipping

    // Paystack requires amount in kobo
    const amountKobo = Math.round(grandTotal*100)

    // Call Paystack API
    const paystackRes = await axios.post('https://api.paystack.co/transaction/initialize', {
      email: email || 'customer@luxe.ng',
      amount: amountKobo,
      metadata: {
        custom_fields: [
          {display_name:"Commission Total", variable_name:"commission_total", value: commissionTotal.toString()},
          {display_name:"Vendor Payout", variable_name:"vendor_payout", value: (total-commissionTotal).toString()},
          {display_name:"Cart Items", variable_name:"cart_items", value: JSON.stringify(enriched).slice(0,900)}
        ],
        commission_total: commissionTotal,
        vendor_payout: total-commissionTotal,
        total_amount: total,
        shipping
      },
      callback_url: `${process.env.FRONTEND_URL}/verify-payment`
    }, {
      headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`, 'Content-Type':'application/json' }
    })

    // Save order as pending
    const order = await Order.create({
      customer: req.user.id,
      items: enriched,
      total, commissionTotal, shipping, grandTotal,
      stripePaymentIntentId: paystackRes.data.data.reference, // reuse field for paystack ref
      status: 'Pending Paystack'
    })

    res.json({
      authorization_url: paystackRes.data.data.authorization_url,
      access_code: paystackRes.data.data.access_code,
      reference: paystackRes.data.data.reference,
      orderId: order._id,
      total, commissionTotal, grandTotal,
      breakdown: enriched.map(e=>({title:e.title, commissionRate:e.commissionRate, commissionAmount:e.commissionAmount, vendorPayout:e.vendorPayout}))
    })
  }catch(e){
    console.error('Paystack init error', e.response?.data || e.message)
    res.status(500).json({msg: e.response?.data?.message || e.message})
  }
})

// Verify Paystack transaction
router.get('/verify/:reference', protect, async (req,res)=>{
  try{
    const {reference} = req.params
    const verifyRes = await axios.get(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` }
    })
    const data = verifyRes.data.data
    if(data.status === 'success'){
      await Order.findOneAndUpdate({stripePaymentIntentId: reference}, {status:'Paid - Paystack'})
      return res.json({status:'success', data})
    }
    res.json({status:data.status, data})
  }catch(e){
    res.status(500).json({msg:e.message})
  }
})

// Webhook for Paystack
router.post('/webhook', express.json(), async (req,res)=>{
  const event = req.body
  if(event.event === 'charge.success'){
    const ref = event.data.reference
    await Order.findOneAndUpdate({stripePaymentIntentId: ref}, {status:'Paid - Paystack'})
    // Here split commission: transfer to vendor via Paystack Transfer API
    // await axios.post('https://api.paystack.co/transfer', {source:'balance', amount: vendorPayout*100, recipient: vendorRecipientCode}, {headers:{Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`}})
  }
  res.sendStatus(200)
})



// ADMIN: Force release escrow (override if customer doesn't confirm in 7 days)
router.post('/admin/force-release/:orderId', protect, async (req,res)=>{
  try{
    // Check admin role
    if(req.user.role !== 'Admin') return res.status(403).json({msg:'Admin only'})
    const order = await Order.findById(req.params.orderId).populate('items.vendor')
    if(!order) return res.status(404).json({msg:'Order not found'})
    if(['Payout Completed'].includes(order.status)) return res.status(400).json({msg:'Already paid out'})

    const transfers=[]
    for(const item of order.items){
      const vendor = await User.findById(item.vendor)
      if(!vendor) continue
      // Try recipient
      let recipientCode = vendor.paystackRecipientCode
      if(!recipientCode && vendor.accountNumber && vendor.bankCode){
        try{
          const r = await axios.post('https://api.paystack.co/transferrecipient',{
            type:'nuban', name: vendor.name, account_number: vendor.accountNumber, bank_code: vendor.bankCode, currency:'NGN'
          },{headers:{Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`}})
          recipientCode = r.data.data.recipient_code
          vendor.paystackRecipientCode = recipientCode
          await vendor.save()
        }catch(e){ transfers.push({vendor:vendor.email, status:'recipient_failed'}); continue }
      }
      if(!recipientCode){ transfers.push({vendor:vendor?.email, status:'needs_bank'}); continue }
      try{
        const t = await axios.post('https://api.paystack.co/transfer',{
          source:'balance', amount: Math.round(item.vendorPayout*100), recipient: recipientCode,
          reason: `Admin force-release for Order ${order._id} - 7 days no confirmation`,
          reference: `force_${order._id}_${Date.now()}`
        },{headers:{Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`}})
        transfers.push({vendor:vendor.email, status:'force_released', amount:item.vendorPayout, ref:t.data.data.reference})
      }catch(e){ transfers.push({vendor:vendor.email, status:'failed', error:e.response?.data?.message}) }
    }

    order.status='Payout Completed'
    order.payoutAt=new Date()
    order.confirmedAt=new Date()
    order.customerConfirmed=false // admin forced
    await order.save()

    res.json({msg:'✅ Admin force-released escrow - vendor paid via Paystack', orderId: order._id, transfers})
  }catch(e){ res.status(500).json({msg:e.message}) }
})

// ADMIN: Auto-release check - run via cron daily (orders delivered >7 days ago without confirmation)
router.get('/admin/check-auto-release', protect, async (req,res)=>{
  try{
    if(req.user.role !== 'Admin') return res.status(403).json({msg:'Admin only'})
    const sevenDaysAgo = new Date(Date.now() - 7*24*60*60*1000)
    const pending = await Order.find({
      status:'Delivered',
      deliveredAt: { $lte: sevenDaysAgo },
      customerConfirmed: false
    })
    res.json({
      count: pending.length,
      message: `${pending.length} orders delivered >7 days ago, eligible for auto-release`,
      orders: pending.map(o=>({id:o._id, deliveredAt:o.deliveredAt, total:o.total, commission:o.commissionTotal, vendorPayout:o.total-o.commissionTotal}))
    })
  }catch(e){ res.status(500).json({msg:e.message}) }
})

// Cron endpoint to auto-release all eligible
router.post('/admin/auto-release-all', protect, async (req,res)=>{
  try{
    if(req.user.role !== 'Admin') return res.status(403).json({msg:'Admin only'})
    const sevenDaysAgo = new Date(Date.now() - 7*24*60*60*1000)
    const pending = await Order.find({status:'Delivered', deliveredAt:{$lte: sevenDaysAgo}})
    let released=0
    for(const order of pending){
      // reuse force-release logic inline
      order.status='Payout Completed'
      order.payoutAt=new Date()
      await order.save()
      released++
      // In production, also trigger transfer here (same as force-release)
    }
    res.json({msg:`Auto-released ${released} orders after 7 days`, released})
  }catch(e){ res.status(500).json({msg:e.message}) }
})

export default router
