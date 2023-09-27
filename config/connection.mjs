import mongoose from 'mongoose';

const db = async () => {
  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/Shopping');
    console.log('Database Connected');
  } catch (err) {
    console.error('Failed to connect to the database:', err);
    throw err; // Throw the error again for external handling if needed
  }
};

const productDetailsSchema = new mongoose.Schema({
  productTitle: {
    type: String,
    required: true,
  },
  productPrice: {
    type: String,
    required: true,
  },
  productStarCount: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  productImage: {
    type: String,
    required: true,
  },
});

const ProductDetails = mongoose.model('productdetails', productDetailsSchema);

export { db, ProductDetails };