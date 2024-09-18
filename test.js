const fs = require("fs");

const oldProductPath = "/Users/admin/Documents/GitHub/local-heros-API/OldProduct.json"; // Path to the old products JSON file
const newProductPath = "/Users/admin/Documents/GitHub/local-heros-API/NewProduct.json"; // Path to the new products JSON file
let productsToAdd = [];

try {
  // Read and parse OldProduct.json
  const oldProductRawData = fs.readFileSync(oldProductPath);
  const oldProducts = JSON.parse(oldProductRawData); // Parse old products JSON data

  // Read and parse NewProduct.json
  const newProductRawData = fs.readFileSync(newProductPath);
  const newProducts = JSON.parse(newProductRawData); // Parse new products JSON data

  // Iterate over old products and modify them
  for (let index = 0; index < oldProducts.length; index++) {
    const product = oldProducts[index];

    // Remove the `_id` property
    delete product._id;
   let Listname = newProducts.filter((newProduct) => newProduct.itemid === product.itemid);
    // Find matching items from the new products based on `itemid`
    product.itemObject = Listname[0]

    // Push the modified product to the array
    productsToAdd.push(product);
  }

  console.log('====================================');
  console.log(productsToAdd, "productsToAdd");
  console.log('====================================');

} catch (error) {
  console.error("Error reading or processing JSON files:", error);
}
