var express = require('express');
var router = express.Router();
let products = require('../public/javascripts/products.json');
var productHelpers = require('../helpers/product-helpers');
var newProduct = require('../config/connection');

const { route } = require('./user');
/* GET users listing. */
router.get('/',(req, res, next)=>{
  res.render('admin/view-products',{products,admin:true});
});
router.get('/add-products',(req, res, next)=>{
  res.render('admin/add-products');
});
router.post('/add-products',async (req,res)=>{
  console.log(req.body);
  console.log(req.files);
  
  const data = {
    productTitle: req.body.productTitle,
    productPrice: req.body.productPrice,
    productStarCount: req.body.productStarCount,
    category: req.body.category,
    productImage: req.files.productImage.data
  }

  await newProduct.insertMany([data])
  console.log('Data inserted successfully');
  res.render('index')
})
module.exports = router;