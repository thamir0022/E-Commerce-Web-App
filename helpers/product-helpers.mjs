import { ProductDetails } from '../config/connection.mjs';

async function addProduct(data) {
  try {
    await ProductDetails.create(data);
  } catch (error) {
    console.log('Error occurred in insertion:', error);
    throw error; // Throw the error again for external handling if needed
  }
}

const getAllProducts = async () => {
  try {
    const products = await ProductDetails.find().exec();

    // Convert the _id field to a string for each document
    const productsWithIdToString = products.map((product) => {
      return { ...product.toObject(), _id: product._id.toString() };
    });

    return productsWithIdToString;
  } catch (error) {
    throw(error);
  }
};

const deleteProduct = async (productId) => {
  try{
  await ProductDetails.deleteOne({_id: productId});
  console.log('Product deleted successfully');
  }catch(error){
    throw(error);
  }
}

export { addProduct, getAllProducts, deleteProduct};