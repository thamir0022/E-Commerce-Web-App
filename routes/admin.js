var express = require('express');
var router = express.Router();
let products = require('../public/javascripts/products.json');
const { route } = require('./user');
/* GET users listing. */
router.get('/',(req, res, next)=>{
  res.render('admin/view-products',{products,admin:true});
});
router.get('/add-products',(req, res, next)=>{
  res.render('admin/add-products');
});
router.post('/add-products',(req,res)=>{
  console.log(req.body);
  console.log(req.files);
})
module.exports = router;