import jwt from 'jsonwebtoken'
export const protect = (req,res,next)=>{
  const token = req.headers.authorization?.split(' ')[1]
  if(!token) return res.status(401).json({msg:'No token'})
  try{
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = decoded
    next()
  }catch(e){ return res.status(401).json({msg:'Invalid token'})}
}
export const isVendor = (req,res,next)=> (req.user.role==='Vendor'||req.user.role==='Admin')?next():res.status(403).json({msg:'Vendor only'})
export const isAdmin = (req,res,next)=> req.user.role==='Admin'?next():res.status(403).json({msg:'Admin only'})
