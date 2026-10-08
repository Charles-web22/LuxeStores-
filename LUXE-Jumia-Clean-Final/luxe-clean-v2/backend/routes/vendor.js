import express from 'express'
import Product from '../models/Product.js'
import Order from '../models/Order.js'
import { protect, isVendor } from '../middleware/auth.js'
const router = express.Router()
router.get('/products', protect, isVendor, async (req,res)=>{ const p=await Product.find({vendor:req.user.id}); res.json(p)})
router.post('/products', protect, isVendor, async (req,res)=>{ const p=await Product.create({...req.body,vendor:req.user.id}); res.json(p)})
router.get('/earnings', protect, isVendor, async (req,res)=>{
  const orders=await Order.find({'items.vendor':req.user.id})
  let gross=0, comm=0
  orders.forEach(o=>o.items.forEach(i=>{ if(i.vendor?.toString()===req.user.id){ gross+=i.price*i.qty; comm+=i.commissionAmount}}))
  res.json({gross,commission:comm,net:gross-comm})
})
export default router
