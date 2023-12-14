import express from 'express';
import multer from 'multer';
import { adminLogin } from '../helpers/admin-helpers.mjs';
import { addProduct, getAllProducts, deleteProduct, findProduct, editProduct } from '../helpers/product-helpers.mjs';
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

const verifyLogin = (req, res, next) => {
  if (req.session.adminLoggedIn) {
    next()
  } else {
    res.redirect('/admin/login')
  }
}


router.get('/login', (req, res, next) => {
  try {
    let loginErr = req.session.adminLoginErr;
    res.render('admin/login', { auth: true, loginErr })
    req.session.adminLoginErr = null
  } catch (error) {
    next(error)
  }
})

router.post('/login', async (req, res, next) => {
  try {
    const userId = req.body.userId;
    const password = req.body.password
    let admin = await adminLogin(userId, password)
    console.log('Admin : ', admin);
    if(admin != null){
      req.session.admin = admin;
      req.session.adminLoggedIn = true;
      res.redirect('/admin')
    }else{
      req.session.adminLoginErr = 'Invalid User Id or Password'
      res.redirect('/admin/login')
    }
  } catch (error) {
    next(error)
  }
})

router.get('/logout', verifyLogin, (req, res, next) => {
  try{
    req.session.admin = null
    req.session.adminLoggedIn = false;
    res.redirect('/admin/login')
  }catch(err){
    next(err)
  }
})

router.get('/', verifyLogin, async (req, res, next) => {
  try {
    const products = await getAllProducts();
    const noOfProducts = products.length;
    res.render('admin/view-products', { products, admin: true, noOfProducts });
  } catch (error) {
    next(error); // Forward the error to the error handler
  }
});


router.get('/add-products', verifyLogin, (req, res, next) => {
  res.render('admin/add-products', { admin: true });
});

router.post('/add-products', upload.single('productImage'), async (req, res, next) => {
  try {
    const data = {
      image: 'images/products/' + req.file.originalname, // Save the image path in the product data
      name: req.body.productTitle,
      rating: {
        stars: req.body.productStar,
        count: req.body.productStarCount,
      },
      priceCents: req.body.productPrice,
      keywords: req.body.keywords,
    };

    await addProduct(data);
    res.redirect('/admin');
  } catch (err) {
    next(err);
  }
});

router.get('/delete-product/:id', verifyLogin, (req, res, next) => {
  try {
    let productId = req.params.id;
    deleteProduct(productId);
    res.redirect('/admin')
  } catch (error) {
    next(error);
  }
})

router.get('/edit-product/:id', verifyLogin, async (req, res, next) => {
  let productId = req.params.id
  let product = await findProduct(productId);
  res.render('admin/edit-products', { product, admin: true });
})

router.post('/edit-product/:id', upload.single('productImage'), async (req, res, next) => {
  try {
    const productId = req.params.id;
    const data = {
      name: req.body.productTitle,
      rating: {
        stars: req.body.productStar,
        count: req.body.productStarCount,
      },
      priceCents: req.body.productPrice,
      keywords: req.body.keywords,
    };

    if (req.file) {
      data.image = 'images/products/' + req.file.originalname;
    }

    const updatedProduct = await editProduct(productId, data);

    if (updatedProduct) {
      console.log('Product Updation Success');
      res.redirect('/admin');
    } else {
      res.status(404).send('Error occurred in product updation');
    }
  } catch (error) {
    next('Error in product updation', error);
  }
});

export default router;