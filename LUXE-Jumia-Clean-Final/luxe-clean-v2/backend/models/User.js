import mongoose from 'mongoose'
const schema = new mongoose.Schema({
  name:String, email:{type:String,unique:true}, password:String,
  role:{type:String,enum:['Customer','Vendor','Admin'],default:'Customer'},
  phone:String, storeName:String, isVerifiedVendor:{type:Boolean,default:false},
  commissionRate:{type:Number,default:10},
  // Paystack payout details
  bankCode:String, // e.g., 058 for GTB
  accountNumber:String, // 10 digits
  accountName:String,
  paystackRecipientCode:String,
  totalEarnings:{type:Number,default:0},
  pendingEscrow:{type:Number,default:0}
},{timestamps:true})
export default mongoose.model('User',schema)
