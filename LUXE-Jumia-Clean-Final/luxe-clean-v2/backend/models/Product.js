import mongoose from 'mongoose'
const schema = new mongoose.Schema({
  title:String, description:String, price:Number, oldPrice:Number,
  category:String, stock:Number, images:[String],
  vendor:{type:mongoose.Schema.Types.ObjectId, ref:'User'},
  rating:{type:Number,default:4.5}, isApproved:{type:Boolean,default:true}
},{timestamps:true})
export default mongoose.model('Product',schema)
