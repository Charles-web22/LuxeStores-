import express from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import User from '../models/User.js'
const router = express.Router()
router.post('/register', async (req,res)=>{
  try{
    const {name,email,password,role,phone} = req.body
    const hashed = await bcrypt.hash(password,10)
    const user = await User.create({name,email,password:hashed,role,phone})
    const token = jwt.sign({id:user._id,role:user.role},process.env.JWT_SECRET,{expiresIn:'7d'})
    res.json({token, user:{id:user._id,name:user.name,email:user.email,role:user.role}})
  }catch(e){ res.status(400).json({msg:e.message})}
})
router.post('/login', async (req,res)=>{
  const {email,password} = req.body
  const user = await User.findOne({email})
  if(!user) return res.status(400).json({msg:'User not found'})
  const ok = await bcrypt.compare(password,user.password)
  if(!ok) return res.status(400).json({msg:'Invalid password'})
  const token = jwt.sign({id:user._id,role:user.role},process.env.JWT_SECRET,{expiresIn:'7d'})
  res.json({token, user:{id:user._id,name:user.name,email:user.email,role:user.role}})
})
export default router
