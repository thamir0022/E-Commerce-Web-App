import express from 'express';
import { getAllProducts } from '../helpers/product-helpers.mjs';
const router = express.Router();

router.get('/', async(req, res, next) => {
  const products = await getAllProducts();
  res.render('index', { products, admin: false });
});

export default router;