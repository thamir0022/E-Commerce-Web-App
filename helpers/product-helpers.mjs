import { ProductDetails } from '../config/connection.mjs';

async function addProduct(data) {
  try {
    // Check if the 'productImage' property is present in the data
    if (data.productImage) {
      data.productImage = data.productImage.replace('public', ''); // Remove 'public' from the image path to store it as a relative path
    }
    // Use the create method to insert the data into the collection
    await ProductDetails.create(data);
  } catch (error) {
    console.log('Error occurred in insertion:', error);
    throw error; // Throw the error again for external handling if needed
  }
}

export { addProduct };