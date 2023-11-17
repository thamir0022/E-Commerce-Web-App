import { userDetails, cartDetails } from '../config/connection.mjs';
import { findProduct } from './product-helpers.mjs';

import bcrypt from 'bcrypt';

let doSignup = async (userData) => {
  let response = { user: null, loginStatus: false};
  userData.password = await bcrypt.hash(userData.password, 10)
  try{
    await userDetails.create(userData);
    response.user = userData
    response.loginStatus = true
  }catch(error){
    console.log('Error occured in insertion of user data ',error);
  }
  return response;
}

const doLogin = async (userData) => {
  let response = { user: null, loginStatus: false};

  try {
    const user = await userDetails.findOne({ userName: userData.username });

    if (user) {
      const status = await bcrypt.compare(userData.password, user.password);

      if (status) {
        console.log('LogIn Success');
        response.user = user;
        response.loginStatus = true;
      } else {
        console.log('Incorrect Password!');
      }
    } else {
      console.log("User doesn't exist");
    }
  } catch (error) {
    console.error('Error during login:', error);
  }

  return response;
};

const addToCart = async (userId, productId) => {
  try {
    const product = await findProduct(productId);
    const cart = await cartDetails.findOne({ userId: userId });

    if (cart) {
      // Product is already in the cart, increment the quantity
      const existingProduct = cart.products.find(p => p.productId === productId);
      if (existingProduct) {
        existingProduct.quantity += 1;
      } else {
        // Product is not in the cart, add it
        cart.products.push({
          productId: product._id,
          quantity: 1
        },);
      }

      await cart.save();
      console.log('Product quantity updated in the cart');
    } else {
      // Cart doesn't exist, create a new cart
      await cartDetails.create({
        userId: userId,
        products: [{
          productId: product._id,
          quantity: 1
        }]
      });

      console.log('Product added to a new cart');
    }
  } catch (error) {
    console.error('Error while adding to cart:', error);
    throw new Error('Error while adding to cart: ' + error.message);
  }
};

const updateCart = async (userId, productId, change) => {
  try{
    const cart = await cartDetails.findOne({ userId: userId}) 
    if(cart){
      let product = cart.products.find(product => product.productId === productId)
      if(change == 1){
        product.quantity += 1;
        await cart.save()
      }else if(change == -1){
        product.quantity -= 1;
        await cart.save()
      }
    }
  }catch(error){
    throw(error)
  }
}

const cartProducts = async (userId) => {
  try {
    let cartData = await cartDetails.findOne({ userId: userId });

    if (!cartData || !cartData.products) {
      return -1; // Return -1 for empty cart
    }

    const productIds = cartData.products.map(p => p.productId)
    const productQuantity = cartData.products.map(p => p.quantity)
    
    const productDetailsPromises = productIds.map(async productId => await findProduct(productId));

    try {
      const productDetails = await Promise.all(productDetailsPromises);
      const productsWithQuantity = productDetails.map((product, index) => ({
        ...product,
        quantity: productQuantity[index]
      }));

      return productsWithQuantity;
    } catch (error) {
      console.error(error);
    }
  } catch (error) {
    console.error('Error while fetching cart products:', error);
    throw new Error('Error while fetching cart products');
  }
};

export { doSignup, doLogin, addToCart, cartProducts, updateCart}