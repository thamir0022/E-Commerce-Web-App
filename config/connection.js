const mongoose = require('mongoose');
mongoose.connect('mongodb://127.0.0.1:27017/Shopping')
.then(()=>{
  console.log('Database Connected');
})
.catch((err)=>{
  console.log('Failed to connect database.',err);
})

const productDetails = new mongoose.Schema({
  productTitle :{
    type: String,
    required : true
  },
  productPrice:{
    type: String,
    required : true
  },
  productStarCount :{
    type: String,
    required : true
  },
  category:{
    type: String,
    required : true
  },
  productImage:{
    type: Buffer,
    required: true
  }
})

const newProductDetails = new mongoose.model('productdetails', productDetails);
module.exports = newProductDetails;