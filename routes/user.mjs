import express from 'express';
import { getAllProducts } from '../helpers/product-helpers.mjs';
import { doSignup, doLogin } from '../helpers/user-helpers.mjs';
import { userDetails } from '../config/connection.mjs'
const router = express.Router();

router.get('/', async(req, res, next) => {
  let userDetails = req.session.user;
  console.log(userDetails);
  const products = await getAllProducts();
  res.render('users/index', { products, userDetails, isuser: true });
});

router.get('/login', (req, res, next) => {
  res.render('users/login', { auth: true });
});

router.get('/signup', (req, res, next) => {
  res.render('users/signup', { auth: true })
})

router.get('/logout', (req, res, next) => {
  req.session.destroy();
  res.redirect('/');
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
      res.redirect('/login');
    }
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).send('Internal Server Error');
  }
});

export default router;