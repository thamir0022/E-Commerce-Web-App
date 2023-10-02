import express, { Router } from 'express';
import { getAllProducts } from '../helpers/product-helpers.mjs';
import { doSignup, doLogin } from '../helpers/user-helpers.mjs';
const router = express.Router();

const verifyLogin = (req, res, next) => {
  if(req.session.loggedIn){
    next();
  }else{
    res.redirect('/login');
  }
}

router.get('/', async(req, res, next) => {
  let userDetails = req.session.user;
  const products = await getAllProducts();
  res.render('users/index', { products, userDetails, isuser: true});
});

router.get('/login', (req, res, next) => {
  if(req.session.loggedIn){
    res.redirect('/');
  }else{
    res.render('users/login', { auth: true, loginErr: req.session.loginErr});
    req.session.loginErr = null;
  }
});

router.get('/signup', (req, res, next) => {
  res.render('users/signup', { auth: true })
})

router.get('/logout', (req, res, next) => {
  req.session.destroy();
  res.redirect('/');
});

router.get('/cart',verifyLogin,(req, res, next) => {
  res.render('users/cart');
});

router.post('/signup',async (req, res, next) => {
  try{
    const data = {
      name: req.body.name,
      email: req.body.email,
      userName: req.body.email,
      password: req.body.password,
    }

    console.log(data);
    await doSignup(data);
    res.redirect('/login');
  }catch(error){
    next(error);
  }
})

router.post('/login', async (req, res, next) => {
  try {
    const user = await doLogin(req.body);

    if (user.loginStatus) {
      req.session.loggedIn = true;
      req.session.user = user;
      res.redirect('/');
    } else {
      req.session.loginErr = 'Invalid Username or password!'
      res.redirect('/login');
    }
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).send('Internal Server Error');
  }
});

//This function is used to check a user is logged in or not, we can call this function where ever we wanna know if a user is logged in or not.


export default router;