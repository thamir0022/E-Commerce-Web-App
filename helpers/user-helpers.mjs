import { userDetails, cartDetails, orderDetails } from '../config/connection.mjs';
import { findProduct } from './product-helpers.mjs';
import bcrypt from 'bcrypt';

let doSignup = async (userData) => {
  let response = { user: null, loginStatus: false, signUpErr: null};
  try{
    let userExist = await userDetails.findOne({userName: userData.userName})
    if(!userExist){
      userData.password = await bcrypt.hash(userData.password, 10)
      await userDetails.create(userData);
      response.user = userData
      response.loginStatus = true
    }else{
      response.signUpErr = 'User already exist!'
    }
  }catch(error){
    throw(error)
  }
  return response;
}

const doLogin = async (userData) => {
  let response = { user: null, loginStatus: false, logInErr: null};
  try {
    const user = await userDetails.findOne({ userName: userData.userName });
    if (user) {
      const status = await bcrypt.compare(userData.password, user.password);
      if (status) {
        response.user = user;
        response.loginStatus = true;
      } else {
        response.logInErr = 'Incorrect Password!'
      }
    } else {
      response.logInErr = "User doesn't exist"
    }
  } catch(error){
    throw(error)
  }
  return response;
};

const addToCart = async (userId, productId) => {
  try {
    const product = await findProduct(productId);
    const cart = await cartDetails.findOne({ userId: userId });

    if (cart) {
      // Product is already in the cart, find its index
      const existingProductIndex = cart.products.findIndex(p => p.productId === productId);

      if (existingProductIndex !== -1) {
        // Product is in the cart, increment the quantity
        cart.products[existingProductIndex].quantity++;
      } else {
        // Product is not in the cart, add it
        cart.products.unshift({
          productId: product._id,
          quantity: 1,
        });
      }

      await cart.save();
      console.log('Product quantity updated in the cart');
    } else {
      // Cart doesn't exist, create a new cart
      await cartDetails.create({
        userId: userId,
        products: [{
          productId: product._id,
          quantity: 1,
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
  try {
    const cart = await cartDetails.findOne({ userId });

    if (cart) {
      const existingProduct = cart.products.find(p => p.productId === productId);
      if (existingProduct) {
        if (change == 1 && existingProduct.quantity < 10) {
          // Increment quantity by 1 within the limit (10)
          existingProduct.quantity++;
        } else if (change == -1 && existingProduct.quantity > 1) {
          // Decrement quantity by 1, ensuring it stays above 0
          existingProduct.quantity--;
        }

        await cart.save();
        console.log('Cart updated successfully');
      } else {
        console.log('Product not found in the cart');
      }
    } else {
      console.log('Cart not found');
    }
  } catch (error) {
    console.error('Error while updating cart:', error);
    throw new Error('Error while updating cart: ' + error.message);
  }
};



const removeProduct = async (userId, productId) => {
  try {
    // Find the cart that matches the userId
    let cart = await cartDetails.findOne({ userId: userId });

    if (cart) {
      // Remove the product from the products array based on productId
      cart.products = cart.products.filter(product => product.productId !== productId);

      // Save the updated cart
      await cart.save();

      console.log(`Product with productId ${productId} removed from the cart.`);
    } else {
      console.log('User not found in the cart.');
    }
  } catch (error) {
    throw error;
  }
};


const cartProducts = async (userId) => {
  try {
    let cartData = await cartDetails.findOne({ userId: userId });
    if (!cartData || !cartData.products) {
      return null; // Return null for empty cart
    }

    const productIds = cartData.products.map(p => p.productId)
    const productQuantity = cartData.products.map(p => p.quantity)
    
    const productDetailsPromises = productIds.map(async productId => await findProduct(productId));

    try {
      const productDetails = await Promise.all(productDetailsPromises);
      const productsWithQuantity = productDetails.map((product, index) => ({...product,  quantity: productQuantity[index]}));

      return productsWithQuantity;
    } catch (error) {
      console.error(error);
    }
  } catch (error) {
    console.error('Error while fetching cart products:', error);
    throw new Error('Error while fetching cart products');
  }
};

const placeOrder = async (order) => {
  try {
    const { userId, firstName, lastName, address, state, zipCode, phoneNumber, paymentMethod, date, productDetails } = order;

    const products = await cartProducts(userId);
    const amount = products.reduce((total, p) => total + p.priceCents * p.quantity, 0);

    const newOrder = {
      firstName,
      lastName,
      address,
      state,
      zipCode,
      phoneNumber,
      paymentMethod,
      date,
      productDetails,
      totalAmount: amount,
      totalProducts: products.length,
      status: paymentMethod === 'cod' ? 'placed' : 'pending',
    };

    // Find user orders
    const existingOrders = await orderDetails.findOne({ userId });

    if (existingOrders) {
      // Update existing userOrders document
      existingOrders.orders.unshift(newOrder);
      await existingOrders.save();
    } else {
      // Create new orderDetails document
      const newOrderDetails = await orderDetails.create({
        userId,
        orders: [newOrder],
      });
    }

    // Delete cartDetails for the user
    await cartDetails.findOneAndDelete({ userId });
  } catch (error) {
    console.error("Error placing order:", error.message);
    throw error;
  }
};


const getOrders = async (userId) => {
  try {
    const orders = await orderDetails.findOne({ userId }).lean();

    if (!orders) {
      return null; // Handle the case where orders is null
    }

    const ordersWithIdToString = { ...orders, _id: orders._id.toString() };
    const productIds = ordersWithIdToString.orders.flatMap(order => order.productDetails.map(p => p.productId));

    if (productIds.length === 0) {
      return { ...ordersWithIdToString, orders: [] }; // Handle the case where products array is not available or empty
    }

    const products = await Promise.all(productIds.map(async productId => await findProduct(productId)));

    let ordersWithProducts = ordersWithIdToString.orders.map(order => {
      const productDetails = order.productDetails;

      const mappedProducts = productDetails.map(p => {
        const product = products.find(prod => prod?._id === p.productId);
        return product ? { ...product, _id: product._id.toString(), quantity: p.quantity } : null;
      });

      // Convert _id to string in each order
      const orderWithIdToString = { ...order, _id: order._id.toString(), products: mappedProducts };
      return orderWithIdToString;
    });

    return { ...ordersWithIdToString, orders: ordersWithProducts };
  } catch (error) {
    throw error;
  }
};



export { doSignup, doLogin, addToCart, cartProducts, updateCart, removeProduct, placeOrder, getOrders}