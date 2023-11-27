import express from 'express';
import { getAllProducts } from '../helpers/product-helpers.mjs';
import { doSignup, doLogin, addToCart, cartProducts, updateCart, removeProduct, placeOrder, getOrders} from '../helpers/user-helpers.mjs';
import { cartDetails } from '../config/connection.mjs';
const router = express.Router();

//This function is used to check a user is logged in or not, we can call this function where ever we wanna know if a user is logged in or not.
const verifyLogin = (req, res, next) => {
  if(req.session.loggedIn){
    next();
  }else{
    res.redirect('/login');
  }
}

router.get('/', async(req, res, next) => {
  try{
    const userDetails = req.session.user;
    const products = await getAllProducts();
    res.render('users/index', { products, userDetails, isuser: true});
  }catch(error){
    next(error)
  }
});

router.get('/login',(req, res, next) => {
  try{
    res.render('users/login', { auth: true, loginErr: req.session.logInErr});
    req.session.logInErr = null;
  }catch(error){
    next(error)
  }
});

router.get('/signup', (req, res, next) => {
  res.render('users/signup', { auth: true, signUpErr: req.session.signUpErr })
  req.session.signUpErr  = null
})

router.get('/logout', (req, res, next) => {
  req.session.destroy();
  res.redirect('/');
});

router.get('/cart',verifyLogin, async(req, res, next) => {
  try{
    const userDetails = req.session.user;
    let userId = userDetails.user._id;
    let isCartEmpty = false; 
    let products = await cartProducts(userId);
    let amount = 0;
    let totalAmount = 0
    if(products != null){
       amount = products.map( p => p.priceCents * p.quantity)
       totalAmount = amount.reduce((a, b) => a + b, 0)
    }

    if(products == null || products.length === 0){
      isCartEmpty = true
    }

    res.render('users/cart', {cart: true, isuser: true, isCartEmpty, userDetails, products, totalAmount});
  }catch(error){
    next(error)
  }
});

router.post('/signup',async (req, res, next) => {
  try{
    const data = {
      name: req.body.name,
      email: req.body.email,
      userName: req.body.email,
      password: req.body.password,
    }

    const userDetails = await doSignup(data);
    if(userDetails.loginStatus){
      res.redirect('/login');
    }else{
      req.session.signUpErr = userDetails.signUpErr
      res.redirect('/signup');
    }
  }catch(error){
    next(error);
  }
})

router.post('/login', async (req, res, next) => {
  try {
    let userData = {
      userName: req.body.userName,
      password: req.body.password
    }
    const userDetails = await doLogin(userData);

    if (userDetails.loginStatus) {
      req.session.loggedIn = true;
      req.session.user = userDetails;
      res.redirect('/');
    }else{
      req.session.logInErr = userDetails.logInErr;
      res.redirect('/login');
    }
  } catch(error){
    next(error)
  }
});

router.get('/add-to-cart/:id', verifyLogin, async (req, res, next) => {
  try {
    let productId = req.params.id;
    let userId = req.session.user?.user?._id;
    await addToCart(userId, productId);
    res.redirect('/')
  } catch (error) {
    next('Error while adding to cart', error);
  }
});

router.get('/update-cart/:id/:ch', async (req, res, next) => {
  try{
    let userId = req.session.user?.user?._id
    let productId = req.params.id
    let ch = req.params.ch
    await updateCart(userId, productId, ch)
    res.redirect('/cart')
  }catch(error){
    next(error)
  }
})

router.get('/remove-product/:id', async (req, res, next) => {
  try{
    let userId = req.session.user?.user?._id
    let productId = req.params.id
    await removeProduct(userId, productId)
    res.redirect('/cart')
  }catch(error){
    next(error)
  }
})

router.get('/check-out', verifyLogin, async (req, res, next) => {
  try{
    let userId = req.session.user?.user?._id
    let products = await cartProducts(userId)
    if( products != null){
      const amount = products.map(p => p.priceCents * p.quantity)
      const totalAmount = amount.reduce((a,b) => a + b, 0);
      let totalProducts = products.length
      res.render('users/check-out', {isuser: true, amount, totalAmount, totalProducts, products, userId})
    }else{
      res.redirect('/cart')
    }
  }catch(error){
    next(error)
  }
})

router.post('/place-order', verifyLogin, async(req, res, next) => {
  try{
    let orderDetails = {
      userId : req.body.userId,
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      address: req.body.address,
      state: req.body.state,
      zipCode: req.body.zipCode,
      phoneNumber: req.body.phoneNumber,
      paymentMethod: req.body.paymentMethod,
      date: new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })
    }
    let products = await cartProducts(req.body.userId)
    if(products != null){
      orderDetails.productDetails = products.map(p => ({ productId: p._id, quantity: p.quantity }));
      await placeOrder(orderDetails)
      res.redirect('/order-details');
    }else{
      res.redirect('/cart');
    }
  }catch(error){
    console.error(error);
    next(error)
  }
})

router.get('/order-details', verifyLogin, async (req, res, next) => {
  try {
    const userId = req.session.user?.user?._id;
    const userDetails = req.session.user;
    const orderDetails = await getOrders(userId);

    console.log('Order Details:', orderDetails);
    console.log('Products 1 : ',orderDetails.orders[0].products);
    res.render('users/order-details', {
      isuser: true,
      myOrders: true,
      userDetails,
      orderDetails,
    });
  } catch (error) {
    next(error);
  }
});


export default router;