import mongoose from 'mongoose'
const schema = new mongoose.Schema({
  customer:{type:mongoose.Schema.Types.ObjectId, ref:'User'},
  items:[{
    product:{type:mongoose.Schema.Types.ObjectId,ref:'Product'},
    qty:Number, price:Number, category:String,
    commissionRate:Number, commissionAmount:Number, vendorPayout:Number,
    vendor:{type:mongoose.Schema.Types.ObjectId,ref:'User'}
  }],
  total:Number, shipping:Number, commissionTotal:Number, grandTotal:Number,
  // Payment refs
  stripePaymentIntentId:String, // also stores paystack reference
  paystackReference:String,
  // Escrow statuses: Pending Payment -> Paid (Escrow Hold) -> Shipped -> Delivered -> Confirmed by Customer -> Payout Completed
  status:{type:String, enum:['Pending','Paid - Escrow Hold','Shipped','Delivered','Confirmed - Ready for Payout','Payout Completed','Cancelled'], default:'Pending'},
  // Tracking
  escrowHeldAt:Date,
  deliveredAt:Date,
  confirmedAt:Date,
  payoutAt:Date,
  payoutReference:String,
  customerConfirmed:{type:Boolean, default:false},
  // Vendor recipient code for Paystack transfer
  vendorRecipientCode:String
},{timestamps:true})
export default mongoose.model('Order',schema)
