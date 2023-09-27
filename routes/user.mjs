import express from 'express';
import products from '../public/javascripts/products.json' assert { type: "json" };

const router = express.Router();

router.get('/', (req, res, next) => {
  res.render('index', { products, admin: false });
});

export default router;