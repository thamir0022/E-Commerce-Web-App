import mongoose from 'mongoose';

const db = async () => {
  try {
    let dbs = await mongoose.connect('mongodb://127.0.0.1:27017/Shopping');
    console.log('Database Connected');
    return dbs; // Return the Mongoose connection object
  } catch (err) {
    console.error('Failed to connect to the database:', err);
    throw err; // Throw the error again for external handling if needed
  }
};

const productDetailsSchema = new mongoose.Schema({
  image: String,
  name: String,
  rating: {
    stars: Number,
    count: Number,
  },
  priceCents: Number,
  keywords: [String],
});

const userDetailsSchema = new mongoose.Schema({
  name: String,
  email: String,
  userName: String,
  password: String
});

const cartDetailsSchema = new mongoose.Schema({
  userId: String,
  products: [{
    productId: String,
    quantity: Number,
  }]
});

const orderDetailsSchema = new mongoose.Schema({
  userId: String,
  orders: [{
  firstName: String,
  lastName: String,
  address: String,
  state: String,
  zipCode: String,
  phoneNumber: String,
  paymentMethod: String,
  date: String,
  productDetails: [{
    productId: String,
    quantity: Number
  }],
  totalAmount: Number,
  totalProducts: Number,
  paymentStatus: String
  }]
})

const adminDetailsSchema = new mongoose.Schema({
  userId: String,
  password: String
})

const ProductDetails = mongoose.model('ProductDetails', productDetailsSchema);
const userDetails = mongoose.model('userDetails', userDetailsSchema);
const cartDetails = mongoose.model('cartDetails', cartDetailsSchema);
const orderDetails = mongoose.model('orderDetails', orderDetailsSchema);
const admindetails = mongoose.model('admindetails', adminDetailsSchema);

export { db, ProductDetails, userDetails, cartDetails, orderDetails, admindetails};