import express from 'express';
import multer from 'multer';
import { addProduct, getAllProducts, deleteProduct } from '../helpers/product-helpers.mjs';
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
  try {
    const products = await getAllProducts();
    res.render('admin/view-products', { products, admin: true });
  } catch (error) {
    next(error); // Forward the error to the error handler
  }
});


router.get('/add-products', (req, res, next) => {
  res.render('admin/add-products');
});

router.post('/add-products', upload.single('productImage'), async (req, res, next) => {
  try {
    const data = {
      image: 'images/products/'+req.file.originalname, // Save the image path in the product data
      name: req.body.productTitle,
      rating:{
        stars: req.body.productStar,
        count : req.body.productStarCount,
      },
      priceCents: req.body.productPrice,
      keywords: req.body.category,
    };

    await addProduct(data);
    res.redirect('/admin');
  } catch (err) {
    next(err);
  }
});

router.get('/delete-product/:id',(req, res, next) => {
  try{
    let productId = req.params.id;
    deleteProduct(productId);
    res.redirect('/admin')
  }catch(error){
    next(error);
  }
})
export default router;