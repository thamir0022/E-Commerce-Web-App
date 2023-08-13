var express = require('express');
var router = express.Router();
let products = require('../public/javascripts/products.json');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { products });
});

module.exports = router;
