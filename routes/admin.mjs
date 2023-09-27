import express from 'express';
import multer from 'multer';
import { addProduct } from '../helpers/product-helpers.mjs';
import products from '../public/javascripts/products.json' assert { type: "json" };
import { db } from '../config/connection.mjs';
const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/images/products/'); // Save images to the 'public/images/products/' directory
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage });

router.get('/', async (req, res, next) => {
  res.render('admin/view-products', { products, admin: true });
});

router.get('/add-products', (req, res, next) => {
  res.render('admin/add-products');
});

router.post('/add-products', upload.single('productImage'), async (req, res) => {
  const data = {
    productTitle: req.body.productTitle,
    productPrice: req.body.productPrice,
    productStarCount: req.body.productStarCount,
    category: req.body.category,
    productImage: req.file.path, // Save the image path in the product data
  };

  await addProduct(data);
  res.redirect('/admin');
});

export default router;