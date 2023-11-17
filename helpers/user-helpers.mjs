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
      const existingProduct = cart.products.find(p => p._id === productId);
      if (existingProduct) {
        existingProduct.nos += 1;
      } else {
        // Product is not in the cart, add it
        cart.products.push({
          _id: product._id,
          name: product.name,
          image: product.image,
          price: product.priceCents,
          nos: 1
        },);
      }

      await cart.save();
      console.log('Product quantity updated in the cart');
    } else {
      // Cart doesn't exist, create a new cart
      const newCart = await cartDetails.create({
        userId: userId,
        products: [{
          _id: product._id,
          name: product.name,
          image: product.image,
          price: product.priceCents,
          nos: 1
        }]
      });

      console.log('Product added to a new cart');
    }
  } catch (error) {
    console.error('Error while adding to cart:', error);
    throw new Error('Error while adding to cart: ' + error.message);
  }
};


const cartProducts = async (userId) => {
  try {
    let cartData = await cartDetails.findOne({ userId: userId });

    if (!cartData || !cartData.products) {
      return []; // Return an empty array or handle the empty cart case
    }

    return cartData.products;
  } catch (error) {
    console.error('Error while fetching cart products:', error);
    throw new Error('Error while fetching cart products');
  }
};


export { doSignup, doLogin, addToCart, cartProducts}