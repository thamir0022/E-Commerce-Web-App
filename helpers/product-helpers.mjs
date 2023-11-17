import { ProductDetails, cartDetails } from '../config/connection.mjs';

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
}

const findProduct = async (productId) => {
  try {
    const product = await ProductDetails.findById(productId);
    const productWithIdToString = { ...product.toObject(), _id: product._id.toString() };
      return productWithIdToString;
  } catch (error) {
    throw error;
  }
}


const deleteProduct = async (productId) => {
  try{
  await ProductDetails.deleteOne({_id: productId});
  console.log('Product deleted successfully');
  }catch(error){
    throw(error);
  }
}

const editProduct = async (productId, data) => {
  try {
    const updatedProduct = await ProductDetails.findByIdAndUpdate(productId, data, { new: true });

    if (!updatedProduct) {
      throw new Error(`Product with ID ${productId} not found`);
    }

    return updatedProduct;
  } catch (error) {
    // You might want to customize the error message or log more information here
    throw new Error(`Error updating product: ${error.message}`);
  }
};


export { addProduct, getAllProducts, deleteProduct, findProduct, editProduct};