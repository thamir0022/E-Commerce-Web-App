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

const ProductDetails = mongoose.model('ProductDetails', productDetailsSchema);
const userDetails = mongoose.model('userDetails', userDetailsSchema);

export { db, ProductDetails, userDetails};